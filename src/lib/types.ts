// src/lib/types.ts

// 1. The Unified Post (What the Feed needs)
export interface SpacePost {
  id: string;           // Unique ID (e.g., "apod-2023-10-01")
  title: string;        // "Nebula of Orion"
  description: string;  // "This nebula is..."
  imageUrl: string;     // The actual image link
  date: string;         // "2025-12-24"
  source: 'APOD' | 'NASA_LIB' | 'MARS'; // Where it came from
  likes: number;        // From your database
}

// 2. The Story (What the top bar needs)
export interface Story {
  id: string;
  type: 'HAZARD' | 'EARTH' | 'WEATHER';
  thumbnailUrl: string;
  statusColor: 'green' | 'red' | 'blue';
  text: string; // "2 Asteroids Approaching"
}