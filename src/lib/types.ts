// 1. The Unified Post
export interface SpacePost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  highResUrl?: string; // NEW: The uncompressed original image link
  date: string;
  source: "APOD" | "NASA_LIB" | "MARS";
  mediaType: "image" | "video" | "audio";
  likes: number;
}

// 2. The Story
export interface Story {
  id: string;
  type: "HAZARD" | "EARTH" | "WEATHER";
  thumbnailUrl: string;
  statusColor: "green" | "red" | "blue";
  text: string;
}

// 3. Section Definitions
export type SectionLayout = "grid" | "row" | "featured";

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
