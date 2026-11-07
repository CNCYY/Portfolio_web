import { useEffect, useState } from 'react';
import loadingArt from '../assets/loading-rummage.webp';

/**
 * 首屏 Loading 遮罩：涂鸦女孩翻找文件夹动画。
 * 等关键资源（字体 + 封面首屏图片）加载完成后淡出，4 秒兜底强制撤场。
 * 纯 CSS/transform 动画 + 单张 85KB WebP，不阻塞主线程。
 */
export function LoadingScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible');

  useEffect(() => {
    if (phase !== 'visible') return;
    let cancelled = false;
    let timer = 0;

    const finish = () => {
      if (!cancelled) setPhase('fading');
    };

    // 兜底：最多等 4 秒
    timer = window.setTimeout(finish, 4000);

    const fontsReady: Promise<unknown> =
      'fonts' in document ? document.fonts.ready : Promise.resolve();

    // 轮询封面首屏图片是否全部完成解码
    const heroReady = new Promise<void>((resolve) => {
      const check = () => {
        const imgs = Array.from(
          document.querySelectorAll<HTMLImageElement>('#hero-folder img')
        );
        if (imgs.length > 0 && imgs.every((i) => i.complete && i.naturalWidth > 0)) {
          resolve();
        } else {
          window.setTimeout(check, 150);
        }
      };
      check();
    });

    Promise.all([fontsReady, heroReady]).then(() => {
      window.clearTimeout(timer);
      finish();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase]);

  if (phase === 'gone') return null;

  return (
    <div
      aria-hidden
      onTransitionEnd={() => setPhase('gone')}
      className={`fixed inset-0 z-[9999] dot-grid flex flex-col items-center justify-center gap-6 select-none pointer-events-auto transition-opacity duration-500 ease-out ${
        phase === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <img
        src={loadingArt}
        alt=""
        draggable={false}
        className="w-[300px] sm:w-[340px] h-auto"
      />
    </div>
  );
}
