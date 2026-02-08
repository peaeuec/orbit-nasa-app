import { normalizeLibraryItem } from './nasa-cleaners'; 
import { SpacePost, ExploreSection, ExplorePageData } from './types';

const BASE_URL = 'https://images-api.nasa.gov/search';

// --- Helper: Generic Lane Fetcher ---
async function fetchLaneItems(params: Record<string, string>, limit = 10): Promise<SpacePost[]> {
  const urlParams = new URLSearchParams({ ...params, page_size: '30' });
  
  try {
    const res = await fetch(`${BASE_URL}?${urlParams.toString()}`);
    if (!res.ok) return [];
    
    const data = await res.json();
    const items = data.collection?.items || [];

    return items
      .map(normalizeLibraryItem)
      // FIX: Only filter out truly broken items, but be less strict
      .filter((item: SpacePost) => item.imageUrl && item.title) 
      .slice(0, limit);
  } catch (e) {
    console.error(`Error fetching lane params: ${JSON.stringify(params)}`, e);
    return [];
  }
}

// --- LANE BUILDERS ---

// 1. "Mission Control" (Trending)
async function getTrendingLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems({
    q: 'James Webb Space Telescope', // Simple query guarantees hits
    media_type: 'image'
  }, 10);

  return {
    id: 'trending',
    title: 'Mission Control',
    subtitle: 'Latest captures from the James Webb Space Telescope.',
    layout: 'row', 
    items
  };
}

// 2. "The Red Planet" (Topic: Mars)
async function getMarsLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems({
    q: 'Mars', // Removed 'keywords: landscape' which was filtering too much
    media_type: 'image'
  }, 8);

  return {
    id: 'mars',
    title: 'The Red Planet',
    subtitle: 'High-definition views from our neighbor.',
    layout: 'grid', 
    items
  };
}

// 3. "Earth Orbit" (Replaces Audio for now to ensure Visuals)
async function getEarthLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems({
    q: 'International Space Station',
    media_type: 'image'
  }, 6);

  return {
    id: 'earth',
    title: 'Earth Orbit',
    subtitle: 'Views of home from the ISS.',
    layout: 'row',
    items
  };
}

// 4. "Cosmic Wonders" (Topic: General Space)
async function getClassicsLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems({
    q: 'Nebula', // Capitalized for good measure, broad search
    media_type: 'image'
  }, 12);

  return {
    id: 'classics',
    title: 'Cosmic Wonders',
    layout: 'grid',
    items
  };
}

// --- MAIN AGGREGATOR ---
export async function getExplorePageData(): Promise<ExplorePageData> {
  // NOTE: APOD removed as requested since it is on the Home Page.

  // Fetch all lanes in parallel
  const [trending, mars, earth, classics] = await Promise.all([
    getTrendingLane(),
    getMarsLane(),
    getEarthLane(),
    getClassicsLane()
  ]);

  return {
    // We return a dummy hero or null since we won't use it, 
    // but to keep types happy we can just leave it undefined if types allow, 
    // or pass a placeholder that we ignore in the UI.
    hero: trending.items[0], // Just use first item as fallback data
    sections: [trending, mars, earth, classics]
  };
}