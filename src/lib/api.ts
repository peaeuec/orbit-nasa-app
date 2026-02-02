import { normalizeAPOD, normalizeLibraryItem } from './nasa-cleaners';
import { SpacePost, Story } from './types';

const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY;

// 1. Fetch APOD (Hero Image)
export async function getHeroPost(): Promise<SpacePost> {
  const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`);
  if (!res.ok) throw new Error('Failed to fetch APOD');
  const data = await res.json();
  return normalizeAPOD(data);
}

// 2. Fetch Random Feed (Old Implementation)
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

// Helper: Get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split('T')[0];

// 3. Fetch Asteroid Hazard (Stories)
export async function getHazardStory(): Promise<Story> {
  const today = getToday();
  const res = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`);
  
  if (!res.ok) throw new Error('Failed to fetch Asteroids');
  const data = await res.json();

  // Count how many are "Potentially Hazardous"
  const asteroids = data.near_earth_objects[today] || [];
  const hazardCount = asteroids.filter((a: any) => a.is_potentially_hazardous_asteroid).length;
  const totalCount = asteroids.length;

  return {
    id: `asteroid-${today}`,
    type: 'HAZARD',
    thumbnailUrl: '/hazard-icon.png', 
    statusColor: hazardCount > 0 ? 'red' : 'green',
    text: `${totalCount} Near Earth Objects (${hazardCount} Hazardous)`
  };
}

// 4. Fetch Searchable Library Feed (Images & Videos)
export async function getLibraryItems(query: string = 'nebula'): Promise<SpacePost[]> {
  // We ask for both images and videos
  const res = await fetch(`https://images-api.nasa.gov/search?q=${query}&media_type=image,video`);
  
  if (!res.ok) throw new Error('Failed to fetch library items');
  const data = await res.json();
  
  // We take the top 12 results and clean them up
  return data.collection.items.slice(0, 12).map(normalizeLibraryItem);
}

// 5. NEW: Fetch Single Post by ID (For Profile Page)
export async function getPostById(nasaId: string): Promise<SpacePost | null> {
  try {
    const res = await fetch(`https://images-api.nasa.gov/search?nasa_id=${nasaId}`);
    
    if (!res.ok) throw new Error(`Failed to fetch details for ${nasaId}`);
    const data = await res.json();
    
    // The API returns a list, but we only want the first match
    const items = data.collection?.items || [];
    
    if (items.length === 0) return null;

    // Use your existing normalizer on the single item
    return normalizeLibraryItem(items[0]);
  } catch (error) {
    console.error(`Error processing ID ${nasaId}:`, error);
    return null;
  }
}