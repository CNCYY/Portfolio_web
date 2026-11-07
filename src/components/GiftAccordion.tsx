import { useEffect, useRef, useState } from 'react';

/**
 * 礼物真机横向手风琴（AI 礼物页子项 03「数据与使用跟踪」）：
 * 一台手机即一个手风琴项——9 张 AI 生成的礼物图逐个放进「真机」手机模型：
 * 深色屏幕 + 居中氛围光晕（社交平台式渐变光效）衬托礼物，
 * 屏下有引导文案，复刻真实 H5 的礼物收取画面；无额外背景面板。
 * 收起项缩成手机侧缘细条，悬停 / 点击展开该项；无人交互时自动轮换；
 * prefers-reduced-motion 时不自动轮换、弹簧直接落位。
 *
 * 交互移植自 ImageAccordion（bencho.dev，MIT）：
 * - 宽度由弹簧物理驱动（帧步进、阻尼按帧求幂），而不是 CSS transition；
 * - 邻位高斯衰减（swell）：悬停项周围的主题依次微微展开，读作
 *   「一股力到达某处」而不是开关被扳动；
 * - onPointerOut 用 relatedTarget 包含性判断代替 onPointerLeave，
 *   防止脚本化 pointer 事件带着 relatedTarget: null 离场时收不起来。
 */

/** 每个礼物的氛围光主色 */
const GLOWS = ['#a855f7', '#ec4899', '#22d3ee', '#f59e0b', '#3b82f6', '#f43f5e', '#22c55e', '#6366f1', '#d946ef'];

/** 屏内引导文案（取自产品真实界面） */
const CAPTION = 'Send your personalized AI gift';

/* ── 展开与收起的机身宽度 ──────────────────────────────────
   展开 224 / 收起 28，与原版一致。swell 时邻位机身的宽度
   落在两者之间，整排总宽随之轻微起伏——外层 justify-center
   会跟着居中，这正是「一排机器在呼吸」的观感来源。 */
const W_OPEN = 224;
const W_CLOSED = 28;

/* ── 弹簧参数 ──────────────────────────────────────────────
   0..100 映射到弹簧的两个数：k 是拉向目标的力度，d 是每帧
   保留的速度比例。50 是原作校准的中位值，两端都可用：
   0 端缓慢沉稳、100 端轻快带回弹。 */
const springOf = (tune: number) => ({
  k: 0.08 + (tune / 100) * 0.16,
  d: 0.62 + (tune / 100) * 0.2,
});

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/* ── 弹簧钩子：帧而不是毫秒 ────────────────────────────────
   dt 以 1/60 秒为单位，阻尼对它求幂而不是相乘——掉一帧
   衰减掉的能量与它替代的两帧相同，弹簧在繁忙页面上表现一致。
   数值落定（delta 与速度都小于 0.02）后循环自停，不留常驻
   requestAnimationFrame。instant 时直接落位（配合
   prefers-reduced-motion）。 */
function useSpring(target: number, tune = 50, instant = false) {
  const [at, setAt] = useState(target);
  const cur = useRef(target);
  const vel = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (instant) {
      cur.current = target;
      vel.current = 0;
      setAt(target);
      return;
    }
    const { k, d } = springOf(tune);
    let prev = 0;
    const tick = (t: number) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      vel.current += (target - cur.current) * k * dt;
      vel.current *= Math.pow(d, dt);
      cur.current += vel.current * dt;
      if (Math.abs(target - cur.current) < 0.02 && Math.abs(vel.current) < 0.02) {
        cur.current = target;
        vel.current = 0;
        setAt(target);
        raf.current = 0;
        return;
      }
      setAt(cur.current);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
    /* tune 与 target 同在依赖里：循环闭包引用了它，缺了它
       飞行途中调参不会生效。重启时从 refs 续接而非跳变。 */
  }, [target, tune, instant]);

  return at;
}

/* 读一次即可：是偏好，不是实时输入。 */
const stillness = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/* ── swell 传多远 ──────────────────────────────────────────
   对「以手机台数计的距离」做高斯衰减：平滑，且在 9 台一排里
   永远够不到看不见的那几台。默认参数下第 1 个邻位约一成
   展开——比外侧的明显少付，又不至于像自己也被打开了。 */
const fall = (d: number, reach: number) => {
  const s = 0.35 + (clamp(reach, 0, 100) / 100) * 0.9;
  return Math.exp(-((d / s) ** 2));
};

/* ── 单台手机 ──────────────────────────────────────────────
   每台机器一个自己的弹簧（钩子不能按数量动态调用，所以
   以子组件承载）。目标值在 0..100 上驱动——弹簧跑在 0..2
   这种小范围上会在肉眼可见之前就「落定」。 */
function Phone({
  src,
  glow,
  target,
  bounce,
  instant,
  onEnter,
  onClick,
}: {
  src: string;
  glow: string;
  target: number;
  bounce: number;
  instant: boolean;
  onEnter: () => void;
  onClick: () => void;
}) {
  const u = useSpring(target, bounce, instant) / 100;

  /* 圆角随弹簧插值：收起细条上 16px 会吃掉大半个宽度，显得过圆，
     所以收起端单独取小值（8px），展开端保持 16px。 */
  const R_CLOSED = 8;
  const R_OPEN = 16;
  const r = R_CLOSED + (R_OPEN - R_CLOSED) * u;

  return (
    /* 机身宽度是唯一的动画量：28 + (224-28) × u。
       指着的这台只会变宽，边缘离指针远去而不是穿过它，
       所以不会在你指着的瞬间缩小、把 hover 让给邻位——
       所有在缩小的机器都是你没在指的。 */
    <div
      className="relative h-full cursor-pointer overflow-hidden bg-[#0b0812]"
      style={{ width: W_CLOSED + (W_OPEN - W_CLOSED) * u, borderRadius: r }}
      onPointerEnter={onEnter}
      onClick={onClick}
    >
      {/* 屏内氛围光：主体光晕 + 底部余晖 */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(90% 62% at 50% 46%, ${glow}59 0%, ${glow}22 45%, transparent 72%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: `radial-gradient(70% 90% at 50% 100%, ${glow}2e 0%, transparent 70%)`,
        }}
      />
      {/* 灵动岛 + 状态栏 */}
      <div className="absolute left-1/2 top-2.5 h-[14px] w-[56px] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
      <span className="absolute left-4 top-2.5 text-[9px] font-semibold text-white/80">9:41</span>
      {/* 礼物图（透明背景，光晕从背后透出） */}
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute left-1/2 top-[44%] h-[50%] max-w-[80%] -translate-x-1/2 -translate-y-1/2 object-contain"
        style={{ filter: `drop-shadow(0 6px 24px ${glow}55)` }}
      />
      {/* 引导文案：单行居中；细条状态下被机身裁掉，只在展开时可见 */}
      <p className="absolute inset-x-1 bottom-6 text-center text-[8.5px] font-medium whitespace-nowrap text-white/90">
        {CAPTION}
      </p>
      {/* Home 指示条 */}
      <div className="absolute bottom-1.5 left-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-white/70" />
    </div>
  );
}

export function GiftAccordion({ images }: { images: string[] }) {
  /* 指针在哪台上（null = 无人交互）；自动轮换的当前台 */
  const [hoverAt, setHoverAt] = useState<number | null>(null);
  const [autoAt, setAutoAt] = useState(0);
  const still = stillness();

  // 自动轮换：悬停暂停；系统开启「减少动态效果」时静止
  useEffect(() => {
    if (hoverAt !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setAutoAt((a) => (a + 1) % images.length), 1600);
    return () => clearInterval(t);
  }, [hoverAt, images.length]);

  const active = hoverAt ?? autoAt;
  const REACH = 35;
  const BOUNCE = 10;

  return (
    <div className="flex h-[460px] justify-center select-none">
      {/* ── `out` 带包含性判断，而不是 `leave` ──────────
          脚本化的 pointer 事件会带着 relatedTarget: null
          离场，React 不会把它转成 leave——不用这个判断，
          演示结束时会有手机停在展开状态。 */}
      <div
        className="flex h-full gap-1.5"
        onPointerOut={(e) => {
          const to = e.relatedTarget as Node | null;
          if (!to || !e.currentTarget.contains(to)) setHoverAt(null);
        }}
        onPointerCancel={() => setHoverAt(null)}
      >
        {images.map((src, i) => {
          const glow = GLOWS[i % GLOWS.length];
          /* 无人交互：只有轮换到的那台展开；
             悬停：以指针所在台为中心按距离衰减——
             这几台不是依次响应的五个独立物，而是同一份
             宽度在再分配，所以它们同步移动。 */
          const target =
            hoverAt === null ? (i === active ? 100 : 0) : fall(Math.abs(i - hoverAt), REACH) * 100;

          return (
            <Phone
              key={src}
              src={src}
              glow={glow}
              target={target}
              bounce={BOUNCE}
              instant={still}
              onEnter={() => setHoverAt(i)}
              onClick={() => {
                setAutoAt(i);
                setHoverAt(i);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
