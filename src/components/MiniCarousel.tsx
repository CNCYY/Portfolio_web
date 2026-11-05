import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

/**
 * Coverflow 式小轮播（showcase 布局左下角）：
 * 中央卡片正对且最大，两侧卡片沿 3D 弧线依次倾斜、缩小、变暗，
 * 越靠边被容器裁切越多；自动轮换、悬停暂停；
 * prefers-reduced-motion 时静止展示。
 * 点击任意卡片：同一 coverflow 布局放大居中展示（背景高斯模糊），
 * 点击两侧卡片可切换中心，点击空白或 ESC 关闭。
 */

/** 单张卡片的 3D 位置计算：环上最短距离 → 位移/倾斜/缩放/亮度 */
const cardOffset = (i: number, center: number, n: number) => {
  let d = (((i - center) % n) + n) % n;
  if (d > n / 2) d -= n;
  return { d, abs: Math.abs(d) };
};

export const MiniCarousel = ({ images }: { images: string[] }) => {
  const n = images.length;
  const [center, setCenter] = useState(0);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (n < 2 || hover || open) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setCenter((c) => (c + 1) % n), 1500);
    return () => clearInterval(t);
  }, [n, hover, open]);

  // 灯箱打开时支持 ESC 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* 小轮播 */}
      <div
        className="relative h-full overflow-hidden select-none"
        style={{ perspective: '900px' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {images.map((src, i) => {
          const { d, abs } = cardOffset(i, center, n);

          return (
            <img
              key={src}
              src={src}
              alt=""
              draggable={false}
              onClick={() => setOpen(true)}
              className="absolute left-1/2 top-1/2 h-[176px] w-[132px] cursor-zoom-in rounded-xl object-cover transition-all duration-700 ease-out"
              style={{
                transform: `translate(-50%, -50%) translateX(${d * 92}px) rotateY(${d * -38}deg) scale(${1 - abs * 0.13})`,
                zIndex: 10 - abs,
                filter: `brightness(${1 - abs * 0.18})`,
                boxShadow: '0 10px 24px rgba(28, 25, 23, 0.14)',
              }}
            />
          );
        })}
      </div>

      {/* 灯箱：同一 coverflow 布局放大居中，背景米白罩 + 高斯模糊 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
            style={{ background: 'rgba(252, 251, 249, 0.55)', backdropFilter: 'blur(24px)' }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 8, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[62vh] w-full overflow-hidden select-none"
              style={{ perspective: '1100px' }}
            >
              {/* 关闭按钮：左侧对齐最右卡片右缘（中心 + 40vh 位移 + 卡半宽） */}
              <button
                onClick={() => setOpen(false)}
                aria-label="关闭"
                className="absolute top-0 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-stone-600 transition-all hover:scale-110 hover:text-stone-900"
                style={{ left: 'calc(50% + 56vh)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
              {images.map((src, i) => {
                const { d, abs } = cardOffset(i, center, n);

                return (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    draggable={false}
                    onClick={() => setCenter(i)}
                    className={`absolute left-1/2 top-1/2 h-[58vh] w-[43vh] rounded-2xl object-cover transition-all duration-500 ease-out ${
                      d === 0 ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    style={{
                      transform: `translate(-50%, -50%) translateX(calc(${d} * 20vh)) rotateY(${d * -38}deg) scale(${1 - abs * 0.13})`,
                      zIndex: 10 - abs,
                      filter: `brightness(${1 - abs * 0.18})`,
                      boxShadow: '0 24px 60px rgba(28, 25, 23, 0.22)',
                    }}
                  />
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
