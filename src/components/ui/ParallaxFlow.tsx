import React, { useEffect, useRef, useState } from 'react';

interface ParallaxFlowProps {
  /** 实际滚动容器（本应用为去 snap 后的滚动视口） */
  scrollerRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

/**
 * 视差滚动编排（纯 rAF 实现）：
 * - 标记 data-parallax="speed" 的装饰层随滚动以 (1 - speed) 的速率跟随，
 *   speed 越大滞后越多（0 = 完全跟随滚动，0.2 = 移动距离打八折）
 * - 位移按「元素中心到视口中心的距离」计算：元素居中时位移归零，
 *   静止时内容回到版式原位，不会残留偏移
 * - 基准坐标在挂载/窗口尺寸变化时清空 transform 后测量一次，
 *   滚动帧只做一次乘法 + translate3d 写入，避免读取实时 rect 造成反馈漂移
 * - 只用于装饰层（data-parallax 标记），不碰交互元素与 framer 管理的节点
 */
export const ParallaxFlow: React.FC<ParallaxFlowProps> = ({ scrollerRef, children }) => {
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

    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
    if (els.length === 0) return;

    // 常驻合成层，滚动帧只写 transform 不触发重排
    els.forEach((el) => {
      el.style.willChange = 'transform';
      el.style.backfaceVisibility = 'hidden';
    });

    // 基准测量：清掉 transform 后记录元素在滚动内容坐标系中的几何
    let bases: { top: number; half: number }[] = [];
    const measure = () => {
      els.forEach((el) => (el.style.transform = ''));
      const scrollRect = scroller.getBoundingClientRect();
      bases = els.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          top: r.top - scrollRect.top + scroller.scrollTop,
          half: r.height / 2,
        };
      });
    };
    measure();

    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = scroller.clientHeight / 2;
      for (let i = 0; i < els.length; i++) {
        const speed = parseFloat(els[i].dataset.parallax || '0');
        if (!speed) continue;
        // 未平移时元素中心相对视口中心的距离；居中时位移自然归零
        const delta = bases[i].top - scroller.scrollTop + bases[i].half - mid;
        els[i].style.transform = `translate3d(0, ${(-delta * speed).toFixed(2)}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    update();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // 图片等资源就绪后内容高度会变，重新测量基准
    window.addEventListener('load', onResize);

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      if (raf) cancelAnimationFrame(raf);
      els.forEach((el) => {
        el.style.transform = '';
        el.style.willChange = '';
        el.style.backfaceVisibility = '';
      });
    };
  }, [reducedMotion, scrollerRef]);

  return <div ref={rootRef} className="contents">{children}</div>;
};

export default ParallaxFlow;
