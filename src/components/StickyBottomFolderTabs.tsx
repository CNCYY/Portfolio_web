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
  isVisible: boolean;
  onNavigateToSection: (sectionId: string) => void;
  onOpenSearch?: () => void;
  onOpenContact?: () => void;
}

export const StickyBottomFolderTabs: React.FC<Props> = ({
  tabs,
  activeSectionId,
  isVisible,
  onNavigateToSection,
}) => {
  return (
    <nav
      aria-label="Editorial folder bottom tabs"
      className={`fixed bottom-0 inset-x-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none select-none ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col items-center overflow-visible">
        {/* Horizontal Row of Die-Cut Archival Paper Folder Tabs (Taller headroom for popups) */}
        <div className="flex items-end justify-center w-full overflow-x-auto no-scrollbar pointer-events-auto pt-4 sm:pt-6 pb-0 px-3 -mb-[1px] min-h-[54px] sm:min-h-[60px]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeSectionId;

            return (
              <button
                key={tab.id}
                onClick={() => onNavigateToSection(tab.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`group relative flex items-end justify-center transition-[height,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] -ml-2.5 sm:-ml-3 first:ml-0 shrink-0 cursor-pointer ${
                  isActive
                    ? 'h-[44px] sm:h-[48px] z-30'
                    : 'h-[32px] sm:h-[35px] z-10 hover:h-[37px] sm:hover:h-[40px] hover:z-20'
                }`}
              >
                {/* Authentic Die-Cut Folder Tab SVG Silhouette (Exact match to image_78e6d42f.webp) */}
                <svg
                  className="absolute inset-0 w-full h-full -z-10 pointer-events-none filter drop-shadow-[0_-2px_6px_rgba(40,30,20,0.04)]"
                  viewBox="0 0 100 36"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0,36 C 6,36 8,8 14,2 C 16,0 20,0 24,0 L 76,0 C 80,0 84,0 86,2 C 92,8 94,36 100,36 Z"
                    fill={isActive ? '#FBF9F2' : '#ECE8DB'}
                    stroke="#D8D2C2"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    className="transition-colors duration-300 group-hover:fill-[#F4F1E6]"
                  />
                  {/* Bottom boundary line: open on active tab to merge seamlessly into folder sheet below */}
                  <line
                    x1="0"
                    y1="36"
                    x2="100"
                    y2="36"
                    stroke={isActive ? '#FBF9F2' : '#D8D2C2'}
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                {/* Tab Label Content */}
                <div className="px-4 sm:px-6 h-full flex items-center justify-center gap-1.5 whitespace-nowrap pt-1">
                  {isActive ? (
                    /* Active Tab */
                    <span className="font-sans tracking-wide text-stone-900 font-semibold text-xs sm:text-[13px]">
                      {tab.activeLabel ?? tab.label}
                    </span>
                  ) : (
                    /* Inactive Tab */
                    <div className="flex items-baseline gap-1 text-stone-600 group-hover:text-stone-950 transition-colors">
                      <span className="font-sans text-[11px] sm:text-xs font-medium tracking-wide">
                        {tab.label}
                      </span>
                      {tab.subtext && (
                        <span className="text-[9px] sm:text-[10px] text-stone-400 font-normal">
                          {tab.subtext}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continuous Bottom Cream Archival Folder Ledge (Forms one physical sheet with active tab) */}
        <div className="w-full h-3 sm:h-3.5 bg-[#FBF9F2] border-t border-[#D8D2C2] shadow-[0_-2px_10px_rgba(40,30,20,0.03)] pointer-events-auto" />
      </div>
    </nav>
  );
};
