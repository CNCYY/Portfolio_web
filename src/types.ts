export type MediaType = 'video' | 'image';

export interface ProjectLink {
  label: string;
  url: string;
  type?: 'demo' | 'github' | 'tool';
}

export interface SecondaryMediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
  caption?: string;
}

export interface Project {
  id: string;
  number: string;
  title: string;
  tagline: string;
  classification: string;
  status: string;
  category: string;
  year: string;
  mediaType: MediaType;
  mediaUrl: string;
  previewVideoUrl?: string;
  secondaryVideoUrl?: string;
  secondaryVideoTitle?: string;
  scatteredImage: string;
  scatteredTitle: string;
  rotation: number;
  zIndex: number;
  tags: string[];
  links?: ProjectLink[];
  galleryImages?: string[];
  details?: {
    background?: string;
    contribution?: string;
    logic?: string;
    metrics?: string;
  };
}
