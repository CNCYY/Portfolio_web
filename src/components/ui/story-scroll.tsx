import React, { useEffect, useRef, useState } from 'react';

interface PageTurnFlowProps {
  /** 实际滚动容器（本应用为 scroll-snap 视口） */
  scrollerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

/**
 * 翻页滚动编排（参考 Story Scroll / Flow Art 效果，纯 rAF 实现）：
 * - 标记 data-page-turn-section 的页面按 DOM 顺序叠放（后面的页自然盖在前面之上）
 * - 翻入：每页内容层 data-page-turn-inner 随页面从视口底部进入时，
 *   绕左下角从 30° 旋转到 0°（转正于视口 25% 处）
 * - 钉住：下一页翻入期间，把上一页的内容层反向 translateY，
 *   让底页视觉上保持不动，翻完落位后立即清除 transform
 * - 只变换内容层、不动 section 本身，避免干扰 scroll-snap 吸附点；
 *   静止时无任何 transform，不影响页内 fixed 弹层
 */
export const PageTurnFlow: React.FC<PageTurnFlowProps> = ({ scrollerRef, children }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef?.current;
    if (!root || !scroller || reducedMotion) return;

    const sections = Array.from(
      root.querySelectorAll<HTMLElement>('[data-page-turn-section]'),
    );
    const inners = sections.map((s) => s.querySelector<HTMLElement>('[data-page-turn-inner]'));
    if (sections.length === 0) return;

    // 预提升合成层：滚动中 transform 反复增删会导致层被反复提升/撤销，
    // 每次提升都重绘一整页（上滑时在过渡区边缘微调滚动尤其明显），常驻 will-change 消除抖动
    inners.forEach((inner) => {
      if (!inner) return;
      inner.style.willChange = 'transform';
      inner.style.backfaceVisibility = 'hidden';
    });
    let raf = 0;

    const update = () => {
      raf = 0;
      const vh = scroller.clientHeight;

      for (let i = 0; i < sections.length; i++) {
        const inner = inners[i];
        if (!inner) continue;

        // 每个 inner 只写入一次，避免旋转与钉住互相覆写
        let transform = '';

        // 翻入旋转（第 2 页起）：本页从视口底部进入时绕左下角转正
        if (i > 0) {
          const entered = vh - sections[i].getBoundingClientRect().top;
          const flip = Math.min(Math.max(entered / (vh * 0.75), 0), 1);
          if (flip > 0 && flip < 1) {
            transform = `rotate(${30 * (1 - flip)}deg)`;
          }
        }

        // 钉住（最后一页除外）：下一页翻入期间反向位移抵消滚动
        if (i < sections.length - 1) {
          const entered = vh - sections[i + 1].getBoundingClientRect().top;
          if (entered > 0 && entered < vh) {
            transform = `translateY(${entered}px)`;
          }
        }

        inner.style.transform = transform;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => update();

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (raf) cancelAnimationFrame(raf);
      inners.forEach((inner) => {
        if (!inner) return;
        inner.style.transform = '';
        inner.style.willChange = '';
        inner.style.backfaceVisibility = '';
      });
    };
  }, [reducedMotion, scrollerRef]);

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  );
};

export default PageTurnFlow;
