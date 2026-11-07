import { useEffect, useState } from 'react';

/**
 * 礼物真机横向手风琴（AI 礼物页子项 03「数据与使用跟踪」）：
 * 一台手机即一个手风琴项——9 张 AI 生成的礼物图逐个放进「真机」手机模型：
 * 深色屏幕 + 居中氛围光晕（社交平台式渐变光效）衬托礼物，
 * 屏下有引导文案，复刻真实 H5 的礼物收取画面；无额外背景面板。
 * 收起项缩成手机侧缘细条，悬停 / 点击展开该项；无人交互时自动轮换；
 * prefers-reduced-motion 时不自动轮换。
 */

/** 每个礼物的氛围光主色 */
const GLOWS = ['#a855f7', '#ec4899', '#22d3ee', '#f59e0b', '#3b82f6', '#f43f5e', '#22c55e', '#6366f1', '#d946ef'];

/** 屏内引导文案（取自产品真实界面） */
const CAPTION = 'Send your personalized AI gift';

export function GiftAccordion({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);

  // 自动轮换：悬停暂停；系统开启「减少动态效果」时静止
  useEffect(() => {
    if (hover) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setActive((a) => (a + 1) % images.length), 3200);
    return () => clearInterval(t);
  }, [hover, images.length]);

  return (
    <div className="flex h-[460px] justify-center select-none">
      <div className="flex h-full gap-1.5">
        {images.map((src, i) => {
          const open = i === active;
          const glow = GLOWS[i % GLOWS.length];

          return (
            /* 手机本体即手风琴项：展开为完整机身，收起缩成侧缘细条 */
            <div
              key={src}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative h-full cursor-pointer overflow-hidden rounded-[30px] bg-gradient-to-b from-[#f1efe9] to-[#d9d6cf] p-[6px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition-all duration-700 ease-out ${
                open ? 'w-[224px]' : 'w-[28px]'
              }`}
            >
              <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-[#0b0812]">
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
                {/* 引导文案：单行居中 */}
                <p className="absolute inset-x-1 bottom-6 text-center text-[8.5px] font-medium whitespace-nowrap text-white/90">
                  {CAPTION}
                </p>
                {/* Home 指示条 */}
                <div className="absolute bottom-1.5 left-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-white/70" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
