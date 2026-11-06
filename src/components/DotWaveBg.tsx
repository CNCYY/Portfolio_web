import { useEffect, useRef } from 'react';

/** 点阵波纹背景：替代静态 radial-gradient 点阵，光标划过时点阵泛起波纹。
 *  - 15px 网格与原 .dot-grid 完全一致，基点预渲染到离屏画布，每帧只贴图 + 更新光标附近的点
 *  - 光标静止 400ms 后波纹自然平息，rAF 完全停止（无闲置渲染开销）
 *  - 父级需要 isolate（isolation: isolate）建立层叠上下文，本层 -z-10 沉到内容之下、背景色之上 */
export default function DotWaveBg({ dot, wave }: { dot: string; wave: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SP = 15; // 网格间距（与 dot-grid 一致）
    const R = 110; // 波纹影响半径
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let dpr = 1;
    let base: HTMLCanvasElement | null = null;
    let cols = 0;
    let rows = 0;
    let scale = new Float32Array(0); // 每个点的当前波峰幅度
    let active: number[] = []; // 待衰减的点索引
    let mx = -1e5;
    let my = -1e5; // 光标视口坐标
    let lastMoveT = 0;
    let visible = false;
    let running = false;
    let raf = 0;

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / SP) + 1;
      rows = Math.ceil(h / SP) + 1;
      scale = new Float32Array(cols * rows);
      active = [];
      // 预渲染静态基点
      base = document.createElement('canvas');
      base.width = canvas.width;
      base.height = canvas.height;
      const b = base.getContext('2d');
      if (b) {
        b.scale(dpr, dpr);
        b.fillStyle = dot;
        for (let gy = 0; gy < rows; gy++) {
          for (let gx = 0; gx < cols; gx++) {
            b.beginPath();
            b.arc(gx * SP, gy * SP, 1, 0, Math.PI * 2);
            b.fill();
          }
        }
      }
      // 立即呈现静态点阵（含 prefers-reduced-motion 场景）
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (base) ctx.drawImage(base, 0, 0);
    };

    const frame = () => {
      raf = 0;
      const rect = canvas.getBoundingClientRect();
      const lx = mx - rect.left;
      const ly = my - rect.top;
      // 光标附近的点朝波峰幅度抬升（光标静止 400ms 后停止激发，让波纹自然平息）
      const attacking = performance.now() - lastMoveT < 400;
      if (attacking) {
        const c0 = Math.max(0, Math.floor((lx - R) / SP));
        const c1 = Math.min(cols - 1, Math.ceil((lx + R) / SP));
        const r0 = Math.max(0, Math.floor((ly - R) / SP));
        const r1 = Math.min(rows - 1, Math.ceil((ly + R) / SP));
        for (let gy = r0; gy <= r1; gy++) {
          for (let gx = c0; gx <= c1; gx++) {
            const dx = gx * SP - lx;
            const dy = gy * SP - ly;
            const p = 1 - Math.sqrt(dx * dx + dy * dy) / R;
            if (p <= 0) continue;
            const i = gy * cols + gx;
            const target = p * p * 1.6;
            if (target > scale[i]) {
              scale[i] += (target - scale[i]) * 0.35;
              if (active.indexOf(i) < 0) active.push(i);
            }
          }
        }
      }
      // 绘制：静态基点 + 波动点
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (base) ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = wave;
      for (let k = active.length - 1; k >= 0; k--) {
        const i = active[k];
        scale[i] *= 0.9;
        if (scale[i] < 0.02) {
          scale[i] = 0;
          active.splice(k, 1);
          continue;
        }
        const gx = i % cols;
        const gy = (i / cols) | 0;
        ctx.beginPath();
        ctx.arc(gx * SP, gy * SP, 1 + scale[i] * 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (visible && active.length) {
        raf = requestAnimationFrame(frame);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (!running && visible && !reduced) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      lastMoveT = performance.now();
      start();
    };

    rebuild();
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        running = false;
      }
      start();
    });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', rebuild);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', rebuild);
    };
  }, [dot, wave]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />;
}
