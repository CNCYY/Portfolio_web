import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../types';
import { Search, X, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = projects.filter((p) => {
    const q = query.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-stone-950/60 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -10 }}
        className="w-full max-w-xl bg-[#FCFBF9] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden"
      >
        <div className="p-4 border-b border-stone-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search works, prototypes, audio instruments, tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-stone-900 placeholder-stone-400 focus:outline-none font-sans"
          />
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectProject(item);
                    onClose();
                  }}
                  className="p-3 rounded-lg hover:bg-stone-100/90 transition-colors cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="font-serif text-sm font-medium text-stone-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-stone-500 font-sans mt-0.5 line-clamp-1">
                      {item.category} · {item.tagline}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-stone-500 font-sans">
              No matching archival entries found for "{query}".
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
