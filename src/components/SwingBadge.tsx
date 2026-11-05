import React, { useEffect, useRef } from 'react';

interface SwingBadgeProps {
  /** 支点（顶部）到卡片挂点的静止绳长 */
  ropeLength?: number;
  /** 卡片宽度等样式，如 w-[300px] sm:w-[420px] */
  className?: string;
  children: React.ReactNode;
}

/**
 * 弹性工牌：钟摆 + 弹簧绳物理模拟。
 * - 进入视口时从收起状态落下并来回荡动，逐渐静止竖直悬挂
 * - 可拖拽甩动，松手后带弹性地摆回
 * - 静止/离屏时完全停止 rAF，无持续渲染开销
 */
export function SwingBadge({ ropeLength = 84, className = '', children }: SwingBadgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const st = useRef({
    theta: -0.4,             // 摆角（弧度，0 = 竖直下垂）：小倾角，重心放在绳的弹性拉伸上
    omega: 0,                // 角速度
    r: ropeLength * 0.35,    // 当前绳长：初始收得更短，入场时重力拉伸更明显
    rVel: 0,                 // 绳长变化速度
    dragging: false,
    entered: false,          // 是否已触发入场
    settled: false,
    raf: 0,
    last: 0,
    pointerId: -1,
    downX: 0,
    downY: 0,
    moved: 0,                // 按下后累计移动距离（区分点击与拖拽）
    targetTheta: 0,
    targetR: ropeLength,
    suppressClick: false,
  });

  useEffect(() => {
    const restLen = ropeLength;
    const G = 2600;          // 重力 px/s²
    const SPRING_K = 220;    // 绳子弹性
    const SPRING_DAMP = 11;  // 弹簧阻尼：偏小，入场时绳的拉伸回弹更弹、更有蹦床感
    const ANG_DAMP = 1.9;    // 摆动阻尼：偏大，侧摆快速收敛，只留轻微晃动

    const s = st.current;
    const root = rootRef.current!;
    const rope = ropeRef.current!;
    const card = cardRef.current!;

    const writePose = () => {
      const dx = s.r * Math.sin(s.theta);
      const dy = s.r * Math.cos(s.theta) - restLen;
      card.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${s.theta.toFixed(4)}rad)`;
      rope.style.height = `${s.r.toFixed(2)}px`;
      rope.style.transform = `rotate(${s.theta.toFixed(4)}rad)`;
    };

    const stopLoop = () => {
      if (s.raf) cancelAnimationFrame(s.raf);
      s.raf = 0;
    };

    const tick = (t: number) => {
      const dt = Math.min((t - s.last) / 1000 || 0.016, 0.032);
      s.last = t;

      if (s.dragging) {
        // 拖拽中：平滑跟随目标，反推速度作为松手时的初速度
        const follow = 1 - Math.exp(-22 * dt);
        const prevTheta = s.theta;
        const prevR = s.r;
        s.theta += (s.targetTheta - s.theta) * follow;
        s.r += (s.targetR - s.r) * follow;
        s.omega = Math.max(-14, Math.min(14, (s.theta - prevTheta) / dt));
        s.rVel = Math.max(-900, Math.min(900, (s.r - prevR) / dt));
      } else {
        // 自由摆动：绳长方向弹簧（含离心拉伸），切向重力单摆
        const rAcc =
          -SPRING_K * (s.r - restLen) -
          SPRING_DAMP * s.rVel +
          s.omega * s.omega * s.r +
          G * (Math.cos(s.theta) - 1);
        const thetaAcc =
          -(G / s.r) * Math.sin(s.theta) -
          ANG_DAMP * s.omega -
          (2 * s.rVel * s.omega) / s.r;

        s.rVel += rAcc * dt;
        s.omega += thetaAcc * dt;
        s.r += s.rVel * dt;
        s.theta += s.omega * dt;

        // 静止判定：能量足够低时吸附到静止位，停止渲染循环
        if (
          Math.abs(s.theta) < 0.004 &&
          Math.abs(s.omega) < 0.03 &&
          Math.abs(s.r - restLen) < 0.8 &&
          Math.abs(s.rVel) < 3
        ) {
          s.theta = 0;
          s.omega = 0;
          s.r = restLen;
          s.rVel = 0;
          s.settled = true;
          writePose();
          s.raf = 0;
          return;
        }
      }

      writePose();
      s.raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (s.raf) return;
      s.last = performance.now();
      s.raf = requestAnimationFrame(tick);
    };

    // 初始为收起待落下姿态（未入视口前静止悬挂在入口姿态）
    writePose();

    // 入场触发 + 离屏暂停
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!s.entered) {
            s.entered = true; // 从初始收起姿态释放，落下并荡动
            startLoop();
          } else if (!s.settled && !s.dragging) {
            startLoop();
          }
        } else if (!s.dragging) {
          stopLoop();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(root);

    // 兜底触发：自定义 snap 滚动容器等场景下 IO 回调偶发不触发，
    // 监听实际滚动容器的 scroll 事件做几何可见性检查
    let scroller: HTMLElement | null = root.parentElement;
    while (scroller) {
      const oy = getComputedStyle(scroller).overflowY;
      if (oy === 'auto' || oy === 'scroll') break;
      scroller = scroller.parentElement;
    }
    const detachFallback = () => {
      scroller?.removeEventListener('scroll', checkVisible);
      window.removeEventListener('scroll', checkVisible);
      window.removeEventListener('resize', checkVisible);
      window.clearTimeout(fallbackTimer);
    };
    const checkVisible = () => {
      if (s.entered || s.dragging) return;
      const rect = root.getBoundingClientRect();
      if (rect.height === 0) return;
      const visibleH = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visibleH / rect.height >= 0.3) {
        s.entered = true;
        startLoop();
        detachFallback();
      }
    };
    const fallbackTimer = window.setTimeout(checkVisible, 400);
    scroller?.addEventListener('scroll', checkVisible, { passive: true });
    window.addEventListener('scroll', checkVisible, { passive: true });
    window.addEventListener('resize', checkVisible, { passive: true });

    // 拖拽：超过 6px 才算拖拽，否则保留点击（邮箱复制）
    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== s.pointerId) return;
      s.moved = Math.max(s.moved, Math.hypot(e.clientX - s.downX, e.clientY - s.downY));
      if (!s.dragging) {
        if (s.moved <= 6) return;
        s.dragging = true;
        card.style.cursor = 'grabbing';
      }
      const rect = root.getBoundingClientRect();
      const px = e.clientX - (rect.left + rect.width / 2);
      const py = e.clientY - rect.top;
      s.targetTheta = Math.max(-1.35, Math.min(1.35, Math.atan2(px, Math.max(py, 24))));
      s.targetR = Math.max(restLen * 0.4, Math.min(restLen * 2.0, Math.hypot(px, py)));
      s.settled = false;
      startLoop();
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== s.pointerId) return;
      window.removeEventListener('pointermove', onMove);
      if (s.dragging) {
        s.suppressClick = true;
        window.setTimeout(() => (s.suppressClick = false), 150);
      }
      s.dragging = false;
      card.style.cursor = 'grab';
    };

    const onDown = (e: PointerEvent) => {
      s.pointerId = e.pointerId;
      s.downX = e.clientX;
      s.downY = e.clientY;
      s.moved = 0;
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
      window.addEventListener('pointercancel', onUp, { once: true });
    };

    card.addEventListener('pointerdown', onDown);

    return () => {
      stopLoop();
      io.disconnect();
      detachFallback();
      card.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [ropeLength]);

  return (
    <div ref={rootRef} className="relative w-fit" style={{ paddingTop: ropeLength }}>
      {/* 挂绳：锚在顶部支点，随摆角旋转、随弹性伸缩 */}
      <div
        ref={ropeRef}
        className="absolute left-1/2 top-0 w-[3px] -ml-[1.5px] rounded-full bg-stone-800 origin-top"
      >
        {/* 绳端金属夹 */}
        <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 block w-[11px] h-[15px] rounded-[3px] bg-gradient-to-b from-stone-300 to-stone-500 border border-stone-600/60 shadow-sm" />
      </div>

      {/* 工牌卡片：变换原点为顶部挂点 */}
      <div
        ref={cardRef}
        className={`relative mx-auto origin-top will-change-transform select-none ${className}`}
        style={{ cursor: 'grab', touchAction: 'none' }}
        onClickCapture={(e) => {
          if (st.current.suppressClick) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
