import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Project } from '../types';
import { VideoPlayerPreview } from './VideoPlayerPreview';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ExternalLink,
  Maximize2,
  Bookmark,
} from 'lucide-react';

interface Props {
  projects: Project[];
  activeHighlightedId: string | null;
  onOpenModal: (project: Project) => void;
}

export const SplitScreenWorks: React.FC<Props> = ({
  projects,
  activeHighlightedId,
  onOpenModal,
}) => {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="works-list" className="w-full">
      {/* 3-Column Editorial Layout without Bounding Boxes (Unboxed, Pure Whitespace Separation matching image_e99bcf24.webp) */}
      {projects.map((project, idx) => {
        const isHighlighted = activeHighlightedId === project.id;
        const isSaved = bookmarkedIds.has(project.id);
        const prevProject = idx > 0 ? projects[idx - 1] : null;
        const nextProject = idx < projects.length - 1 ? projects[idx + 1] : null;

        // Structured media items for the center vertical list
        const mediaItems = [];

        // 1. Primary Video / Image
        if (project.previewVideoUrl) {
          mediaItems.push({
            type: 'video' as const,
            url: project.previewVideoUrl,
            caption: `FIG ${project.number}.1`,
          });
        } else if (project.mediaUrl) {
          mediaItems.push({
            type: 'image' as const,
            url: project.mediaUrl,
            caption: `FIG ${project.number}.1`,
          });
        }

        // 2. Secondary Video (e.g. AI Gift workflow)
        if (project.secondaryVideoUrl) {
          mediaItems.push({
            type: 'video' as const,
            url: project.secondaryVideoUrl,
            caption: `FIG ${project.number}.2 · ${project.secondaryVideoTitle || '工作流录屏'}`,
          });
        }

        // 3. Additional Gallery Images
        if (project.galleryImages && project.galleryImages.length > 0) {
          project.galleryImages.forEach((imgUrl) => {
            if (imgUrl !== project.mediaUrl) {
              mediaItems.push({
                type: 'image' as const,
                url: imgUrl,
                caption: `FIG ${project.number}.${mediaItems.length + 1}`,
              });
            }
          });
        }

        return (
          <section
            key={project.id}
            id={`project-${project.id}`}
            className="min-h-screen snap-start snap-always flex items-center justify-center py-6 sm:py-8 lg:py-10 px-4 sm:px-8 lg:px-12 relative overflow-hidden"
          >
            {/* Open Editorial Article without Outer Bounding Card Box */}
            <motion.article
              initial={{ opacity: 0.9, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHoveredProjectId(project.id)}
              onMouseLeave={() => setHoveredProjectId(null)}
              className="w-full max-w-7xl h-[86vh] min-h-[580px] max-h-[840px] mb-8 sm:mb-12 flex flex-col justify-between"
            >
              {/* 3 Columns separated purely by whitespace gap (No dividing borders, no card boxes) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 h-full items-stretch">
                
                {/* ========================================================
                    1. LEFT COLUMN: Project Background & Narrative (Unboxed)
                   ======================================================== */}
                <div className="lg:col-span-4 flex flex-col justify-between overflow-y-auto no-scrollbar py-2 pr-2">
                  <div className="space-y-4">
                    {/* Top: Return to Cover & Classification */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => scrollToSection('hero-folder')}
                        className="group inline-flex items-center gap-1.5 text-xs font-mono text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        <span>封面</span>
                      </button>

                      <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                        [ {project.classification} ]
                      </span>
                    </div>

                    {/* Main Title & Byline */}
                    <div>
                      <h2
                        onClick={() => onOpenModal(project)}
                        className={`font-serif text-2xl sm:text-3xl lg:text-[32px] font-medium tracking-tight leading-snug hover:text-stone-600 transition-colors cursor-pointer ${
                          isHighlighted ? 'text-amber-800' : 'text-stone-900'
                        }`}
                      >
                        {project.title}
                      </h2>
                    </div>

                    {/* Project Background Narrative */}
                    <div className="pt-2 space-y-1.5">
                      <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed font-sans">
                        {project.details?.background || project.tagline}
                      </p>
                    </div>

                    {/* Date & Category Line with Subtle Separators */}
                    <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-400">
                      <div className="flex items-center gap-2">
                        <span>{project.year}</span>
                        <span aria-hidden="true">·</span>
                        <span>{project.category}</span>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(e, project.id)}
                        className="text-stone-400 hover:text-stone-900 transition-colors p-1"
                        aria-label="Bookmark"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            isSaved ? 'fill-stone-900 text-stone-900' : 'text-stone-400'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Mini Thumbnails Strip without Box Outlines */}
                    {mediaItems.length > 1 && (
                      <div className="pt-2">
                        <div className="flex items-center gap-2.5">
                          {mediaItems.slice(0, 3).map((item, mIdx) => (
                            <div
                              key={mIdx}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 shadow-sm transition-transform hover:scale-105"
                            >
                              {item.type === 'video' ? (
                                <video
                                  src={item.url}
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img
                                  src={item.url}
                                  alt={`preview ${mIdx}`}
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/60 backdrop-blur-sm text-[8px] font-mono text-white rounded">
                                0{mIdx + 1}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Counter & Circular Next Button */}
                  <div className="pt-6 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xl sm:text-2xl font-bold text-blue-600">
                        {project.number}
                      </span>
                      <span className="font-mono text-xs text-stone-400">
                        / 0{projects.length}
                      </span>
                    </div>

                    {nextProject && (
                      <button
                        onClick={() => scrollToSection(`project-${nextProject.id}`)}
                        className="w-9 h-9 rounded-full border border-stone-300 hover:border-stone-900 flex items-center justify-center text-stone-700 hover:text-stone-950 hover:bg-stone-100 transition-all cursor-pointer group"
                        aria-label={`Jump to ${nextProject.title}`}
                      >
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ========================================================
                    2. CENTER COLUMN: Vertical Media Stream & Captions (Unboxed)
                   ======================================================== */}
                <div className="lg:col-span-4 flex flex-col overflow-y-auto no-scrollbar space-y-6 py-2 px-1">
                  <div className="space-y-6">
                    {mediaItems.map((media, mIdx) => (
                      <div key={mIdx} className="space-y-2">
                        {/* Clean Media Display without Heavy Card Enclosures */}
                        <div
                          className="relative rounded-2xl overflow-hidden shadow-md bg-stone-950 group cursor-pointer"
                          onClick={() => onOpenModal(project)}
                        >
                          {media.type === 'video' ? (
                            <div className="aspect-[3/4] sm:aspect-[4/3] w-full flex items-center justify-center bg-stone-950">
                              <VideoPlayerPreview
                                mediaUrl={project.mediaUrl}
                                previewVideoUrl={media.url}
                                mediaType="video"
                                title={project.title}
                                aspectRatio="3:4"
                                isHovered={hoveredProjectId === project.id}
                                onExpand={() => onOpenModal(project)}
                              />
                            </div>
                          ) : (
                            <div className="aspect-[3/4] sm:aspect-[4/3] w-full relative overflow-hidden bg-stone-900">
                              <img
                                src={media.url}
                                alt={project.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-500 p-2"
                              />
                            </div>
                          )}

                          {/* Lightbox Trigger Icon */}
                          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Maximize2 className="w-2.5 h-2.5" />
                          </div>
                        </div>

                        {/* Small Monograph Caption (小字文案) */}
                        <p className="text-[11px] font-mono text-stone-500 leading-snug px-1">
                          {media.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ========================================================
                    3. RIGHT COLUMN: Detailed Analysis & Mechanism (Unboxed)
                   ======================================================== */}
                <div className="lg:col-span-4 flex flex-col justify-between overflow-y-auto no-scrollbar py-2 pl-2">
                  <div className="space-y-6">
                    {/* Top Next Up Preview */}
                    <div className="flex items-center justify-end pb-3">
                      {nextProject && (
                        <button
                          onClick={() => scrollToSection(`project-${nextProject.id}`)}
                          className="text-xs font-mono text-stone-700 hover:text-stone-950 font-bold transition-colors cursor-pointer"
                        >
                          {nextProject.number} · {nextProject.title} ↗
                        </button>
                      )}
                    </div>

                    {/* Analysis Breakdown Block 1: 方案逻辑与核心机制 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">01</span>
                        <span className="text-xs font-sans font-semibold text-stone-900">
                          方案逻辑与技术机制
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans pl-5">
                        {project.details?.logic || '独立设计并手写封装核心图层逻辑，保障全链路稳定运行与实时预览。'}
                      </p>
                    </div>

                    {/* Analysis Breakdown Block 2: 个人贡献与全流程 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">02</span>
                        <span className="text-xs font-sans font-semibold text-stone-900">
                          个人贡献与全流程
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans pl-5">
                        {project.details?.contribution || '构思方案、功能输出、全栈开发到最终落地闭环。'}
                      </p>
                    </div>

                    {/* Analysis Breakdown Block 3: 落地指标与实际验证 */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-900">03</span>
                        <span className="text-xs font-sans font-semibold text-stone-900">
                          落地指标与实际成效
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans pl-5 font-mono text-[11px]">
                        {project.details?.metrics || project.status}
                      </p>
                    </div>

                    {/* Analysis Breakdown Block 4: 在线体验与证据链接 (Clean unboxed links) */}
                    {project.links && project.links.length > 0 && (
                      <div className="pt-1 space-y-1.5">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block font-medium">
                          在线体验与仓库
                        </span>
                        <div className="flex flex-col gap-1 pl-1">
                          {project.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-800 hover:text-stone-950 hover:underline transition-colors py-0.5 group"
                            >
                              <span className="truncate">{link.label}</span>
                              <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-stone-900 transition-colors shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags Strip (Quiet unboxed tags) */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {project.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-mono text-stone-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Navigation Links */}
                  <div className="pt-6 flex items-center justify-between text-xs font-mono text-stone-600">
                    <button
                      onClick={() => onOpenModal(project)}
                      className="inline-flex items-center gap-1 text-stone-900 font-semibold hover:underline cursor-pointer"
                    >
                      <span>展开完整档案</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {prevProject && (
                      <button
                        onClick={() => scrollToSection(`project-${prevProject.id}`)}
                        className="hover:text-stone-950 transition-colors cursor-pointer"
                      >
                        ← Prev
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.article>
          </section>
        );
      })}
    </div>
  );
};
