import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Github } from 'lucide-react';
import { Chapter, ChapterSection } from '../data/chapters';
import { ImageCompare } from './ImageCompare';
import { Gallery } from './Gallery';

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
                    <dt className="text-[11px] font-mono uppercase tracking-widest text-stone-400">
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
                        <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1.5">
                          {label}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {steps.map((step, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && <span className="text-stone-300 text-[13px]">→</span>}
                            <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-[12px] font-mono text-stone-700">
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
                  <figcaption className="text-[11px] font-mono text-stone-400 mt-2">
                    {s.mediaCaption}
                  </figcaption>
                )}
              </figure>
            )}
          </>
        );

        // 配置 demoVideo 的大页：列表项与内容为一个整体——列表在左，内容向右展开
        const accordion = mediaRight ? (
          <div className="border-t border-stone-200 flex items-stretch">
            {/* 左：列表项 */}
            <div className="w-[42%] shrink-0">
              {ch.sections.map((s) => {
                const isActive = expanded[ch.id] === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => { if (!isActive) toggle(ch.id, s.id); }}
                    aria-expanded={isActive}
                    className="w-full flex items-start gap-3 py-3.5 border-b border-stone-200 text-left group cursor-pointer"
                  >
                    <span
                      className={`font-mono text-[12px] pt-0.5 w-6 shrink-0 transition-colors ${
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
                className={`flex-1 min-w-0 border-l border-stone-200 pl-6 lg:pl-8 flex flex-col ${
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
                        className="inline-flex items-center gap-1.5 text-[12px] font-mono font-medium uppercase tracking-widest text-stone-900 hover:underline"
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
                                <dt className="text-[11px] font-mono uppercase tracking-widest text-stone-400">
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
                                <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-1.5">
                                  {label}
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {steps.map((step, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && <span className="text-stone-300 text-[13px]">→</span>}
                                    <span className="px-2.5 py-1 rounded-md bg-stone-100 border border-stone-200 text-[12px] font-mono text-stone-700">
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
          <div className="border-t border-stone-200">
            {ch.sections.map((s) => {
              const isOpen = expanded[ch.id] === s.id;

              return (
                <div key={s.id} className="border-b border-stone-200">
                  <button
                    onClick={() => toggle(ch.id, s.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start gap-4 py-4 text-left group cursor-pointer"
                  >
                    <span className="font-mono text-[12px] text-stone-400 pt-1 w-6 shrink-0">
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

        return (
          <section
            key={ch.id}
            id={`chapter-${ch.id}`}
            className="snap-start snap-always min-h-screen w-full flex items-center border-t border-stone-200/60 pt-10 pb-32"
          >
            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
              {/* ---------- 左列：大页介绍；配置 demoVideo 时子项列表置于左下 ---------- */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <h2 className="font-serif text-[40px] sm:text-[48px] font-medium text-stone-900 leading-tight">
                  {ch.title}
                </h2>
                {ch.titleNote && (
                  <span className="pb-2 text-[12px] font-mono uppercase tracking-widest text-stone-400">
                    ※ {ch.titleNote}
                  </span>
                )}
              </div>

                <dl className="space-y-2 pt-2 border-t border-stone-200">
                  {ch.meta.map((m) => (
                    <div key={m.label} className="flex gap-3 text-[13px]">
                      <dt className="font-mono text-stone-400 w-16 shrink-0">{m.label}</dt>
                      <dd className="text-stone-700">{m.value}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                    核心价值
                  </div>
                  <p className="font-serif text-[16px] leading-relaxed text-stone-800">
                    {ch.coreValue}
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400 mb-2">
                    背景
                  </div>
                  <p className="text-[13px] leading-relaxed text-stone-600">{ch.background}</p>
                </div>
              </div>

              {/* ---------- 右列：演示视频；未配置 demoVideo 时右侧为子项手风琴 ---------- */}
              {mediaRight ? (
                <div className="lg:col-span-7">
                  {videoSrc ? (
                    /* 外层裁边：视频微放大 2% 裁掉画面边缘的黑线 */
                    <div
                      className={`mx-auto overflow-hidden rounded-xl bg-stone-100 ${activeSection?.videoWidth ?? 'w-full'}`}
                    >
                      <video
                        key={videoSrc}
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className={`w-full h-auto ${activeSection?.videoScale ?? ''}`}
                      />
                    </div>
                  ) : activeSection?.gallery?.length ? (
                    /* 无视频时展示图片廊（深色横向无缝滚动） */
                    <div className="flex justify-center py-2">
                      <Gallery images={activeSection.gallery} />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="lg:col-span-7">{accordion}</div>
              )}

              {/* ---------- 底部：子项列表整体横跨全宽（配置 demoVideo 时） ---------- */}
              {mediaRight && <div className="lg:col-span-12">{accordion}</div>}
            </div>
          </section>
        );
      })}
    </div>
  );
};
