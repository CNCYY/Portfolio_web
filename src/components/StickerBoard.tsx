import React, { useEffect, useRef, useState } from 'react';

type StickerKind = 'star' | 'dot' | 'heart' | 'img' | 'emoji';

/** 贴纸初始布局规格：以锚点元素矩形内的百分比定位 */
interface StickerSpec {
  id: string;
  kind: StickerKind;
  anchor: string; // 锚点元素 id（hero-folder / section-footer）
  px?: number; // 锚点内百分比 x（贴纸中心）
  py?: number; // 锚点内百分比 y（贴纸中心）
  edge?: { right: number; bottom: number }; // 或：相对容器右/下边缘的固定像素偏移（用于动画中的元素旁）
  color?: string; // star/dot 填充色
  src?: string; // 图片贴纸路径
  emoji?: string; // emoji 贴纸
  size: number; // px（star/dot 为边长；img 为高度；emoji 为字号）
  rot: number; // 基础旋转角度
  round?: boolean; // 图片是否圆形裁剪
  delay?: number; // 闪烁动画延迟
  immovable?: boolean; // 固定装饰（不可拖拽，如绳子）
}

interface StickerState extends StickerSpec {
  x: number; // 滚动容器内坐标（贴纸中心）
  y: number;
  moved: boolean; // 是否被用户粘贴过（粘贴后不再跟随锚点重算）
}

const OUTLINE = '#44403C';

/** 星星/圆点：封面 + 封底各一套 */
const DOODLE_SPECS: Omit<StickerSpec, 'anchor'>[] = [
  { id: 'd1', kind: 'star', px: 5.5, py: 16, color: '#F9A8D4', size: 22, rot: -12, delay: 0 },
  { id: 'd2', kind: 'star', px: 45, py: 9, color: '#93C5FD', size: 18, rot: 10, delay: 0.6 },
  { id: 'd3', kind: 'star', px: 94, py: 20, color: '#FDE047', size: 20, rot: 18, delay: 1.1 },
  { id: 'd4', kind: 'star', px: 8, py: 68, color: '#93C5FD', size: 20, rot: -8, delay: 1.6 },
  { id: 'd5', kind: 'star', px: 66, py: 90, color: '#F9A8D4', size: 18, rot: 14, delay: 0.3 },
  { id: 'd6', kind: 'star', px: 36, py: 92, color: '#FDE047', size: 16, rot: -15, delay: 0.9 },
  { id: 'd7', kind: 'dot', px: 24, py: 7, color: '#FDE047', size: 8, rot: 0, delay: 0.4 },
  { id: 'd8', kind: 'dot', px: 74, py: 12, color: '#F9A8D4', size: 7, rot: 0, delay: 1.2 },
  { id: 'd9', kind: 'dot', px: 13, py: 44, color: '#93C5FD', size: 7, rot: 0, delay: 0.7 },
  { id: 'd10', kind: 'dot', px: 96.5, py: 46, color: '#F9A8D4', size: 8, rot: 0, delay: 1.5 },
  { id: 'd11', kind: 'dot', px: 56, py: 80, color: '#93C5FD', size: 7, rot: 0, delay: 0.2 },
  { id: 'd12', kind: 'dot', px: 20, py: 87, color: '#FDE047', size: 6, rot: 0, delay: 1.0 },
];

/** 全部贴纸初始布局 */
const STICKER_SPECS: StickerSpec[] = [
  ...DOODLE_SPECS.map((s) => ({ ...s, anchor: 'hero-folder' })),
  ...DOODLE_SPECS.map((s) => ({ ...s, id: `f-${s.id}`, anchor: 'section-footer' })),
  // 封面文件夹上的图片/emoji 贴纸
  // 锚定静态的 660px 文件夹板（#hero-folder-board），用右/下边缘像素偏移定位
  // （口袋本身有入场动画不能直接锚定；口袋终位在板内右缘+21px、下缘+46px，480x390）
  { id: 'sticker-sheep', kind: 'emoji', anchor: 'hero-folder-board', edge: { right: 123, bottom: 296 }, emoji: '🐏', size: 26, rot: 8 },
  // 口袋下方：一颗 SVG 紫色爱心点缀
  { id: 'sticker-heart', kind: 'heart', anchor: 'hero-folder-board', edge: { right: 195, bottom: 148 }, color: '#C4B5FD', size: 26, rot: -10 },
];

/** 计算贴纸在滚动容器内的初始坐标 */
const computePos = (s: StickerSpec): { x: number; y: number } => {
  const anchor = document.getElementById(s.anchor);
  const container = document.getElementById('scroll-snap-viewport');
  if (!anchor || !container) return { x: 0, y: 0 };
  const ar = anchor.getBoundingClientRect();
  const cr = container.getBoundingClientRect();

  // 锚点元素右/下边缘的固定像素偏移：锚点必须是无动画的静态元素（如文件夹板），
  // 这样首次测量即为最终位置，不随旁边元素的入场动画跳动
  if (s.edge) {
    return {
      x: ar.left - cr.left + container.scrollLeft + (ar.width - s.edge.right),
      y: ar.top - cr.top + container.scrollTop + (ar.height - s.edge.bottom),
    };
  }

  return {
    x: ar.left - cr.left + container.scrollLeft + ((s.px ?? 0) / 100) * ar.width,
    y: ar.top - cr.top + container.scrollTop + ((s.py ?? 0) / 100) * ar.height,
  };
};

/**
 * 全局贴纸层：装饰贴纸（星星/圆点/图片/emoji）可以拖拽放置到页面任意位置。
 * 按住贴纸即可拖动 → 松开鼠标完成放置（带盖章动画）→ Esc 取消放回原处。
 */
export const StickerBoard: React.FC = () => {
  const [stickers, setStickers] = useState<StickerState[]>([]);
  const [layerHeight, setLayerHeight] = useState(0);
  const [picked, setPicked] = useState<{ id: string; grabDX: number; grabDY: number } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [justPasted, setJustPasted] = useState<string | null>(null);
  const pickedRef = useRef(picked);
  pickedRef.current = picked;

  // 初始测量 + 入场动画结束后复测（文件夹有摆入动画）+ 窗口尺寸变化复测
  useEffect(() => {
    const measure = () => {
      setStickers((prev) => {
        const prevMap = new Map(prev.map((s) => [s.id, s]));
        return STICKER_SPECS.map((spec) => {
          const old = prevMap.get(spec.id);
          // 已被用户移动过的贴纸保持原位
          if (old?.moved) return old;
          const pos = computePos(spec);
          return { ...spec, ...pos, moved: false };
        });
      });
      const container = document.getElementById('scroll-snap-viewport');
      if (container) setLayerHeight(container.scrollHeight);
    };

    measure();
    const t1 = window.setTimeout(measure, 2200); // 等封面入场动画结束
    const t2 = window.setTimeout(measure, 3500); // 兜底：动画/图片加载完成后再校准一次
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, []);

  // 拖拽中：贴纸跟随鼠标，松开即放置，Esc 取消放回原处
  useEffect(() => {
    if (!picked) return;
    const onMove = (e: PointerEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => pasteAt(e.clientX, e.clientY);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPicked(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKeyDown);
    document.body.classList.add('sticker-picking');
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('sticker-picking');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  /** 在视口坐标处粘贴当前拿起的贴纸 */
  const pasteAt = (clientX: number, clientY: number) => {
    const current = pickedRef.current;
    const container = document.getElementById('scroll-snap-viewport');
    if (!current || !container) return;
    const cr = container.getBoundingClientRect();
    const docX = clientX - cr.left + container.scrollLeft;
    const docY = clientY - cr.top + container.scrollTop;
    setStickers((prev) =>
      prev.map((s) =>
        s.id === current.id
          ? {
              ...s,
              x: docX - current.grabDX,
              y: docY - current.grabDY,
              moved: true,
            }
          : s,
      ),
    );
    setPicked(null);
    setJustPasted(current.id);
    window.setTimeout(() => setJustPasted(null), 450);
  };

  /** 按下贴纸：立即拿起跟随鼠标，松开后放置 */
  const onStickerPointerDown = (e: React.PointerEvent, s: StickerState) => {
    e.stopPropagation();
    e.preventDefault();
    const container = document.getElementById('scroll-snap-viewport');
    if (!container) return;
    const cr = container.getBoundingClientRect();
    // 贴纸中心当前在视口中的位置
    const centerVX = cr.left + (s.x - container.scrollLeft);
    const centerVY = cr.top + (s.y - container.scrollTop);
    setPicked({
      id: s.id,
      grabDX: e.clientX - centerVX,
      grabDY: e.clientY - centerVY,
    });
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const isPicked = (s: StickerState) => picked?.id === s.id;

  return (
    <div
      className="sticker-layer-in absolute left-0 top-0 w-full pointer-events-none z-[45]"
      style={{ height: layerHeight || undefined }}
    >
      {stickers.map((s) => {
        const pickedNow = isPicked(s);
        return (
          <span
            key={s.id}
            data-doodle-skip
            className={`absolute block touch-none select-none ${
              s.immovable
                ? 'pointer-events-none'
                : pickedNow
                  ? 'cursor-grabbing pointer-events-auto'
                  : 'cursor-grab pointer-events-auto'
            }`}
            style={
              pickedNow && cursorPos
                ? ({
                    position: 'fixed',
                    left: cursorPos.x - picked!.grabDX,
                    top: cursorPos.y - picked!.grabDY,
                    zIndex: 60,
                    transform: 'translate(-50%, -50%)',
                    '--rot': `${s.rot}deg`,
                  } as React.CSSProperties)
                : ({
                    left: s.x,
                    top: s.y,
                    transform: 'translate(-50%, -50%)',
                    '--rot': `${s.rot}deg`,
                  } as React.CSSProperties)
            }
            onPointerDown={(e) => onStickerPointerDown(e, s)}
            title={s.immovable ? undefined : '按住拖动贴纸，松开即放置（Esc 取消）'}
          >
            {/* 中层：旋转 + 悬停放大 + 粘贴盖章动画 */}
            <span
              className={`block ${s.immovable ? '' : 'sticker-lift'} ${s.kind === 'star' || s.kind === 'dot' ? 'doodle' : ''} ${
                justPasted === s.id ? 'sticker-stamped' : ''
              }`}
              style={{
                animationDelay: `${s.delay ?? 0}s`,
                // 固定贴纸没有 sticker-lift 类（旋转写在该类里），需单独补旋转
                ...(s.immovable ? { transform: 'rotate(var(--rot))' } : {}),
              }}
            >
              {s.kind === 'star' && (
                <svg width={s.size} height={s.size} viewBox="0 0 24 24" className="block">
                  <path
                    d="M12 0C13.2 6.9 17.1 10.8 24 12C17.1 13.2 13.2 17.1 12 24C10.8 17.1 6.9 13.2 0 12C6.9 10.8 10.8 6.9 12 0Z"
                    fill={s.color}
                    stroke={OUTLINE}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {s.kind === 'dot' && (
                <svg width={s.size} height={s.size} viewBox="0 0 24 24" className="block">
                  <circle cx="12" cy="12" r="8.5" fill={s.color} stroke={OUTLINE} strokeWidth="1.6" />
                </svg>
              )}
              {s.kind === 'heart' && (
                <svg width={s.size} height={s.size} viewBox="0 0 24 24" className="block">
                  <path
                    d="M12 21.2C12 21.2 2.6 14.9 2.6 8.6C2.6 5.4 5.1 2.9 8.2 2.9C9.8 2.9 11.2 3.7 12 4.9C12.8 3.7 14.2 2.9 15.8 2.9C18.9 2.9 21.4 5.4 21.4 8.6C21.4 14.9 12 21.2 12 21.2Z"
                    fill={s.color}
                    stroke={OUTLINE}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {s.kind === 'img' && (
                <img
                  src={s.src}
                  alt=""
                  draggable={false}
                  className={`block object-cover ${
                    s.round ? 'rounded-full' : ''
                  }`}
                  style={{
                    height: s.size,
                    width: s.round ? s.size : 'auto',
                    filter: 'drop-shadow(0 2px 4px rgba(28,25,23,0.18))',
                  }}
                />
              )}
              {s.kind === 'emoji' && (
                <span
                  className="block leading-none"
                  style={{ fontSize: s.size, filter: 'drop-shadow(0 2px 3px rgba(28,25,23,0.15))' }}
                >
                  {s.emoji}
                </span>
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};
