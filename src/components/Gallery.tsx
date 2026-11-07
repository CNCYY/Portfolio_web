const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* ── 横向缓慢滚动的图片廊 ──────────────────────────────────
   深色底，容器宽高与横向视频一致（aspect-video）。
   图片高低错落、上方 mono 编号（01. 02. …），缓慢匀速左移。
   列表渲染两份，轨道平移 -50% 时第二份恰好接上第一份，
   无缝循环；悬停暂停；系统开启「减少动态效果」时静止。 */
export function Gallery({ images }: { images: string[] }) {
  const still = stillness();
  const loop = [...images, ...images];

  return (
    <div className="gal" data-still={still || undefined}>
      <div className="gal-track">
        {loop.map((src, i) => (
          <div key={i} className="gal-item" data-alt={i % 2 ? 'true' : undefined}>
            <span className="gal-num">{String((i % images.length) + 1).padStart(2, '0')}.</span>
            <img
              src={src}
              alt=""
              draggable={false}
              loading={i < images.length ? 'eager' : 'lazy'}
              className="gal-img img-loading"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
