import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * 点击涂鸦：在页面任意空白处点击，原地画一个小小的手绘 SVG 图案。
 * 图案会一直留在页面上，刷新页面后清空——像在稿纸边缘随手比划的铅笔痕。
 *
 * - 命中任何可交互控件（按钮、链接、表单、下拉等）不画，交互不受干扰；
 * - 每次随机挑一个图案，带随机大小 / ±20° 随机倾斜 / 随机颜色，避免重复感；
 * - 图案按笔顺画出（pathLength 0 → 1），prefers-reduced-motion 时直接显现；
 * - 第一次画完涂鸦后，一块橡皮从页面上方掉落停到右下角；
 *   长按橡皮把它拿起，拖到哪里就擦掉半径内的涂鸦，松手放回原位。
 * - 涂鸦层 pointer-events-none + aria-hidden，纯装饰。
 */

/** 可交互控件：点击这些元素及其内部时不画涂鸦 */
const INTERACTIVE =
  'button, a, input, select, textarea, label, summary, [role="button"], [data-doodle-skip]';

/* ── 涂鸦颜色池：取自站内荧光笔 / 贴纸的配色（core-yellow/pink/blue/green 等），
      头一个墨色打底，其余都是手绘记号笔色 ── */
const COLORS = [
  '#57534e', // 墨灰（stone 铅笔）
  '#c9a227', // 荧光黄线
  '#b3479a', // 荧光粉
  '#4a6fa5', // 荧光蓝
  '#6a9152', // 荧光绿
  '#d97706', // 橙铅笔
  '#dc2626', // 红笔
  '#7c3aed', // 紫
];

/* ── 图案库：10 个手绘涂鸦，viewBox 统一 48×48，一笔一条 path。
   scribbles: 蜡笔排线填充——以 paths[0] 闭合轮廓做 clipPath，
   在轮廓内部依次画出的斜排线，模拟涂色笔触（实心爱心用） ── */
const KINDS: { name: string; paths: string[]; scribbles?: string[] }[] = [
  {
    name: '笑脸',
    paths: [
      'M 18 6 C 30 4, 40 12, 39 25 C 38 38, 26 45, 15 41 C 5 37, 3 24, 10 14 C 14 8, 24 7, 30 6',
      'M 16 22 L 16.2 22.2 M 30 21 L 30.2 21.2',
      'M 15 30 Q 23 38, 31 29',
    ],
  },
  {
    /* 蜡笔星星：轮廓一笔勾出，内部同样用斜向排线涂满 */
    name: '星星',
    paths: [
      'M 22 6 L 27 19 L 41 19 L 30 27 L 34 41 L 23 32 L 10 40 L 16 26 L 6 18 L 20 18',
    ],
    scribbles: [
      'M 12 7 C 22 11, 32 15, 42 20',
      'M 36 10 C 28 16, 18 24, 8 34',
      'M 6 16 C 16 18, 28 22, 40 26',
      'M 10 10 C 20 14, 30 19, 40 24',
      'M 34 16 C 26 22, 16 30, 9 39',
      'M 6 24 C 16 27, 27 31, 38 35',
      'M 40 20 C 32 25, 23 31, 12 38',
      'M 8 31 C 17 34, 26 38, 35 41',
    ],
  },
  {
    /* 蜡笔爱心：轮廓一笔勾出，内部用斜向排线涂满（参考蜡笔笔触） */
    name: '爱心',
    paths: [
      'M 24 42 C 8 30, 4 18, 12 11 C 18 6, 24 10, 24 16 C 24 10, 30 6, 36 11 C 44 18, 40 30, 24 42',
    ],
    scribbles: [
      'M 10 10 C 22 13, 33 18, 43 23',
      'M 40 14 C 30 20, 19 27, 9 36',
      'M 12 8 C 23 11, 34 15, 44 18',
      'M 7 19 C 18 24, 30 30, 41 34',
      'M 42 22 C 33 27, 23 33, 13 40',
      'M 6 27 C 17 31, 28 36, 39 40',
      'M 44 28 C 36 32, 28 37, 20 42',
      'M 9 34 C 17 38, 26 41, 34 42',
      'M 8 15 C 19 19, 31 25, 42 29',
      'M 14 6 C 24 9, 35 13, 45 15',
      'M 5 24 C 14 28, 25 33, 36 37',
      'M 10 40 C 19 43, 28 45, 37 44',
      'M 44 17 C 33 22, 21 27, 5 31',
      'M 5 15 C 17 19, 30 24, 43 27',
    ],
  },
  {
    name: '小花',
    paths: [
      'M 24 24 C 18 8, 30 8, 24 24',
      'M 24 24 C 40 18, 40 30, 24 24',
      'M 24 24 C 30 40, 18 40, 24 24',
      'M 24 24 C 8 30, 8 18, 24 24',
      'M 24 24 C 36 36, 12 36, 24 24',
      'M 24 24 m -3.5 0 a 3.5 3.5 0 1 0 7 0 a 3.5 3.5 0 1 0 -7 0',
    ],
  },
  {
    /* 手绘粗十字：两笔微微弯曲，交点略偏出中心，像随手画的加号 */
    name: '十字',
    paths: [
      'M 25 7 C 23.5 17, 25.5 30, 24 41',
      'M 8 25 C 18 23.5, 31 26, 40 24',
    ],
  },
  {
    /* 八向放射星芒：从中心炸开的八条短线，长短参差 */
    name: '星芒',
    paths: [
      'M 24 24 L 23 6 M 24 24 L 36 9 M 24 24 L 43 25 M 24 24 L 37 37 M 24 24 L 25 42 M 24 24 L 11 38 M 24 24 L 5 23 M 24 24 L 11 10',
    ],
  },
  {
    /* 空心爆星：六刺不规则星形轮廓，一笔勾出、收笔交叠 */
    name: '爆星',
    paths: [
      'M 21 4 L 27 18 L 43 14 L 32 26 L 45 36 L 28 33 L 23 44 L 18 31 L 4 33 L 15 24 L 5 12 L 20 17 L 21 4',
    ],
  },
  {
    /* 小草：三两根从地面弯出来的草叶，长短和弯向各不同 */
    name: '小草',
    paths: [
      'M 14 40 C 11 32, 13 24, 18 18',
      'M 24 40 C 23 30, 25 19, 30 12',
      'M 33 40 C 34 33, 37 27, 42 23',
    ],
  },
  {
    /* 咖啡：歪歪的杯身 + 侧把耳 + 两缕弯曲的热气 */
    name: '咖啡',
    paths: [
      'M 13 23 C 18 21, 30 21, 35 23 L 33 37 C 32 40, 16 40, 15 37 L 13 23',
      'M 35 26 C 41 25, 42 33, 34 33',
      'M 19 17 C 18 14, 20 12, 19 8',
      'M 27 17 C 26 14, 28 12, 27 8',
    ],
  },
];

type Doodle = {
  id: number;
  x: number;
  y: number;
  kind: number;
  rot: number;
  size: number;
  color: string;
};

/* 手绘橡皮擦：双色橡皮块，微微歪着，带两道擦痕碎屑 */
function EraserGlyph() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      {/* 橡皮主体（粉色） */}
      <path
        d="M 10 27 C 10 24, 12 22, 15 22 L 33 22 C 36 22, 38 24, 38 27 L 38 36 C 38 39, 36 41, 33 41 L 15 41 C 12 41, 10 39, 10 36 Z"
        fill="#f2a7bb"
        stroke="#8a5b68"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 纸套（米白，略歪） */}
      <path
        d="M 12 22 L 14.5 11 C 15 8.5, 16.5 7.5, 19 7.5 L 29 7.5 C 31.5 7.5, 33 8.5, 33.5 11 L 36 22"
        fill="#f7f1e6"
        stroke="#8a7f6e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 纸套上的两道字痕 */}
      <path d="M 19 14.5 L 29 14.5 M 20 19 L 28 19" stroke="#8a7f6e" strokeWidth="1.6" strokeLinecap="round" />
      {/* 橡皮碎屑 */}
      <path d="M 8 44.5 L 9.5 44 M 12 45.5 L 13 44.8 M 40 44.5 L 38.6 44" stroke="#b7ada0" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** 橡皮长按拿起时长（ms）：按住不放才算"拿起"，单击无效果 */
const HOLD_MS = 280;
/** 橡皮擦除半径（px），加上涂鸦自身一半尺寸做命中判定 */
const ERASE_R = 30;
/** 橡皮停留位置：右下角 */
const ERASER_REST = { right: 24, bottom: 24 } as const;

export function ClickDoodles({ pageKey }: { pageKey: string }) {
  const [pages, setPages] = useState<Record<string, Doodle[]>>({}); // 按页分组的涂鸦
  const [eraserShown, setEraserShown] = useState(false); // 第一次画涂鸦后掉落
  const [grabbed, setGrabbed] = useState(false); // 长按拿起橡皮
  const [pos, setPos] = useState({ x: 0, y: 0 }); // 拿起时橡皮跟随指针
  const idRef = useRef(0);
  const reducedRef = useRef(false);
  const holdTimer = useRef<number | null>(null);
  const eraseGuard = useRef(false); // 按住橡皮期间不画新涂鸦
  const pageRef = useRef(pageKey); // 事件回调里读最新页 key
  pageRef.current = pageKey;

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      /* 拿橡皮擦的手不画；可交互控件本身及其内部不画 */
      if (eraseGuard.current) return;
      if (t.closest(INTERACTIVE)) return;

      const id = ++idRef.current;
      const item: Doodle = {
        id,
        x: e.clientX,
        y: e.clientY,
        kind: Math.floor(Math.random() * KINDS.length),
        /* 随机角度 ±20°、随机大小 26–48px、随机颜色（从配色池抽） */
        rot: Math.random() * 40 - 20,
        size: 26 + Math.random() * 22,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
      /* 图案画在当前页名下：常驻、翻走再翻回来还在，刷新页面后清空 */
      const pk = pageRef.current;
      setPages((s) => ({ ...s, [pk]: [...(s[pk] || []), item] }));
      setEraserShown(true);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* 松手后延迟清掉 guard，让紧随的 click 事件仍被拦住 */
  const releaseGuard = () => {
    window.setTimeout(() => {
      eraseGuard.current = false;
    }, 80);
  };

  /* 拿起橡皮后：跟随指针 + 擦掉半径内的涂鸦，松手放回右下角 */
  useEffect(() => {
    if (!grabbed) return;
    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      /* 只擦当前页名下的涂鸦 */
      const pk = pageRef.current;
      setPages((s) => {
        const list = s[pk];
        if (!list) return s;
        return {
          ...s,
          [pk]: list.filter(
            (d) => Math.hypot(d.x - e.clientX, d.y - e.clientY) > ERASE_R + d.size / 2,
          ),
        };
      });
    };
    const onUp = () => {
      setGrabbed(false);
      releaseGuard();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [grabbed]);

  /* 长按橡皮 HOLD_MS 后"拿起"；期间拖出橡皮也算取消 */
  const startHold = (e: ReactPointerEvent) => {
    e.preventDefault();
    eraseGuard.current = true;
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null;
      setPos({ x: e.clientX, y: e.clientY });
      setGrabbed(true);
    }, HOLD_MS);
  };
  const cancelHold = () => {
    if (holdTimer.current) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
      releaseGuard();
    }
  };

  return (
    <>
      {/* 涂鸦层：纯装饰，不接收任何指针事件；只显示当前页画的涂鸦 */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden>
        <AnimatePresence>
          {(pages[pageKey] || []).map((d) => {
            const k = KINDS[d.kind];
            return (
              <motion.svg
                key={d.id}
                viewBox="0 0 48 48"
                fill="none"
                className="absolute"
                style={{
                  left: d.x,
                  top: d.y,
                  width: d.size,
                  height: d.size,
                  color: d.color,
                  translateX: '-50%',
                  translateY: '-50%',
                  rotate: d.rot,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {k.paths.map((p, i) => (
                  <motion.path
                    key={i}
                    d={p}
                    stroke="currentColor"
                    strokeWidth={2.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reducedRef.current ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.28, delay: i * 0.07, ease: 'easeOut' }}
                  />
                ))}
                {/* 蜡笔排线填充：轮廓画完后，斜向笔触依次涂进轮廓内部 */}
                {k.scribbles && (
                  <g clipPath={`url(#doodle-clip-${d.id})`} opacity={0.85}>
                    <clipPath id={`doodle-clip-${d.id}`}>
                      <path d={`${k.paths[0]} Z`} />
                    </clipPath>
                    {k.scribbles.map((p, j) => (
                      <motion.path
                        key={j}
                        d={p}
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        initial={reducedRef.current ? { pathLength: 1 } : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: k.paths.length * 0.07 + 0.15 + j * 0.06,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </g>
                )}
              </motion.svg>
            );
          })}
        </AnimatePresence>
        {/* 拿起橡皮时跟着指针的虚线擦除圈 */}
        {grabbed && (
          <motion.div
            className="absolute rounded-full border border-dashed border-stone-400/70"
            style={{
              left: pos.x,
              top: pos.y,
              width: ERASE_R * 2,
              height: ERASE_R * 2,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </div>

      {/* 橡皮擦：第一次涂鸦后从页面上方掉落，停到右下角；长按拿起可擦除 */}
      {eraserShown && (
        <motion.div
          data-doodle-skip
          aria-hidden
          className="pointer-events-auto fixed z-[10000] select-none"
          style={
            grabbed
              ? { left: pos.x, top: pos.y, translateX: '-50%', translateY: '-50%' }
              : ERASER_REST
          }
          initial={{ y: -900, rotate: -24 }}
          animate={grabbed ? { y: 0, rotate: -10, scale: 1.18 } : { y: 0, rotate: 4, scale: 1 }}
          transition={
            grabbed
              ? { duration: 0.12 }
              : { type: 'spring', stiffness: 150, damping: 11 }
          }
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
        >
          <div
            className="h-[54px] w-[54px] touch-none"
            style={{ cursor: grabbed ? 'grabbing' : 'grab' }}
          >
            <EraserGlyph />
          </div>
        </motion.div>
      )}
    </>
  );
}
