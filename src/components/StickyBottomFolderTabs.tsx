import React from 'react';

export interface FolderTab {
  id: string;
  roman?: string;
  /** 激活态文案，缺省复用 label */
  activeLabel?: string;
  label: string;
  /** 非激活态补充小字（如罗马序号），缺省不显示 */
  subtext?: string;
  isHero: boolean;
}

interface Props {
  tabs: FolderTab[];
  activeSectionId: string;
  /** 是否显示导航（封面页隐藏，进入正文后出现） */
  isVisible: boolean;
  onNavigateToSection: (sectionId: string) => void;
  onOpenSearch?: () => void;
  onOpenContact?: () => void;
}

/* 侧边书本索引：与纸面同色系的两种状态，选中项透出纸色与页面连成一体 */
const INACTIVE_TONE = { fill: '#F1EDE2', hover: '#F7F4EA', text: '#A8A29E' };
const ACTIVE_TONE = { fill: '#FCFBF9', text: '#44403C' };

/* Die-cut 轮廓（水平翻转）：右缘中部竖直贴向屏幕边缘，上下两端 45° 斜切收进，
   相邻标签拼出楔形豁口，形成书本索引的斜切端头（viewBox 0 0 44 100） */
const TAB_PATH = 'M 0,0 L 14,0 L 43,20 L 43,80 L 14,100 L 0,100 Z';
/* 开放描边路径：刻意缺少左缘竖线，左缘交给内阴影处理 */
const TAB_OUTLINE = 'M 0,0 L 14,0 L 43,20 L 43,80 L 14,100 L 0,100';

export const StickyBottomFolderTabs: React.FC<Props> = ({
  tabs,
  activeSectionId,
  isVisible,
  onNavigateToSection,
}) => {
  return (
    <nav
      aria-label="Editorial folder tabs"
      style={{ right: 'var(--scrollbar-w, 0px)' }}
      className={`fixed top-0 bottom-0 z-40 flex flex-col select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeSectionId;
        const tone = isActive ? ACTIVE_TONE : INACTIVE_TONE;

        return (
          <button
            key={tab.id}
            onClick={() => onNavigateToSection(tab.id)}
            aria-current={isActive ? 'true' : undefined}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.setProperty('--tone', INACTIVE_TONE.hover);
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.setProperty('--tone', INACTIVE_TONE.fill);
            }}
            style={{ '--tone': tone.fill } as React.CSSProperties}
            className={`folder-tab-btn group relative flex-1 min-h-0 flex items-center justify-center cursor-pointer w-[34px] sm:w-[42px] ${
              isActive ? 'z-30' : 'z-10 hover:z-20'
            }`}
          >
            {/* 模切轮廓：选中项不描左边线，未选中项左缘用内阴影表现凹陷 */}
            <svg
              className="absolute inset-0 w-full h-full -z-10 pointer-events-none"
              viewBox="0 0 44 100"
              preserveAspectRatio="none"
            >
              <defs>
                <clipPath id={`tab-clip-${tab.id}`}>
                  <path d={TAB_PATH} />
                </clipPath>
                <linearGradient id={`tab-inset-${tab.id}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#2E2A22" stopOpacity="0.16" />
                  <stop offset="0.22" stopColor="#2E2A22" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={TAB_PATH}
                fill="var(--tone)"
                className="transition-[fill] duration-300"
              />
              {!isActive && (
                <rect
                  x="0"
                  y="0"
                  width="44"
                  height="100"
                  fill={`url(#tab-inset-${tab.id})`}
                  clipPath={`url(#tab-clip-${tab.id})`}
                />
              )}
              {/* 开放描边：不含左缘竖线，只勾上下斜切与右缘 */}
              <path
                d={TAB_OUTLINE}
                fill="none"
                stroke="#E2DCCC"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* 标签文字：顺时针旋转 90°，自上而下阅读 */}
            <div
              className="flex items-baseline gap-1 whitespace-nowrap"
              style={{ transform: 'rotate(90deg)' }}
            >
              <span
                className={`font-sans tracking-[0.15em] transition-colors duration-300 ${
                  isActive
                    ? 'font-semibold text-xs sm:text-[13px]'
                    : 'font-medium text-[10px] sm:text-[11px]'
                }`}
                style={{ color: tone.text }}
              >
                {isActive ? (tab.activeLabel ?? tab.label) : tab.label}
              </span>
              {!isActive && tab.subtext && (
                <span
                  className="text-[9px] font-normal opacity-70"
                  style={{ color: tone.text }}
                >
                  {tab.subtext}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
};
