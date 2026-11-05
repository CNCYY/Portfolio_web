import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

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
 */
export const AutoVideo = ({ src, className }: { src: string; className?: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

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

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <video ref={ref} src={src} muted loop playsInline preload="none" className={className} />
    </motion.div>
  );
};
