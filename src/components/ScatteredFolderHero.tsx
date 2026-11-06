import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Transition } from 'motion/react';
import { DESIGNER_INFO, PROJECTS } from '../data/portfolioData';
import { X } from 'lucide-react';

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
              <div className={`font-sans text-stone-500 ${noCls}`}>{item.no}</div>
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

/** 封面载入文字动画：模糊淡入 + 轻微上浮（参考 BlurFade） */
const BlurFadeIn: React.FC<{
  delay?: number;
  className?: string;
  children: React.ReactNode;
}> = ({ delay = 0, className, children }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    transition={{ delay: 0.1 + delay, duration: 0.55, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

/** 蓝色文件夹从屏幕右侧摆入：低刚度弹簧模拟钟摆摆动 */
const folderSwingTransition = (delay: number): Transition => ({
  x: { type: 'spring', stiffness: 46, damping: 12, delay },
  rotate: { type: 'spring', stiffness: 46, damping: 12, delay },
  opacity: { duration: 0.35, delay },
});

// 照片从口袋深处"倒出来"的过渡：位移丝滑滑入、旋转带轻微回稳、快速淡入
// delay 为各张的出场时间（硫酸纸折页 0.6 → 喜茶 0.72 → AI 折页 0.84 → AI 礼物 0.95 → SVGA 1.05）
const pour = (delay: number) => ({
  x: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as const, delay },
  y: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as const, delay },
  rotate: { duration: 1.15, ease: [0.3, 1.35, 0.5, 1] as const, delay },
  opacity: { duration: 0.45, ease: 'easeOut' as const, delay },
});

export const ScatteredFolderHero: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onSelectProjectCard,
  activeProjectInView,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // 照片解码完成前不开始倒出动画，避免大图解码阻塞主线程导致后续动画被跳过
  const [photosReady, setPhotosReady] = useState(false);
  // 倒出动画期间临时关闭口袋的 backdrop-blur（照片在其后方移动会每帧触发模糊重算造成卡顿）
  const [pouring, setPouring] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPouring(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const decodeAll = async () => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('#hero-folder-board img'));
      await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {}))));
      if (!cancelled) setPhotosReady(true);
    };
    decodeAll();
    const fallback = setTimeout(() => { if (!cancelled) setPhotosReady(true); }, 2500);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  // Exactly three key project cards fanning out of the folder pocket
  const svgaProject = PROJECTS[0]; // 01. SVGA 自动化工具
  const aiGiftProject = PROJECTS[1]; // 02. AI 礼物生成与自动化上架
  const heyteaProject = PROJECTS[2]; // 03. 仿喜茶折叠小卡照片展示器

  return (
    <section
      id="hero-folder"
      className="min-h-screen snap-start snap-always flex flex-col justify-between pt-8 pb-6 border-b border-stone-200 dot-grid overflow-hidden relative"
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex-1 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Clean Minimalist Profile & Category Tabs */}
          <div className="lg:col-span-5 space-y-6 z-10">
            {/* Avatar：从屏幕左侧沿曲线跳入（水平匀减速 + 垂直跳跃弧线） */}
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                x: { delay: 0.1, duration: 0.75, ease: 'easeOut' },
                opacity: { duration: 0.2, delay: 0.1 },
              }}
            >
              <motion.div
                initial={{ y: 90, rotate: -14 }}
                animate={{
                  y: [90, -64, 0, -26, 0],
                  rotate: [-14, 6, 0, -3, 0],
                }}
                transition={{
                  y: {
                    delay: 0.1,
                    duration: 0.9,
                    times: [0, 0.42, 0.62, 0.82, 1],
                    ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
                  },
                  rotate: {
                    delay: 0.1,
                    duration: 0.9,
                    times: [0, 0.42, 0.62, 0.82, 1],
                  },
                }}
              >
                <img
                  src={DESIGNER_INFO.avatar}
                  alt={DESIGNER_INFO.name}
                  className="h-[134px] w-auto object-contain"
                />
              </motion.div>
            </motion.div>

            {/* Typography Lockup */}
            <BlurFadeIn delay={0.12}>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-tight">
                  {DESIGNER_INFO.name}{' '}
                  <span aria-hidden="true" className="emoji-wave">👋</span>
                </h1>
                <p className="text-[11px] font-sans tracking-widest text-stone-500 mt-2">
                  {DESIGNER_INFO.role}
                </p>
              </div>
            </BlurFadeIn>

            {/* Concise Editorial Copy */}
            <BlurFadeIn delay={0.36}>
              <p className="text-stone-700 text-sm md:text-[15px] leading-relaxed font-sans max-w-lg">
                {DESIGNER_INFO.bioIntro}
              </p>
            </BlurFadeIn>

            {/* Unboxed Metadata Stats */}
            <BlurFadeIn delay={0.48}>
              <div className="flex items-center flex-wrap gap-3 pt-1 text-xs text-stone-600 font-sans">
                <a
                  href="https://github.com/CNCYY"
                  target="_blank"
                  rel="noreferrer"
                  className="font-sans text-stone-900 font-medium hover:underline cursor-pointer"
                >
                  GitHub @CNCYY ↗
                </a>
                {/* 暂时隐藏：2 款线上开源工具 */}
                {/* <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="font-sans tabular-nums">2 款线上开源工具</span> */}
              </div>
            </BlurFadeIn>
          </div>

          {/* Right Column: Tactile Folder & Exactly Three Scattered Pictures Fanning Out */}
          <div className="lg:col-span-7 flex justify-start">
            <div id="hero-folder-board" className="relative w-[660px] max-w-full shrink-0 h-[640px] select-none">
              
              {/* Back Layer 0: Archival Grid Paper Desk Mat */}
              <motion.div
                initial={{ x: 480, rotate: 16, opacity: 0 }}
                animate={{ x: -15, y: -6, rotate: -4, opacity: 1 }}
                transition={folderSwingTransition(0.15)}
                className="absolute inset-x-2 inset-y-4 bg-[#F7F5EF] rounded-3xl border border-stone-300/80 shadow-sm pointer-events-none z-0"
              >
                <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#1c1917_1.5px,transparent_1.5px)] [background-size:18px_18px]" />
              </motion.div>

              {/* Back Layer 1: Folder Back Cover & Pocket Bed */}
              <motion.div
                initial={{ x: 500, rotate: 18.5, opacity: 0 }}
                animate={{ x: 25, y: 20, rotate: 0, opacity: 1 }}
                transition={folderSwingTransition(0.15)}
                className="absolute right-0 bottom-4 w-[480px] h-[510px] rounded-3xl bg-white/60 backdrop-blur-md border border-[#E7E5E4] shadow-inner pointer-events-none z-5 overflow-hidden"
              >
                {/* Pocket inner drop shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none" />
              </motion.div>

              {/* ========================================================
                  VELLUM PROFILE SHEET (Bottom layer of the folder pocket)
                  Translucent tracing paper with ghosted PROFILE print;
                  click to expand fullscreen above the folder.
                 ======================================================== */}
              <motion.div
                style={{ zIndex: 9 }}
                initial={{ x: 301, y: 231, rotate: 26, opacity: 0 }}
                animate={photosReady ? { x: -6, y: -4, rotate: 9, opacity: 1 } : { x: 301, y: 231, rotate: 26, opacity: 0 }}
                transition={pour(0.6)}
                whileHover={{
                  rotate: 8,
                  x: -6,
                  y: -16,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => setIsProfileOpen(true)}
                className="absolute left-4 top-0 w-64 h-[520px] bg-white/55 border border-white/70 shadow-[0_12px_30px_rgba(0,0,0,0.07)] cursor-pointer pointer-events-auto overflow-hidden"
              >
                <div className="p-6">
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
                style={{ zIndex: 17 }}
                initial={{ x: 201, y: 240, rotate: -28, opacity: 0 }}
                animate={photosReady ? { x: -24, y: 85, rotate: -12, opacity: 1 } : { x: 201, y: 240, rotate: -28, opacity: 0 }}
                transition={pour(1.05)}
                whileHover={{
                  rotate: -11,
                  x: -24,
                  y: 73,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => onSelectProjectCard(svgaProject.id)}
                className="absolute left-4 top-20 w-[456px] aspect-[4/3] cursor-pointer group"
              >
                <img
                  src={svgaProject.scatteredImage}
                  alt={svgaProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.18)] group-hover:scale-106 transition-transform duration-500"
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 2 (CENTER HIGH): 03. 仿喜茶折叠小卡
                  (Shooting Tallest Out of the Pocket Center)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: 16 }}
                initial={{ x: 157, y: 299, rotate: -27, opacity: 0 }}
                animate={photosReady ? { x: 25, y: -5, rotate: -1.5, opacity: 1 } : { x: 157, y: 299, rotate: -27, opacity: 0 }}
                transition={pour(0.72)}
                whileHover={{
                  rotate: -0.5,
                  x: 25,
                  y: -17,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => onSelectProjectCard(heyteaProject.id)}
                className="absolute left-36 top-0 w-72 aspect-[3/4] cursor-pointer group"
              >
                <img
                  src={heyteaProject.scatteredImage}
                  alt={heyteaProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_14px_30px_rgba(0,0,0,0.18)] group-hover:scale-108 transition-transform duration-500"
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 3 (BACK LAYER): AI 礼物折页卡
                  (Sits one layer beneath the AI gift card)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: 16 }}
                initial={{ x: -83, y: 259, rotate: -26, opacity: 0 }}
                animate={photosReady ? { x: 58, y: 34, rotate: 15, opacity: 1 } : { x: -83, y: 259, rotate: -26, opacity: 0 }}
                transition={pour(0.95)}
                whileHover={{
                  rotate: 14,
                  x: 58,
                  y: 22,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => onSelectProjectCard(aiGiftProject.id)}
                className="absolute right-1 top-[72px] w-64 aspect-[4/5] cursor-pointer group"
              >
                <img
                  src="/assets/aistudio/hero_ai_gift_back.webp"
                  alt="AI 礼物折页卡"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_13px_26px_rgba(0,0,0,0.16)] transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </motion.div>

              {/* ========================================================
                  SCATTERED PHOTO 3 (RIGHT): 02. AI 幸运礼物生成
                  (Glowing Dark Photo Matting, Leaning Right)
                 ======================================================== */}
              <motion.div
                style={{ zIndex: 15 }}
                initial={{ x: -51, y: 281, rotate: 28, opacity: 0 }}
                animate={photosReady ? { x: 50, y: -5, rotate: 13, opacity: 1 } : { x: -51, y: 281, rotate: 28, opacity: 0 }}
                transition={pour(1.08)}
                whileHover={{
                  rotate: 12,
                  x: 50,
                  y: -17,
                  transition: { type: 'spring', stiffness: 300, damping: 22 },
                }}
                onClick={() => onSelectProjectCard(aiGiftProject.id)}
                className="absolute right-6 top-6 w-70 aspect-[3/4] cursor-pointer group"
              >
                <img
                  src={aiGiftProject.scatteredImage}
                  alt={aiGiftProject.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-[0_14px_30px_rgba(0,0,0,0.20)] group-hover:scale-108 transition-transform duration-500"
                />
              </motion.div>

              {/* ========================================================
                  FOREFRONT LAYER: Pale Sky-Blue Manila Folder Flap Pocket
                  (The physical folder pocket holding the bottom of the 3 photos)
                 ======================================================== */}
              <motion.div
                id="folder-pocket"
                style={{ zIndex: 25 }}
                initial={{ x: 500, rotate: 20, opacity: 0 }}
                animate={{ x: 25, y: 50, rotate: 1.5, opacity: 1 }}
                transition={folderSwingTransition(0.15)}
                className={`absolute right-0 bottom-1 w-[480px] h-[390px] rounded-3xl border border-[#E7E5E4] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.25)] p-8 flex flex-col justify-between pointer-events-auto cursor-default ${pouring ? 'bg-white/85' : 'bg-white/65 backdrop-blur-xl'}`}
              >
                {/* Physical Open Pocket Lip Accent with stitch line */}
                <div className="absolute inset-x-6 top-0 h-1 bg-gradient-to-r from-transparent via-[#D6D3D1] to-transparent opacity-60" />

                {/* Left Die-Cut Tab: FOLDER 01 (Exact match to reference photo!) */}
                <div className="absolute -left-[30px] top-12 w-7.5 h-36 bg-white/80 backdrop-blur-md border-l border-y border-[#E7E5E4] rounded-l-2xl flex items-center justify-center shadow-md">
                  <span className="[writing-mode:vertical-rl] transform rotate-180 text-[11px] font-sans tracking-widest text-stone-700 font-bold select-none">
                    FOLDER 01
                  </span>
                </div>

                {/* Studio Signature */}
                <div className="flex justify-end items-start">
                  <div className="text-right">
                    <span className="text-base italic text-stone-900 font-medium">
                      Studio CNCYY
                    </span>
                  </div>
                </div>
              </motion.div>

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
