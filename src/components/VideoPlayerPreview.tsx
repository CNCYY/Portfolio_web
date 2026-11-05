import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface Props {
  mediaUrl: string;
  previewVideoUrl?: string;
  mediaType: 'video' | 'image';
  title: string;
  aspectRatio?: '16:9' | '4:3' | '3:4';
  isHovered?: boolean;
  onExpand?: () => void;
}

export const VideoPlayerPreview: React.FC<Props> = ({
  mediaUrl,
  previewVideoUrl,
  mediaType,
  title,
  aspectRatio = '16:9',
  isHovered = false,
  onExpand,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play / pause based on hover state
  useEffect(() => {
    if (mediaType !== 'video' || !videoRef.current) return;
    const vid = videoRef.current;

    if (isHovered) {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [isHovered, mediaType]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setProgress((cur / dur) * 100);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const aspectClass =
    aspectRatio === '16:9'
      ? 'aspect-video'
      : aspectRatio === '3:4'
      ? 'aspect-[3/4]'
      : 'aspect-[4/3]';

  return (
    <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-stone-900 group`}>
      {/* Visual Media Layer */}
      {mediaType === 'video' && previewVideoUrl ? (
        <video
          ref={videoRef}
          src={previewVideoUrl}
          poster={mediaUrl}
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
        />
      ) : (
        <img
          src={mediaUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Measured Scrim for Media Contrast (per frontend-design constitution) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Interactive Micro-Controls (Appears on Hover) */}
      <div className="absolute bottom-3 inset-x-3 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {mediaType === 'video' && (
          <div className="flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-white">
            <button
              onClick={togglePlay}
              className="p-1 hover:text-amber-300 transition-colors"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="p-1 hover:text-amber-300 transition-colors"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <div className="w-16 h-1 bg-stone-700 rounded-full overflow-hidden ml-1">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-amber-400 transition-all duration-100"
              />
            </div>
          </div>
        )}

        {onExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="p-1.5 bg-stone-950/80 backdrop-blur-md rounded-lg text-white hover:text-amber-300 border border-white/10 transition-colors"
            title="Open Fullscreen Lightbox"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
