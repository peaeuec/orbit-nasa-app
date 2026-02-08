// src/lib/types.ts

// 1. The Unified Post (Existing)
export interface SpacePost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  source: 'APOD' | 'NASA_LIB' | 'MARS';
  likes: number;
  mediaType: 'image' | 'video' | 'audio'; // Added 'audio' support
}

// 2. The Story (Existing)
export interface Story {
  id: string;
  type: 'HAZARD' | 'EARTH' | 'WEATHER';
  thumbnailUrl: string;
  statusColor: 'green' | 'red' | 'blue';
  text: string;
}

// 3. NEW: Section Definitions
export type SectionLayout = 'grid' | 'row' | 'featured';

export interface ExploreSection {
  id: string;
  title: string;
  subtitle?: string;
  layout: SectionLayout;
  items: SpacePost[];
}

export interface ExplorePageData {
  hero: SpacePost;
  sections: ExploreSection[];
}