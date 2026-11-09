import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import loadingArt from '../assets/loading-rummage.webp';

/**
 * 视口感知的自动播放视频：
 * 滚入视口（过半可见）才播放，滚出即暂停——src 常驻不释放，
 * 回屏 play() 必然恢复，不产生请求中断（ERR_ABORTED）。
 * preload="none"：未激活的视频完全不发请求（连元数据探测也没有，
 * 否则浏览器读完元数据中止连接会记一条无害的 ERR_ABORTED）。
 * 暂停后浏览器不再发 seek 请求，同屏始终只有当前页 1 条活跃流：
 * dev 下避免高频 range 请求耗尽文件句柄（EMFILE 崩掉 Vite），
 * 部署后也显著降低带宽与内存占用。
 * 切换动画：使用处以 key={src} 触发 remount，新视频淡入；
 * 旧视频立即卸载（无退出动画），任何时刻只有一条流，零额外加载。
 * 底部细进度条：rAF 循环跟随 currentTime 更新，仅播放时运行；
 * 同时是可拖动 scrubber——点击/按住轨道任意位置即 seek，拖动持续跟随
 * （pointer capture 保证拖出轨道也不断手；preload="none" 的视频首次
 * 拖动会先触发 load() 探测元数据，之后即可正常 seek）。
 * barColor：进度条填充色，由使用方按页面主题传入（默认白色）。
 */
export const AutoVideo = ({
  src,
  className,
  barColor,
}: {
  src: string;
  className?: string;
  barColor?: string;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafRef = useRef(0);
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  // 切换视频时重置就绪状态；已缓存的视频立即视为就绪
  useEffect(() => {
    setReady(false);
    const el = ref.current;
    if (el && el.readyState >= 3) setReady(true);
  }, [src]);

  // 观察可见性：可见过半才算激活，减少快速滚动经过时的误激活
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.4,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // muted 循环视频由 JS 调 play()，无需用户手势，行为与原 autoPlay 一致
    if (active) el.play().catch(() => {});
    else el.pause();
  }, [active]);

  // 进度条：播放中每帧刷新宽度；暂停/无时长时不跑循环
  useEffect(() => {
    const el = ref.current;
    const bar = barRef.current;
    if (!el || !bar) return;
    const tick = () => {
      const { duration, currentTime } = el;
      if (duration > 0) bar.style.width = `${Math.min(100, (currentTime / duration) * 100)}%`;
      if (el.paused || el.ended) {
        rafRef.current = 0;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    // 覆盖 play 事件（含循环重播）与初始 buffered 元数据就绪
    el.addEventListener('play', start);
    if (!el.paused && !el.ended && el.readyState >= 2) start();
    return () => {
      el.removeEventListener('play', start);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [active, src]);

  // 拖动进度条：按指针在轨道上的水平比例 seek，并手动同步一次条宽
  // （暂停态下 rAF 循环不跑，拖动时需要自己更新）
  const seekTo = (clientX: number) => {
    const el = ref.current;
    const track = trackRef.current;
    if (!el || !track) return;
    if (!(el.duration > 0)) {
      // preload="none" 且元数据未就绪：先触发一次加载，下次拖动即可 seek
      el.load();
      return;
    }
    const r = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    el.currentTime = ratio * el.duration;
    const bar = barRef.current;
    if (bar) bar.style.width = `${ratio * 100}%`;
  };

  const onScrubDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekTo(e.clientX);
  };
  const onScrubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingRef.current) seekTo(e.clientX);
  };
  const onScrubUp = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <motion.div
      className="relative h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        onCanPlay={() => setReady(true)}
        className={className}
      />
      {/* 加载占位：涂鸦女孩翻找动画，canplay 后淡出（transform/opacity 合成器动画） */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundColor: '#f7f2e7' }}
      >
        <img src={loadingArt} alt="" draggable={false} className="w-[120px] sm:w-[140px] h-auto" />
      </div>
      {/* 进度条轨道：加高命中区（视觉条仍 5px），可点击/拖动 seek */}
      <div
        ref={trackRef}
        onPointerDown={onScrubDown}
        onPointerMove={onScrubMove}
        onPointerUp={onScrubUp}
        onPointerCancel={onScrubUp}
        className="absolute inset-x-0 bottom-0 h-4 cursor-pointer touch-none"
      >
        <div className="absolute inset-x-0 bottom-0 h-[5px] bg-black/30">
          <div
            ref={barRef}
            className="h-full w-0 bg-white/95"
            style={barColor ? { backgroundColor: barColor } : undefined}
          />
        </div>
      </div>
    </motion.div>
  );
};
