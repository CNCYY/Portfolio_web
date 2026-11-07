import { useEffect, useState } from 'react';

/**
 * 礼物真机竖向手风琴（AI 礼物页子项 03「数据与使用跟踪」）：
 * 9 张 AI 生成的礼物图逐个展示——每张放进一台「真机」手机模型里：
 * 深色屏幕 + 居中氛围光晕（社交平台式渐变光效）衬托礼物，
 * 屏上有 100% 进度胶囊与引导文案，复刻真实 H5 的礼物收取画面。
 * 收起项缩成细条（编号 + 光色提示），悬停 / 点击展开该项；
 * 无人交互时自动轮换；prefers-reduced-motion 时不自动轮换。
 */

/** 每个礼物的氛围光主色 */
const GLOWS = ['#a855f7', '#ec4899', '#22d3ee', '#f59e0b', '#3b82f6', '#f43f5e', '#22c55e', '#6366f1', '#d946ef'];

/** 屏内引导文案（取自产品真实界面） */
const CAPTION = 'Shake your device and get your personal gift!';

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
    <div
      className="flex h-[460px] flex-col gap-1.5 select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {images.map((src, i) => {
        const open = i === active;
        const glow = GLOWS[i % GLOWS.length];

        return (
          <div
            key={src}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`relative cursor-pointer overflow-hidden rounded-2xl bg-[#141118] transition-all duration-700 ease-out ${
              open ? 'flex-[10]' : 'min-h-[10px] flex-[0.55]'
            }`}
          >
            {/* 收起态：编号 + 光色渐变细条 */}
            <div
              className={`absolute inset-0 flex items-center gap-3 px-4 transition-opacity duration-300 ${
                open ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <span className="font-mono text-[10px] tracking-[0.15em] text-white/40">
                {String(i + 1).padStart(2, '0')}.
              </span>
              <span
                className="h-[3px] flex-1 rounded-full"
                style={{ background: `linear-gradient(90deg, ${glow}66, transparent)` }}
              />
            </div>

            {/* 展开态：氛围光溢出 + 真机模型 */}
            <div
              className={`absolute inset-0 flex items-center justify-center gap-8 transition-opacity duration-500 ${
                open ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {/* 光晕溢出手机之外，铺满深色面板 */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(58% 85% at 50% 50%, ${glow}1f 0%, transparent 70%)`,
                }}
              />
              {/* 手机：银白边框 + 深色屏幕 */}
              <div className="relative aspect-[9/19] h-full max-h-[300px] rounded-[30px] bg-gradient-to-b from-[#f1efe9] to-[#d9d6cf] p-[6px] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]">
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
                  {/* 100% 进度胶囊 */}
                  <div
                    className="absolute left-1/2 top-10 -translate-x-1/2 rounded-full px-4 py-[3px] text-[10px] font-semibold text-white"
                    style={{
                      background: `linear-gradient(90deg, ${glow}, ${glow}99)`,
                      boxShadow: `0 2px 12px ${glow}55`,
                    }}
                  >
                    100%
                  </div>
                  {/* 礼物图（透明背景，光晕从背后透出） */}
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    className="absolute left-1/2 top-[46%] h-[50%] max-w-[80%] -translate-x-1/2 -translate-y-1/2 object-contain"
                    style={{ filter: `drop-shadow(0 6px 24px ${glow}55)` }}
                  />
                  {/* 引导文案 */}
                  <p className="absolute inset-x-4 bottom-6 text-center text-[9.5px] font-medium leading-snug text-white/90">
                    {CAPTION}
                  </p>
                  {/* Home 指示条 */}
                  <div className="absolute bottom-1.5 left-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-white/70" />
                </div>
              </div>
              {/* 展开项右侧编号 */}
              <span className="hidden font-mono text-[11px] tracking-[0.2em] text-white/35 lg:block">
                {String(i + 1).padStart(2, '0')}.
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
