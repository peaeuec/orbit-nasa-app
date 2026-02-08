import { normalizeAPOD, normalizeLibraryItem } from './nasa-cleaners';
import { SpacePost, Story } from './types';

const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;

// --- Helper: Shuffle Array ---
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 1. Trending Feed (Active Missions & News)
export async function getTrendingFeed(): Promise<SpacePost[]> {
  // SIMPLIFIED QUERY: We search for "James Webb" specifically to guarantee hits.
  // Complex comma-separated queries sometimes fail with the date filter.
  const query = 'James Webb Space Telescope'; 
  
  const res = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image,video&year_start=2023&page_size=25`);
  
  if (!res.ok) return [];
  const data = await res.json();
  const items = data.collection?.items || [];

  // FIX: Explicitly tell TypeScript this is a list of SpacePost objects
  const cleanItems: SpacePost[] = items.map(normalizeLibraryItem);

  return cleanItems;
}

// 2. Popular Feed (The "Greatest Hits")
export async function getPopularFeed(): Promise<SpacePost[]> {
  const query = 'earth';
  
  // Fetch a larger pool (60 items) and shuffle
  const res = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image&page_size=60`);
  
  if (!res.ok) return [];
  const data = await res.json();
  const items = data.collection?.items || [];
  
  // FIX: Explicitly tell TypeScript this is a list of SpacePost objects
  const cleanItems: SpacePost[] = items.map(normalizeLibraryItem);
  
  // Now shuffle works because it knows what it is shuffling
  return shuffleArray(cleanItems).slice(0, 24); 
}

// 3. Essential Helpers
export async function getHeroPost(): Promise<SpacePost> {
  const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch APOD');
  return normalizeAPOD(await res.json());
}

export async function getPostById(nasaId: string): Promise<SpacePost | null> {
  try {
    const res = await fetch(`https://images-api.nasa.gov/search?nasa_id=${nasaId}`);
    const data = await res.json();
    const items = data.collection?.items || [];
    // Only return if we found an item
    if (items.length > 0) {
      return normalizeLibraryItem(items[0]);
    }
    return null;
  } catch (e) { 
    console.error(e);
    return null; 
  }
}

export async function getHazardStory(): Promise<Story> {
  const getToday = () => new Date().toISOString().split('T')[0];
  const today = getToday();
  const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`);
  
  if (!res.ok) throw new Error('Failed');
  
  const data = await res.json();
  const asteroids = data.near_earth_objects[today] || [];
  const hazardCount = asteroids.filter((a: any) => a.is_potentially_hazardous_asteroid).length;
  
  return {
    id: `asteroid-${today}`, 
    type: 'HAZARD', 
    thumbnailUrl: '/hazard-icon.png',
    statusColor: hazardCount > 0 ? 'red' : 'green',
    text: `${asteroids.length} Near Earth Objects (${hazardCount} Hazardous)`
  };
}

// 4. Generic Search (For your Navbar Search Bar)
export async function getLibraryItems(query: string): Promise<SpacePost[]> {
  const res = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image,video`);
  
  if (!res.ok) return [];
  const data = await res.json();
  const items = data.collection?.items || [];
  
  const cleanItems: SpacePost[] = items.slice(0, 20).map(normalizeLibraryItem);
  return cleanItems;
}