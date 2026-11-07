import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Github } from 'lucide-react';
import { Chapter, ChapterSection } from '../data/chapters';
import { ImageCompare } from './ImageCompare';
import { Gallery } from './Gallery';
import { GiftAccordion } from './GiftAccordion';
import { MiniCarousel } from './MiniCarousel';
import { ReceiptBoard } from './ReceiptBoard';
import { AutoVideo } from './AutoVideo';
import { Tooltip } from './ui/tooltip-card';

/** 每页核心价值高亮的配色（荧光底块 + 竖线/圆点） */
const CORE_TONES: Record<string, string> = {
  'svga-tools': 'core-yellow',
  'ai-gift': 'core-pink',
  'vibe-h5': 'core-blue',
  'creative-collection': 'core-green',
};

/** 每页视频进度条颜色 = 该页荧光底块色（对应 index.css 中 CORE_TONES 的 --cv-bg） */
const BAR_COLORS: Record<string, string> = {
  'svga-tools': '#f6f0cd',
  'ai-gift': '#f2d7e9',
  'vibe-h5': '#cfe0f2',
  'creative-collection': '#d7e8cf',
};

/**
 * 核心价值荧光笔高亮段：滚入视口后高亮块从左向右扫过（全选覆盖），
 * 左竖线先以光标形式闪烁，扫完后右竖线亮起、两线同相位闪烁（只播一次）。
 */
const CoreValueNote = ({ text, chapterId }: { text: string; chapterId: string }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlayed(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <p
      ref={ref}
      className={`core-value ${CORE_TONES[chapterId] ?? 'core-yellow'} ${played ? 'is-played' : ''} font-serif text-[16px] leading-relaxed text-stone-800`}
    >
      <span className="core-fill" aria-hidden="true" />
      <span className="core-text">{text}</span>
    </p>
  );
};

/** 「SVGA 文件」手绘马克笔下划线 + 悬停解释卡片 */
const SVGA_TERM = 'SVGA 文件';
const IntroText = ({ text }: { text?: string }) => {
  if (!text) return null;
  if (!text.startsWith(SVGA_TERM)) return <>{text}</>;
  return (
    <>
      <Tooltip content="SVGA 是由 YY 团队开发出来的一种跨平台的开源动画格式，广泛用于直播间的礼物物料特效、App 引导页及交互动效">
        <span className="relative cursor-help font-medium text-stone-800">
          SVGA 文件
          {/* 手写小问号：下划线起点左侧 */}
          <svg
            className="absolute -bottom-[2px] -left-[13px] h-[14px] w-[10px] -rotate-6"
            viewBox="0 0 10 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1.8 4.4 C 1.2 1.6, 7 0.7, 8.1 2.6 C 8.9 4.2, 6.6 5.2, 5.6 6.4 C 5 7.2, 5 8, 5.1 9.1"
              stroke="#b0563d"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M5.2 11.7 L 5.15 12.1"
              stroke="#b0563d"
              strokeWidth="1.9"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="absolute -bottom-[3px] left-0 h-[5px] w-full"
            viewBox="0 0 100 5"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M1 3.4 C 18 1.4, 36 4.4, 52 2.6 C 68 1.2, 86 4, 99 2.2"
              fill="none"
              stroke="#b0563d"
              strokeWidth="2.4"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </span>
      </Tooltip>
      {text.slice(SVGA_TERM.length)}
    </>
  );
};

interface Props {
  chapters: Chapter[];
}

export const ChapterPages: React.FC<Props> = ({ chapters }) => {
  // 每个大页默认展开第一个子项
  const [expanded, setExpanded] = useState<Record<string, string | null>>(() => {
    const initial: Record<string, string | null> = {};
    chapters.forEach((ch) => {
      initial[ch.id] = ch.sections[0]?.id ?? null;
    });
    return initial;
  });

  const toggle = (chapterId: string, sectionId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [chapterId]: prev[chapterId] === sectionId ? null : sectionId,
    }));
  };

  return (
    <div className="w-full">
      {chapters.map((ch) => {
        const mediaRight = Boolean(ch.demoVideo) || ch.sections.some((s) => s.video);
        const activeSection = ch.sections.find((s) => s.id === expanded[ch.id]);
        /* 页面级固定视频优先（第一页）；否则用当前选中子项的演示视频（第二页） */
        const videoSrc = ch.demoVideo ?? activeSection?.video;

        // 子项详情：分点说明 → 流程胶囊 → 设计意图；withMedia 控制是否渲染配图
        const renderDetail = (s: ChapterSection, withMedia: boolean) => (
          <>
            {s.points && (
              <dl className="space-y-3.5">
                {s.points.map((p) => (
                  <div key={p.label}>
                    <dt className="text-[11px] font-sans uppercase tracking-widest text-stone-400">
                      {p.label}
                    </dt>
                    <dd className="text-[15px] text-stone-700 leading-relaxed mt-1">
                      {p.text}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {(s.flow || s.flow2) && (
              <div className="space-y-3.5">
                {([s.flow, s.flow2] as (string[] | undefined)[]).map((steps, gi) => {
                  if (!steps) return null;
                  const label = gi === 0 ? s.flowLabel : s.flow2Label;
                  return (
                    <div key={gi}>
                      {label && (
                        <div className="text-[11px] font-sans uppercase tracking-widest text-stone-400 mb-1.5">
                          {label}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {steps.map((step, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-stone-300 text-[13px]">→</span>}
                            <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-[12px] font-sans text-stone-700">
                              {step}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {s.notes && (
              <ul className="space-y-1.5">
                {s.notes.map((n) => (
                  <li key={n} className="flex gap-2 text-[13px] text-stone-600 leading-relaxed">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}

            {withMedia && s.media && (
              <figure>
                <img
                  src={s.media}
                  alt={s.title}
                  className="w-full rounded-lg border border-stone-200 object-cover"
                />
                {s.mediaCaption && (
                  <figcaption className="text-[11px] font-sans text-stone-400 mt-2">
                    {s.mediaCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </>
        );

        // 配置 demoVideo 且未启用 inlineList 的大页：列表项与内容为一个整体——列表在左，内容向右展开；
        // inlineList 大页（第三页）：列表内嵌左列，内容在列表项下方向下展开，走纵向手风琴
        const accordion =
          mediaRight && !ch.inlineList ? (
          <div className="panel-soft flex items-stretch px-4">
            {/* 左：列表项 */}
            <div className="w-[42%] shrink-0">
              {ch.sections.map((s) => {
                const isActive = expanded[ch.id] === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => { if (!isActive) toggle(ch.id, s.id); }}
                    aria-expanded={isActive}
                    className="w-full flex items-start gap-3 py-3.5 text-left group cursor-pointer"
                  >
                    <span
                      className={`font-sans text-[12px] pt-0.5 w-6 shrink-0 transition-colors ${
                        isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'
                      }`}
                    >
                      {s.index}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={`block text-[17px] font-medium transition-colors ${
                          isActive ? 'text-stone-950' : 'text-stone-400 group-hover:text-stone-900'
                        }`}
                      >
                        {s.title}
                      </span>
                      {s.lead && (
                        <span
                          className={`block text-[13px] mt-1 leading-relaxed transition-colors ${
                            isActive
                              ? 'text-stone-500'
                              : 'text-stone-400 group-hover:text-stone-500'
                          }`}
                        >
                          {s.lead}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 右：内容面板，随选中项横向切入。第一页（页面级视频）内容贴底与列表末项对齐；第二页首行文字顶端对齐列表项标题 */}
              <div
                className={`flex-1 min-w-0 vline-fade pl-6 lg:pl-8 flex flex-col ${
                  ch.demoVideo ? 'justify-end' : 'justify-start'
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {activeSection && (
                    // pt-3.5 与列表项顶 padding 一致，首行文字与列表项标题顶端平齐
                    <motion.div
                      key={activeSection.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="pt-3.5 space-y-5"
                    >
                    {/* 左上角 GitHub 仓库链接 */}
                    {activeSection.github && (
                      <a
                        href={activeSection.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-sans font-medium uppercase tracking-widest text-stone-900 hover:underline"
                      >
                        <Github className="w-3 h-3" />
                        GitHub
                      </a>
                    )}

                    {/* 左：分点说明；右：前后对比滑块 */}
                    {(activeSection.points ||
                      (activeSection.beforeImage && activeSection.afterImage)) && (
                      <div className="flex items-start gap-8">
                        {activeSection.points && (
                          <dl className="flex-1 min-w-0 space-y-3.5">
                            {activeSection.points.map((p) => (
                              <div key={p.label}>
                                <dt className="text-[11px] font-sans uppercase tracking-widest text-stone-400">
                                  {p.label}
                                </dt>
                                <dd className="text-[15px] text-stone-700 leading-relaxed mt-1">
                                  {p.text}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                        {activeSection.beforeImage && activeSection.afterImage && (
                          <div className="relative z-10 -mt-12 lg:-mt-40 shrink-0">
                            <ImageCompare
                              before={activeSection.beforeImage}
                              after={activeSection.afterImage}
                              width={192}
                              height={192}
                              corner={16}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {(activeSection.flow || activeSection.flow2) && (
                      <div className="space-y-3.5">
                        {([activeSection.flow, activeSection.flow2] as (string[] | undefined)[]).map((steps, gi) => {
                          if (!steps) return null;
                          const label = gi === 0 ? activeSection.flowLabel : activeSection.flow2Label;
                          return (
                            <div key={gi}>
                              {label && (
                                <div className="text-[11px] font-sans uppercase tracking-widest text-stone-400 mb-1.5">
                                  {label}
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {steps.map((step, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && <span className="text-stone-300 text-[13px]">→</span>}
                                    <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-[12px] font-sans text-stone-700">
                                      {step}
                                    </span>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeSection.notes && (
                      <ul className="space-y-1.5">
                        {activeSection.notes.map((n) => (
                          <li key={n} className="flex gap-2 text-[13px] text-stone-600 leading-relaxed">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                            <span>{n}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="panel-soft px-4">
            {ch.sections.map((s) => {
              const isOpen = expanded[ch.id] === s.id;

              return (
                <div key={s.id}>
                  <button
                    onClick={() => {
                      // inlineList 页内容常驻：点击已展开项不收起
                      if (ch.inlineList && isOpen) return;
                      toggle(ch.id, s.id);
                    }}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-4 py-4 text-left group cursor-pointer"
                  >
                    <span className="font-sans text-[12px] text-stone-400 pt-1 w-6 shrink-0">
                      {s.index}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[17px] font-medium text-stone-900 group-hover:text-stone-950 transition-colors">
                        {s.title}
                      </span>
                      {s.lead && (
                        <span className="block text-[13px] text-stone-500 mt-1 leading-relaxed">
                          {s.lead}
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-400 mt-1 shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pb-7 pl-10 pr-2 space-y-5">{renderDetail(s, true)}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        );

        // 画廊式三列布局（第四页）：左列介绍+图片轮播+进度指示、中列视频、右列列表导航
        if (ch.showcase) {
          return (
            <section
              key={ch.id}
              id={`chapter-${ch.id}`}
              className="dot-grid-soft snap-start snap-always min-h-screen w-full flex items-center pt-10 pb-32"
            >
              {/* 下滑滑入视口时内容由小到大缩放显现 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12"
              >
                {/* ---------- 左列：介绍 + 左下图片轮播 + 进度指示 ---------- */}
                <div className="lg:col-span-4 flex flex-col space-y-6">
                  <h3 className="text-[34px] sm:text-[40px] font-bold text-stone-900 leading-tight">
                    {ch.title}
                  </h3>

                  <dl className="space-y-2 pt-2 border-t border-stone-200">
                    {ch.meta.map((m) => (
                      <div key={m.label} className="flex gap-3 text-[13px]">
                        <dt className="font-sans text-stone-400 w-16 shrink-0">{m.label}</dt>
                        <dd className="text-stone-700">{m.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <CoreValueNote text={ch.coreValue} chapterId={ch.id} />

                  {ch.background && (
                    <div>
                      <div className="text-[11px] font-sans uppercase tracking-widest text-stone-400 mb-2">
                        背景
                      </div>
                      <p className="text-[13px] leading-relaxed text-stone-600"><IntroText text={ch.background} /></p>
                    </div>
                  )}

                  {/* 左下：当前子项的展示位（小票板 / coverflow 轮播）
                      统一容器尺寸 + 交叉淡入，切换时位置稳定 */}
                  <div className="lg:mt-auto">
                    <div className="relative h-[300px]">
                      <AnimatePresence initial={false}>
                        {activeSection?.board ? (
                          <motion.div
                            key={activeSection.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            className="absolute inset-0"
                          >
                            <ReceiptBoard items={activeSection.board.items} />
                          </motion.div>
                        ) : activeSection?.images?.length ? (
                          <motion.div
                            key={activeSection.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.28, ease: 'easeOut' }}
                            className="absolute inset-0"
                          >
                            <MiniCarousel images={activeSection.images} />
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* ---------- 中列：当前工具视频（竖版） ---------- */}
                <div className="lg:col-span-4">
                  {videoSrc && (
                    <div className="overflow-hidden rounded-xl bg-stone-100 aspect-[3/4]">
                      <AutoVideo
                        key={videoSrc}
                        src={videoSrc}
                        className="w-full h-full object-cover"
                        barColor={BAR_COLORS[ch.id]}
                      />
                    </div>
                  )}
                </div>

                {/* ---------- 右列：工具列表导航（向下排列） ---------- */}
                <div className="lg:col-span-4">
                  <div className="panel-soft px-4">
                    {ch.sections.map((s) => {
                      const isActive = expanded[ch.id] === s.id;

                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (!isActive) setExpanded((prev) => ({ ...prev, [ch.id]: s.id }));
                          }}
                          aria-expanded={isActive}
                          className="w-full flex items-start gap-3 py-4 text-left group cursor-pointer"
                        >
                          <span
                            className={`font-sans text-[12px] pt-1 w-6 shrink-0 transition-colors ${
                              isActive ? 'text-stone-900' : 'text-stone-400 group-hover:text-stone-600'
                            }`}
                          >
                            {s.index}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span
                              className={`block text-[16px] font-medium transition-colors ${
                                isActive ? 'text-stone-950' : 'text-stone-400 group-hover:text-stone-900'
                              }`}
                            >
                              {s.title}
                            </span>
                            <span
                              className={`block text-[12px] mt-1 leading-relaxed transition-colors ${
                                isActive ? 'text-stone-500' : 'text-stone-400 group-hover:text-stone-500'
                              }`}
                            >
                              {s.lead}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </section>
          );
        }

        return (
          <section
            key={ch.id}
            id={`chapter-${ch.id}`}
            className="dot-grid-soft snap-start snap-always min-h-screen w-full flex items-center pt-10 pb-32"
          >
            {/* 下滑滑入视口时内容由小到大缩放显现 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12"
            >
              {/* ---------- 左列：大页介绍；配置 demoVideo 时子项列表置于左下 ---------- */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <h3 className="text-[40px] sm:text-[48px] font-bold text-stone-900 leading-tight">
                  {ch.title}
                </h3>
                {ch.titleNote && (
                  <span className="pb-2 text-[12px] font-sans uppercase tracking-widest text-stone-400">
                    ※ {ch.titleNote}
                  </span>
                )}
              </div>

                <dl className="space-y-2 pt-2 border-t border-stone-200">
                  {ch.meta.map((m) => (
                    <div key={m.label} className="flex gap-3 text-[13px]">
                      <dt className="font-sans text-stone-400 w-16 shrink-0">{m.label}</dt>
                      <dd className="text-stone-700">{m.value}</dd>
                    </div>
                  ))}
                </dl>

                <CoreValueNote text={ch.coreValue} chapterId={ch.id} />

                <div>
                  <div className="text-[11px] font-sans uppercase tracking-widest text-stone-400 mb-2">
                    背景
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone-600"><IntroText text={ch.background} /></p>
                </div>

                {/* inlineList 页：子项列表内嵌左列，位于介绍下方，内容向下展开 */}
                {ch.inlineList && <div className="lg:pt-10">{accordion}</div>}
              </div>

              {/* ---------- 右列：演示视频；未配置 demoVideo 时右侧为子项手风琴 ---------- */}
              {mediaRight ? (
                <div className="lg:col-span-7">
                  {videoSrc ? (
                    ch.videoPanel === 'original' ? (
                      /* 原始尺寸面板：视频宽度由 videoWidth 决定、高度按比例自适应，
                         适合内容较少的页面（如 H5 活动页） */
                      <div
                        className={`mx-auto overflow-hidden rounded-xl bg-stone-100 ${activeSection?.videoWidth ?? 'w-full'}`}
                      >
                        <AutoVideo
                          key={videoSrc}
                          src={videoSrc}
                          className={`w-full h-auto ${activeSection?.videoScale ?? ''}`}
                          barColor={BAR_COLORS[ch.id]}
                        />
                      </div>
                    ) : (
                      /* 统一 16:9 满宽面板：横屏视频铺满，竖屏视频（配置了
                         videoWidth）等高居中——切换子项时面板尺寸恒定不跳 */
                      <div className="relative w-full overflow-hidden rounded-xl bg-stone-100 aspect-video">
                        <AutoVideo
                          key={videoSrc}
                          src={videoSrc}
                          className={`absolute inset-0 m-auto ${
                            activeSection?.videoWidth
                              ? 'h-full w-auto'
                              : 'h-full w-full object-cover'
                          } ${activeSection?.videoScale ?? ''}`}
                          barColor={BAR_COLORS[ch.id]}
                        />
                      </div>
                    )
                  ) : activeSection?.gallery?.length ? (
                    /* 无视频时：真机竖向手风琴（含氛围光效）或横向图片廊 */
                    activeSection.deviceGallery ? (
                      <GiftAccordion images={activeSection.gallery} />
                    ) : (
                      <Gallery images={activeSection.gallery} />
                    )
                  ) : null}
                </div>
              ) : (
                <div className="lg:col-span-7">{accordion}</div>
              )}

              {/* ---------- 底部：子项列表整体横跨全宽（inlineList 页的列表已在左列内） ---------- */}
              {mediaRight && !ch.inlineList && (
                <div className="lg:col-span-12">{accordion}</div>
              )}
            </motion.div>
          </section>
        );
      })}
    </div>
  );
};
