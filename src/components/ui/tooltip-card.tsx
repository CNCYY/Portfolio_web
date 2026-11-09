"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 项目未保留 lib/utils，此处内联 cn（clsx + tailwind-merge） */
const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * 悬停解释卡片（贴纸批注风）：
 * 淡蓝底 + 大圆角扁平色块，底部小三角指向触发词，出现于触发词左上方；
 * 缩放 + 淡入弹出（origin 左下），移动端点按切换显示。
 * 使用 span 而非 div，可安全嵌入 <p> 段落。
 */
export const Tooltip = ({
  content,
  children,
  containerClassName,
  align = 'left',
  side = 'top',
  tone = '#d3e2ea',
  hug = false,
}: {
  content: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
  /** 卡片相对触发词的展开方向：left 右展开 / right 左展开 */
  align?: 'left' | 'right';
  /** 卡片相对触发词的上下方向：top 文本上方 / bottom 文本下方 */
  side?: 'top' | 'bottom';
  /** 卡片底色（卡片与下方小三角同步） */
  tone?: string;
  /** 卡片宽度贴合文本（文本两侧各留 5px），默认固定 296px */
  hug?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleTouchEnd = () => {
    // Delay hiding to allow for tap interaction
    setTimeout(() => setIsVisible(false), 2000);
  };

  const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    // Toggle visibility on click for mobile devices
    if (window.matchMedia("(hover: none)").matches) {
      e.preventDefault();
      setIsVisible((v) => !v);
    }
  };

  return (
    <span
      className={cn("relative inline-block", containerClassName)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.span
            key={String(isVisible)}
            initial={{ opacity: 0, scale: 0.88, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 4 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            style={
              {
                transformOrigin: `${side === 'bottom' ? 'top' : 'bottom'} ${
                  align === 'right' ? 'right' : 'left'
                }`,
                '--tt-bg': tone,
              } as React.CSSProperties
            }
            className={cn(
              'pointer-events-none absolute z-50 block rounded-[14px] border-[1.5px] border-stone-900 bg-[var(--tt-bg)]',
              side === 'bottom' ? 'top-[calc(100%+13px)]' : 'bottom-[calc(100%+13px)]',
              hug ? 'w-auto whitespace-nowrap px-[5px] py-1.5' : 'w-[18.5rem] px-4 pb-3.5 pt-3',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {/* 小三角：指向触发词（双层叠出描边效果：下层黑边、上层纯色遮住内侧线） */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute block h-3 w-3 rotate-45 rounded-[2px] border-[1.5px] border-stone-900 bg-[var(--tt-bg)]',
                side === 'bottom' ? '-top-[7.5px]' : '-bottom-[7.5px]',
                align === 'right' ? 'right-7' : 'left-7'
              )}
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute block h-3 w-3 rotate-45 rounded-[2px] bg-[var(--tt-bg)]',
                side === 'bottom' ? '-top-[5px]' : '-bottom-[5px]',
                align === 'right' ? 'right-7' : 'left-7'
              )}
            />
            <span className="relative block text-left text-[13px] font-medium leading-relaxed tracking-wide text-stone-900">
              {content}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};
