import { normalizeAPOD, normalizeLibraryItem } from './nasa-cleaners';
import { SpacePost } from './types';

const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;

// 1. Fetch APOD (Hero Image)
export async function getHeroPost(): Promise<SpacePost> {
  const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch APOD');
  const data = await res.json();
  return normalizeAPOD(data);
}

// 2. Fetch Search Results (Feed)
export async function getFeedPosts(): Promise<SpacePost[]> {
  // Topic Roulette: Pick a random topic
  const topics = ['nebula', 'galaxy', 'black hole', 'mars surface', 'saturn'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  const res = await fetch(`https://images-api.nasa.gov/search?q=${randomTopic}&media_type=image`);
  if (!res.ok) throw new Error('Failed to fetch Library');
  const data = await res.json();
  
  // Return the top 10 results
  return data.collection.items.slice(0, 10).map(normalizeLibraryItem);
}