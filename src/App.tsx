import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ScatteredFolderHero } from './components/ScatteredFolderHero';
import { ChapterPages } from './components/ChapterPages';
import { StickyBottomFolderTabs, FolderTab } from './components/StickyBottomFolderTabs';
import { SearchModal } from './components/SearchModal';
import { StickerBoard } from './components/StickerBoard';
import { SwingBadge } from './components/SwingBadge';
import GyroscopeCursor from './components/GyroscopeCursor';
import { Tooltip } from './components/ui/tooltip-card';
import { PROJECTS } from './data/portfolioData';
import { CHAPTERS, PROJECT_TO_CHAPTER } from './data/chapters';
import cardHolder from './assets/card-holder.png';

const CONTACT_EMAIL = '961947088@qq.com';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'tools' | 'interaction'>('all');
  const [activeHighlightedId, setActiveHighlightedId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('hero-folder');
  const [emailCopied, setEmailCopied] = useState<boolean>(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = CONTACT_EMAIL;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 1600);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter chapters based on the sub-tab (All / AI 与提效工具 / 拟物与微交互)
  const filteredChapters = useMemo(() => {
    if (activeTab === 'all') return CHAPTERS;
    return CHAPTERS.filter((c) => c.group === activeTab);
  }, [activeTab]);

  // All snap-sections list for scroll & keyboard tracking
  const allSectionIds = useMemo(() => {
    return ['hero-folder', ...filteredChapters.map((c) => `chapter-${c.id}`), 'section-footer'];
  }, [filteredChapters]);

  // Click on any scattered photo tab or navigation item -> smoothly scroll & snap to that plate
  const handleScrollToProject = (projectId: string) => {
    const chapterId = PROJECT_TO_CHAPTER[projectId];
    const targetId = chapterId ? `chapter-${chapterId}` : `project-${projectId}`;

    if (chapterId && !filteredChapters.some((c) => c.id === chapterId)) {
      setActiveTab('all');
    }

    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveSectionId(targetId);
        setActiveHighlightedId(projectId);
        setTimeout(() => {
          setActiveHighlightedId(null);
        }, 2500);
      }
    }, 60);
  };

  const folderTabs: FolderTab[] = useMemo(
    () => [
      {
        id: 'hero-folder',
        label: '封面',
        isHero: true,
      },
      ...filteredChapters.map((c) => ({
        id: `chapter-${c.id}`,
        label: c.tabLabel,
        isHero: false,
      })),
      {
        id: 'section-footer',
        label: 'Contact me',
        isHero: false,
      },
    ],
    [filteredChapters]
  );

  const handleNavigateToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSectionId(sectionId);
    }
  };

  // IntersectionObserver to dynamically detect which slide is currently centered/snapped
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observers: IntersectionObserver[] = [];

    allSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
              setActiveSectionId(id);
            }
          });
        },
        {
          root: container,
          threshold: [0.45, 0.75],
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [allSectionIds]);

  // Keyboard navigation (ArrowDown / ArrowUp / PageDown / PageUp) for swift snapped slide flipping
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSearchOpen) return;

      const currentIndex = allSectionIds.indexOf(activeSectionId);

      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (currentIndex < allSectionIds.length - 1) {
          e.preventDefault();
          handleNavigateToSection(allSectionIds[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentIndex > 0) {
          e.preventDefault();
          handleNavigateToSection(allSectionIds[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSectionId, allSectionIds, isSearchOpen]);

  return (
    <div
      ref={containerRef}
      id="scroll-snap-viewport"
      className="h-screen w-full overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory dot-grid text-stone-900 selection:bg-[#E5A99B] selection:text-stone-900 font-sans relative"
    >
      {/* 可拿起/粘贴的全局装饰贴纸层（星星/圆点/图片/emoji） */}
      <StickerBoard />

      {/* Sticky Bottom Folder Tabs (Appears on slide 2+ matching user reference image) */}
      <StickyBottomFolderTabs
        tabs={folderTabs}
        activeSectionId={activeSectionId}
        isVisible={activeSectionId !== 'hero-folder'}
        onNavigateToSection={handleNavigateToSection}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 1. Hero with Left Profile + Right Scattered Pictures Folder Tabs (Snap Slide 1) */}
      <main className="w-full">
        <ScatteredFolderHero
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSelectProjectCard={handleScrollToProject}
          activeProjectInView={activeHighlightedId || undefined}
        />

        {/* 2. 四个大页（Full-viewport Snap Slides 2..5） */}
        <ChapterPages chapters={filteredChapters} />
      </main>

      {/* 3. Minimalist Colophon Footer (Final Snap Slide) */}
      <footer
        id="section-footer"
        className="relative overflow-hidden min-h-[50vh] sm:min-h-[60vh] snap-start snap-always flex border-t border-stone-200 pb-16 bg-stone-100/30"
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col sm:flex-row items-start justify-between gap-8">
          {/* 左侧：CONNECT ME 卡套，从 footer 顶边垂下的物理挂牌 */}
          <div className="flex w-full sm:w-auto items-center justify-center sm:justify-start self-start">
            <SwingBadge ropeLength={150}>
              <div className="relative w-[430px] sm:w-[600px] select-none">
                <img
                  src={cardHolder}
                  alt="Contact me 卡套"
                  draggable={false}
                  className="w-full h-auto block"
                />
                {/* 邮箱地址：点击复制，悬停出现解释卡片 */}
                <Tooltip
                  content={emailCopied ? '已复制' : '点击复制'}
                  align="right"
                  side="bottom"
                  tone="#FAF6ED"
                  hug
                  containerClassName="absolute left-[64.64%] top-[49%] w-[28%] text-center"
                >
                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label="复制邮箱地址"
                    className="block w-full font-sans font-semibold tracking-tight text-[11px] sm:text-[14px] cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: '#514961' }}
                  >
                    {CONTACT_EMAIL}
                  </button>
                </Tooltip>
              </div>
            </SwingBadge>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-stone-500 font-sans self-center">
            <span className="font-bold text-stone-900 text-sm">CNCYY.</span>
          </div>
        </div>
      </footer>

      {/* 陀螺仪光标 */}
      <GyroscopeCursor />

      {/* Quick Search */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={PROJECTS}
        onSelectProject={(p) => handleScrollToProject(p.id)}
      />
    </div>
  );
}
