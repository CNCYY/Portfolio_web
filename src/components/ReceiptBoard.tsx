import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * 小票展示板（showcase 布局左下角，02 票据选项）：
 * 无底图，小票图片按预设布局错落贴放——
 * 左中右高低起伏、角度交替、相互叠压，参考实拍海报效果。
 *
 * 点击任意小票：灯箱展开（参考 React Bits AcidSquares 的表面物理）——
 * 整组小票被图钉📌钉住、整齐错落铺开，像摆在一张软表面上：
 * 缓慢波浪起伏、鼠标滑过附近小票被掀起（弹簧跟随）、
 * 点击激起涟漪从落点扩散依次推过、出现时从中心向外浮现；
 * 背景米白罩 + 高斯模糊，右上角 × 关闭（点空白 / ESC 亦可）。
 */

/** 小板布局：每张小票的位置 / 宽度 / 旋转 / 层级（百分比相对容器，宽度已整体缩小 40%） */
const LAYOUT = [
  { left: '3%', top: '6%', rot: -11, w: '18%', z: 2 },
  { left: '22%', top: '1%', rot: -2, w: '18.6%', z: 3 },
  { left: '44%', top: '5%', rot: 7, w: '17.4%', z: 2 },
  { left: '63%', top: '0%', rot: 13, w: '18%', z: 1 },
  { left: '10%', top: '43%', rot: 5, w: '18%', z: 2 },
  { left: '37%', top: '37%', rot: -7, w: '19.2%', z: 4 },
];

/** 灯箱布局：整齐错落——横向排开、交替微倾、高低错位（rot 基准倾角，off 纵向错位） */
const PIN_LAYOUT = [
  { rot: -3, off: '1.2vh' },
  { rot: 2, off: '0' },
  { rot: -2, off: '2vh' },
  { rot: 3, off: '0.4vh' },
  { rot: -2, off: '1.6vh' },
  { rot: 2, off: '0.2vh' },
];

/** 风场参数（对齐 AcidSquares 的手感的像素级移植） */
const WIND = {
  hoverRadius: 240, // 鼠标掀起的作用半径
  hoverLift: 16, // 掀起最大抬升
  hoverTilt: 7, // 掀起最大前倾角
  springStiffness: 90, // 弹簧刚度（跟随鼠标）
  springDamping: 19, // 弹簧阻尼
  rippleSpeed: 320, // 涟漪扩散速度 px/s
  rippleWidth: 110, // 涟漪环宽
  rippleTravel: 640, // 涟漪行程（超过即消散）
  rippleLift: 22, // 涟漪推起幅度
  rippleTilt: 6, // 涟漪前倾角
  swellAmp: 2.2, // 静置波浪幅度
  maxRipples: 8,
};

export const ReceiptBoard = ({ items }: { items: string[] }) => {
  const [open, setOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 灯箱打开时支持 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // 灯箱风场：缓慢波浪 + 鼠标掀起（弹簧跟随）+ 点击涟漪，rAF 驱动，
  // 直接写最内层 .receipt-float 的 transform，与外层 intro 动画分层不打架
  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const n = items.length;
    const centers = items.map(() => ({ x: 0, y: 0 }));
    let measured = false;
    const measure = () => {
      const base = stage.getBoundingClientRect();
      cardRefs.current.forEach((el, i) => {
        if (!el || i >= n) return;
        const r = el.getBoundingClientRect();
        centers[i] = { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 };
      });
      measured = true;
    };
    // 等 intro 浮现动画结束后再测卡片中心（动画中的 rect 不准）
    const introTimer = window.setTimeout(measure, 900);

    const pointer = { x: 0, y: 0, inside: false };
    const hover = { x: 0, y: 0, vx: 0, vy: 0, presence: 0, placed: false };
    const ripples: { x: number; y: number; start: number }[] = [];
    let clock = 0;
    let raf = 0;
    let last = 0;

    const frame = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;

      if (measured) {
        clock += dt;

        // 弹簧点追随鼠标（刚度/阻尼同 AcidSquares），移出后弹性归位
        const spot = pointer.inside ? pointer : null;
        if (spot) {
          if (!hover.placed) {
            hover.x = spot.x;
            hover.y = spot.y;
            hover.vx = 0;
            hover.vy = 0;
            hover.placed = true;
          }
          hover.vx += (WIND.springStiffness * (spot.x - hover.x) - WIND.springDamping * hover.vx) * dt;
          hover.vy += (WIND.springStiffness * (spot.y - hover.y) - WIND.springDamping * hover.vy) * dt;
          hover.x += hover.vx * dt;
          hover.y += hover.vy * dt;
        }
        const goal = spot ? 1 : 0;
        hover.presence += (goal - hover.presence) * (1 - Math.exp(-dt / (goal > hover.presence ? 0.25 : 0.5)));
        if (!spot && hover.presence < 0.001) hover.placed = false;

        for (let i = ripples.length - 1; i >= 0; i--) {
          if (clock - ripples[i].start > WIND.rippleTravel / WIND.rippleSpeed + 0.5) ripples.splice(i, 1);
        }

        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const c = centers[i];

          // 静置波浪：每张相位错开，像摆在缓慢呼吸的水面上
          let y = Math.sin(clock * 0.9 + i * 1.9) * WIND.swellAmp;
          let rx = 0;

          // 鼠标掀起：弹簧点越近抬得越高、越前倾
          const hd = Math.hypot(c.x - hover.x, c.y - hover.y);
          const lift = Math.exp(-(hd * hd) / (WIND.hoverRadius * WIND.hoverRadius)) * hover.presence;
          y -= lift * WIND.hoverLift;
          rx += lift * WIND.hoverTilt;

          // 点击涟漪：环经过时依次被推起再落回
          for (const rp of ripples) {
            const age = clock - rp.start;
            const radius = age * WIND.rippleSpeed;
            const d = Math.hypot(c.x - rp.x, c.y - rp.y);
            const x = (d - radius) / WIND.rippleWidth;
            const life = Math.max(0, 1 - radius / WIND.rippleTravel);
            const strength = life * life * Math.min(1, radius / 90);
            const bump = Math.exp(-x * x) * strength;
            y -= bump * WIND.rippleLift;
            rx += bump * WIND.rippleTilt;
          }

          el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) translate3d(0, ${y.toFixed(2)}px, 0)`;
        });
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onMove = (e: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;
      pointer.inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.target instanceof Element && e.target.closest('button')) return;
      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      ripples.push({ x, y, start: clock });
      while (ripples.length > WIND.maxRipples) ripples.shift();
    };
    const onResize = () => {
      if (measured) measure();
    };

    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(introTimer);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open, items]);

  return (
    <>
      {/* 小板：悬停时小票依次"竖起来"（效果在 index.css .receipt-board） */}
      <div className="receipt-board relative aspect-square w-full select-none">
        {items.map((src, i) => {
          const l = LAYOUT[i % LAYOUT.length];

          return (
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              onClick={() => setOpen(true)}
              className="absolute cursor-zoom-in"
              style={{
                left: l.left,
                top: l.top,
                width: l.w,
                zIndex: l.z,
                '--rot': `${l.rot}deg`,
              } as CSSProperties}
            />
          );
        })}
      </div>

      {/* 灯箱：图钉钉住的小票摆在软表面上，背景米白罩 + 高斯模糊 */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={stageRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 cursor-zoom-out select-none overflow-hidden"
            style={{ background: 'rgba(252, 251, 249, 0.55)', backdropFilter: 'blur(24px)' }}
          >
            {/* 关闭按钮：页面右上角 */}
            <button
              onClick={() => setOpen(false)}
              aria-label="关闭"
              className="absolute top-6 right-7 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-stone-600 transition-all hover:scale-110 hover:text-stone-900"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <motion.div
              initial={{ scale: 0.94, y: 18 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 10, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full flex-wrap content-center items-start justify-center gap-x-[3.5vh] gap-y-[5vh] px-[7vh]"
            >
              {items.map((src, i) => {
                const p = PIN_LAYOUT[i % PIN_LAYOUT.length];
                // 出现时从中心向外依次浮现（同 AcidSquares intro）
                const d = Math.abs(i - (items.length - 1) / 2);

                return (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, scale: 0.85, y: 26 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.45, delay: 0.06 + d * 0.09, ease: [0.22, 1, 0.36, 1] }}
                    style={{ marginTop: p.off }}
                  >
                    {/* 中层带基准倾角，支点在图钉（顶部中心）；内层交给风场 rAF */}
                    <div className="receipt-card" style={{ '--r': `${p.rot}deg` } as CSSProperties}>
                      <div className="receipt-float" ref={(el) => { cardRefs.current[i] = el; }}>
                        <span
                          aria-hidden
                          className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 -rotate-12 text-[20px] drop-shadow-[0_2px_3px_rgba(28,25,23,0.25)]"
                        >
                          📌
                        </span>
                        <img
                          src={src}
                          alt=""
                          draggable={false}
                          className="receipt-pin-img block max-h-[54vh] max-w-[24vw] object-contain drop-shadow-[0_10px_26px_rgba(28,25,23,0.16)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
