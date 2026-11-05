import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DESIGNER_INFO, PROJECTS } from '../data/portfolioData';
import { Layers, X } from 'lucide-react';

interface Props {
  activeTab: 'all' | 'tools' | 'interaction';
  setActiveTab: (tab: 'all' | 'tools' | 'interaction') => void;
  onSelectProjectCard: (projectId: string) => void;
  activeProjectInView?: string;
}

const PROFILE_ITEMS = [
  {
    no: '01',
    name: '物料定制平台',
    line1: '内部效率工具 / 业务流程优化',
    line2: '需求抽象、功能设计、AI 辅助开发、独立落地',
  },
  {
    no: '02',
    name: 'AI生成礼物活动',
    line1: 'AI 应用探索 / 社交互动玩法',
    line2: '业务机会识别、玩法机制、AI 工作流、系统衔接',
  },
  {
    no: '04',
    name: 'AI+H5活动',
    line1: 'vibe coding 的实际落地 / 社交互动玩法',
    line2: '通过 ai 将创意快速落地、快速简便上线',
  },
  {
    no: '05',
    name: '其他探索',
    line1: '个人创意原型',
    line2: '视觉探索、交互实验、快速实现',
  },
];

/** Fine grain noise used on the vellum surfaces (frosted tracing paper look) */
const VELLUM_NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")";

/** PROFILE 硫酸纸内容：标题带模糊重影（硫酸纸透印效果） */
const ProfileSheetContent: React.FC<{ scale?: 'sm' | 'lg' }> = ({ scale = 'sm' }) => {
  const titleCls = scale === 'lg' ? 'text-6xl sm:text-8xl' : 'text-4xl';
  const noCls = scale === 'lg' ? 'text-sm' : 'text-[10px]';
  const nameCls = scale === 'lg' ? 'text-xl sm:text-2xl' : 'text-xs';
  const descCls = scale === 'lg' ? 'text-sm sm:text-base' : 'text-[9px] leading-relaxed';

  return (
    <div className="select-none">
      <div className="relative inline-block">
        <span
          aria-hidden="true"
          className={`absolute inset-0 font-sans font-black tracking-tight text-stone-900 blur-lg opacity-25 ${titleCls}`}
        >
          PROFILE
        </span>
        <span className={`relative font-sans font-black tracking-tight text-stone-900 ${titleCls}`}>
          PROFILE
        </span>
      </div>

      <div className={scale === 'lg' ? 'mt-14 sm:mt-20 space-y-12 sm:space-y-16' : 'mt-6 space-y-5'}>
        {PROFILE_ITEMS.map((item) => (
          <div key={item.no} className="flex items-start gap-4 sm:gap-8">
            <div className={`shrink-0 ${scale === 'lg' ? 'w-40 sm:w-52' : 'w-20'}`}>
              <div className={`font-mono text-stone-500 ${noCls}`}>{item.no}</div>
              <div className={`font-semibold text-stone-900 ${nameCls}`}>{item.name}</div>
            </div>
            <div className={`text-stone-600 font-sans ${descCls}`}>
              <p>{item.line1}</p>
              <p>{item.line2}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ScatteredFolderHero: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onSelectProjectCard,
  activeProjectInView,
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Exactly three key project cards fanning out of the folder pocket
  const svgaProject = PROJECTS[0]; // 01. SVGA 自动化工具
  const aiGiftProject = PROJECTS[1]; // 02. AI 礼物生成与自动化上架
  const heyteaProject = PROJECTS[2]; // 03. 仿喜茶折叠小卡照片展示器

  return (
    <section
      id="hero-folder"
      className="min-h-screen snap-start snap-always flex flex-col justify-between pt-8 pb-6 border-b border-stone-200 bg-[#FCFBF9] overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Clean Minimalist Profile & Category Tabs */}
          <div className="lg:col-span-5 space-y-6 z-10">
            {/* Avatar */}
            <div className="relative group w-20 h-20 rounded-full overflow-hidden border border-stone-300 shadow-sm transition-transform duration-300 hover:scale-105 bg-stone-900">
              <img
                src={DESIGNER_INFO.avatar}
                alt={DESIGNER_INFO.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-1.5 transition-all duration-500 group-hover:scale-110"
              />
            </div>

            {/* Typography Lockup */}
            <div>
              <h1 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight text-stone-900 leading-tight">
                {DESIGNER_INFO.name}
              </h1>
              <p className="text-[11px] font-mono tracking-widest text-stone-500 uppercase mt-2">
                {DESIGNER_INFO.role}
              </p>
            </div>

            {/* Concise Editorial Copy */}
            <p className="text-stone-700 text-sm md:text-[15px] leading-relaxed font-sans max-w-lg">
              {DESIGNER_INFO.bioIntro}
            </p>

            <p className="text-stone-500 text-xs md:text-sm leading-relaxed font-sans max-w-lg">
              {DESIGNER_INFO.bioDetail}
            </p>

            {/* Unboxed Metadata Stats */}
            <div className="flex items-center flex-wrap gap-3 pt-1 text-xs text-stone-600 font-sans">
              <a
                href="https://github.com/CNCYY"
                target="_blank"
                rel="noreferrer"
                className="text-stone-900 font-medium hover:underline cursor-pointer"
              >
                GitHub @CNCYY ↗
              </a>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono tabular-nums">2 款线上开源工具</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono tabular-nums">10,000+ 近月请求</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono tabular-nums">{PROJECTS.length} 组落地交互作品</span>
            </div>

            {/* Category Filter Sub-Tabs */}
            <div className="pt-4 flex items-center gap-7 border-b border-stone-200 text-sm font-medium">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 transition-colors relative whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                全部精选
                {activeTab === 'all' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('tools')}
                className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'tools'
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <span>AI 与提效工具</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-stone-100 rounded-full text-stone-600">
                  2
                </span>
                {activeTab === 'tools' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('interaction')}
                className={`pb-3 transition-colors relative flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'interaction'
                    ? 'text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <span>拟物与微交互</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 bg-stone-100 rounded-full text-stone-600">
                  4
                </span>
                {activeTab === 'interaction' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Tactile Folder & Exactly Three Scattered Pictures Fanning Out */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[660px] lg:max-w-[740px] h-[580px] sm:h-[640px] lg:h-[680px] select-none">
              
              {/* Back Layer 0: Archival Grid Paper Desk Mat */}
              <div
                style={{ transform: 'rotate(-4deg) translate(-15px, -6px)' }}
                className="absolute inset-x-2 inset-y-4 bg-[#F7F5EF] rounded-3xl border border-stone-300/80 shadow-sm pointer-events-none z-0"
              >
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#1c1917_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
                <div className="absolute top-4 left-6 flex items-center gap-3 text-[10px] font-mono text-stone-400 uppercase tracking-widest">
                  <Layers className="w-3.5 h-3.5 text-stone-400" />
                  <span>CNCYY ARCHIVE · DOSSIER NO.01 · THREE FEATURED PLATES</span>
                </div>
              </div>

              {/* Back Layer 1: Folder Back Cover & Pocket Bed */}
              <div
                style={{ transform: 'rotate(0deg) translate(25px, 20px)' }}
                className="absolute right-0 bottom-4 w-80 sm:w-[480px] h-[460px] sm:h-[510px] rounded-3xl bg-[#B8D3DE] border border-[#9EBFCD] shadow-inner pointer-events-none z-5 overflow-hidden"
              >
                {/* Pocket inner drop shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* ========================================================
                  VELLUM PROFILE SHEET (Bottom layer of the folder pocket)
                  Translucent tracing paper with ghosted PROFILE print;
                  click to expand fullscreen above the folder.
                 ======================================================== */}
              <motion.div
                style={{ zIndex: 9 }}
                initial={{ rotate: 9, x: -6, y: -4 }}
                animate={{ rotate: 9, x: -6, y: -4 }}
                whileHover={{
                  rotate: 8,
                  x: -6,
                  y: -16,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => setIsProfileOpen(true)}
                className="absolute left-0 sm:left-4 top-0 w-52 sm:w-64 h-[520px] bg-white/55 backdrop-blur-[2px] border border-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.07)] cursor-pointer pointer-events-auto overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  <ProfileSheetContent scale="sm" />
                </div>
                {/* Vellum fibre sheen */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-stone-200/30" />
                {/* Fine grain noise */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay"
                  style={{ backgroundImage: VELLUM_NOISE }}
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 1 (LEFT): 01. SVGA 自动化工具
                  (Large Wide Matting, Leaning Left)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: hoveredCardId === svgaProject.id ? 50 : 17 }}
                initial={{ rotate: -12, x: -24, y: 85 }}
                animate={{ rotate: -12, x: -24, y: 85 }}
                whileHover={{
                  rotate: -11,
                  x: -24,
                  y: 73,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onMouseEnter={() => setHoveredCardId(svgaProject.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectProjectCard(svgaProject.id)}
                className="absolute left-0 sm:left-4 top-16 sm:top-20 w-96 sm:w-[456px] md:w-[480px] aspect-[4/3] cursor-pointer group"
              >
                <img
                  src={svgaProject.scatteredImage}
                  alt={svgaProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.28)] group-hover:scale-106 transition-transform duration-500"
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 2 (CENTER HIGH): 03. 仿喜茶折叠小卡
                  (Shooting Tallest Out of the Pocket Center)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: hoveredCardId === heyteaProject.id ? 50 : 16 }}
                initial={{ rotate: -1.5, x: 25, y: -5 }}
                animate={{ rotate: -1.5, x: 25, y: -5 }}
                whileHover={{
                  rotate: -0.5,
                  x: 25,
                  y: -17,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onMouseEnter={() => setHoveredCardId(heyteaProject.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectProjectCard(heyteaProject.id)}
                className="absolute left-24 sm:left-36 md:left-40 top-0 w-60 sm:w-72 md:w-76 aspect-[3/4] cursor-pointer group"
              >
                <img
                  src={heyteaProject.scatteredImage}
                  alt={heyteaProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.28)] group-hover:scale-108 transition-transform duration-500"
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 3 (BACK LAYER): AI 礼物折页卡
                  (Sits one layer beneath the AI gift card)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: 16 }}
                initial={{ rotate: 15, x: 58, y: 34 }}
                animate={{ rotate: 15, x: 58, y: 34 }}
                whileHover={{
                  rotate: 14,
                  x: 58,
                  y: 22,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => onSelectProjectCard(aiGiftProject.id)}
                className="absolute right-[-4px] sm:right-1 md:right-3 top-14 sm:top-[72px] w-52 sm:w-64 md:w-[268px] aspect-[4/5] cursor-pointer group"
              >
                <img
                  src="/assets/aistudio/hero_ai_gift_back.png"
                  alt="AI 礼物折页卡"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.26)] transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 3 (RIGHT): 02. AI 幸运礼物生成
                  (Glowing Dark Photo Matting, Leaning Right)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: hoveredCardId === aiGiftProject.id ? 50 : 15 }}
                initial={{ rotate: 13, x: 50, y: -5 }}
                animate={{ rotate: 13, x: 50, y: -5 }}
                whileHover={{
                  rotate: 12,
                  x: 50,
                  y: -17,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onMouseEnter={() => setHoveredCardId(aiGiftProject.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                onClick={() => onSelectProjectCard(aiGiftProject.id)}
                className="absolute right-2 sm:right-6 md:right-8 top-4 sm:top-6 w-58 sm:w-70 md:w-74 aspect-[3/4] cursor-pointer group"
              >
                <img
                  src={aiGiftProject.scatteredImage}
                  alt={aiGiftProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_18px_38px_rgba(0,0,0,0.32)] group-hover:scale-108 transition-transform duration-500"
                />
              </motion.div>

              {/* ========================================================
                  FOREFRONT LAYER: Pale Sky-Blue Manila Folder Flap Pocket
                  (The physical folder pocket holding the bottom of the 3 photos)
                 ======================================================== */}
              <div
                style={{
                  transform: 'rotate(1.5deg) translate(25px, 50px)',
                  zIndex: 25,
                }}
                className="absolute right-0 bottom-1 w-80 sm:w-[480px] h-[360px] sm:h-[390px] rounded-3xl bg-[#CFE3EB] border border-[#B4CDD7] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] p-6 sm:p-8 flex flex-col justify-between pointer-events-auto cursor-default backdrop-blur-sm"
              >
                {/* Physical Open Pocket Lip Accent with stitch line */}
                <div className="absolute inset-x-6 top-0 h-1 bg-gradient-to-r from-transparent via-[#98BAC9] to-transparent opacity-60" />

                {/* Left Die-Cut Tab: FOLDER 01 (Exact match to reference photo!) */}
                <div className="absolute -left-6.5 top-12 w-7.5 h-36 bg-[#CFE3EB] border-l border-y border-[#B4CDD7] rounded-l-2xl flex items-center justify-center shadow-md">
                  <span className="[writing-mode:vertical-rl] transform rotate-180 text-[11px] font-mono tracking-widest text-stone-700 font-bold select-none">
                    FOLDER 01
                  </span>
                </div>

                {/* Vertical Stamp Line (TS.SS - 10.01 in the reference image) */}
                <div className="flex justify-between items-start">
                  <div className="px-2 py-1.5 border border-stone-600/35 rounded-lg text-[10px] font-mono text-stone-800 tracking-wider [writing-mode:vertical-rl] font-semibold bg-[#C5DDE6]/50">
                    CNCYY · TS.SS - 10.01
                  </div>
                  <div className="text-right">
                    <span className="text-base font-serif italic text-stone-900 font-medium">
                      Studio CNCYY
                    </span>
                  </div>
                </div>

                {/* Folder Bottom Stamp & Interactive Tab Guide */}
                <div className="pt-4 border-t border-[#B4CDD7]/90 flex items-end justify-end">
                  {/* Embossed Wax / Monogram Seal */}
                  <div className="w-9 h-9 rounded-full border border-stone-600/40 bg-[#C0D9E3] flex items-center justify-center text-xs font-serif italic text-stone-900 font-bold shadow-inner">
                    CY
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          FULLSCREEN VELLUM PROFILE OVERLAY
          Frosted tracing-paper sheet expanding above the folder.
         ======================================================== */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            key="profile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70]"
          >
            {/* Transparent click-catcher on the left half */}
            <div
              className="absolute inset-0 cursor-pointer"
              onClick={() => setIsProfileOpen(false)}
            />

            {/* The vellum sheet itself: slightly oversized & rotated, laid over the right half */}
            <motion.div
              initial={{ x: '115%', rotate: -1 }}
              animate={{ x: 0, rotate: -4 }}
              exit={{ x: '115%', rotate: -1 }}
              transition={{ type: 'spring', stiffness: 170, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-[-6vh] right-[-2vw] h-[114vh] w-[46vw] min-w-[416px] bg-[#EFEDE7]/70 backdrop-blur-[26px] backdrop-saturate-150 backdrop-brightness-105 border border-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(255,255,255,0.3),0_35px_90px_rgba(0,0,0,0.22)] overflow-y-auto no-scrollbar cursor-default"
            >
              {/* Frosted vellum: soft light diffusion haze */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-white/10 to-stone-300/30" />
              {/* Frosted vellum: fine grain noise */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.30] mix-blend-overlay"
                style={{ backgroundImage: VELLUM_NOISE }}
              />

              <button
                onClick={() => setIsProfileOpen(false)}
                aria-label="Close profile sheet"
                className="absolute top-7 right-8 sm:top-9 sm:right-12 z-10 p-2.5 rounded-full border border-stone-400/40 bg-white/60 backdrop-blur-md text-stone-700 hover:text-stone-950 hover:border-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              <div className="relative px-10 sm:px-14 lg:px-20 py-16 sm:py-24">
                <ProfileSheetContent scale="lg" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
