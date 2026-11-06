import { useEffect, useRef } from 'react';

/**
 * 陀螺仪光标（Gyroscope Cursor 的自研轻量版）
 * 箭头光标平滑跟随鼠标，并转向移动方向；速度越快箭头沿航向拉伸越多。
 * 仅在支持鼠标的设备启用，触屏设备自动跳过。
 */

const LERP_POS = 0.22; // 位置跟随平滑度
const LERP_ANGLE = 0.28; // 朝向平滑度

function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export default function GyroscopeCursor() {
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    const el = arrowRef.current;
    if (!el) return;

    let tx = -100;
    let ty = -100; // 真实指针位置
    let x = -100;
    let y = -100; // 平滑跟随位置
    let px = -100;
    let py = -100; // 上一帧位置
    let angle = 0; // 当前朝向（rad）
    let visible = false;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        x = px = tx;
        y = py = ty;
        visible = true;
        el.style.opacity = '1';
      }
    };
    const onLeave = () => {
      visible = false;
      el.style.opacity = '0';
    };
    const onDown = () => el.style.setProperty('--press', '0.78');
    const onUp = () => el.style.setProperty('--press', '1');

    const tick = () => {
      x += (tx - x) * LERP_POS;
      y += (ty - y) * LERP_POS;
      const dx = x - px;
      const dy = y - py;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.6) {
        angle = lerpAngle(angle, Math.atan2(dy, dx), LERP_ANGLE);
      }
      // 沿航向拉伸，速度越快越明显
      const stretch = 1 + Math.min(speed / 46, 0.45);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad) scale(var(--press, 1)) scaleX(${stretch})`;
      px = x;
      py = y;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div ref={arrowRef} aria-hidden className="gyro-cursor">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path
          d="M2.5 11.2 21.5 2.8 13.6 21.4 10.8 13.4 2.5 11.2Z"
          fill="#514961"
          stroke="#FAF6ED"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
