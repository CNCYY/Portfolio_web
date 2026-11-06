import { useEffect, useRef } from 'react';

/**
 * 全站鼠标点击波纹：在点击位置生成一圈淡紫色圆环，
 * 由小变大并淡出（纯 CSS 动画，动画结束自动移除节点）。
 */
export default function ClickRipple() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const layer = layerRef.current;
      if (!layer) return;
      const ripple = document.createElement('span');
      ripple.className = 'click-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.addEventListener('animationend', () => ripple.remove());
      layer.appendChild(ripple);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]" />;
}
