import { normalizeLibraryItem } from './nasa-cleaners';
import { SpacePost, ExploreSection, ExplorePageData } from './types';
import { getBulkLikeCounts } from './db'; 

const BASE_URL = 'https://images-api.nasa.gov/search';

/* -------------------------------------------------------
   DETERMINISTIC RANDOM NUMBER GENERATOR (PRNG)
   This ensures the "Random" picks stay the same for 24 hours.
------------------------------------------------------- */

// 1. Generate a numeric seed from today's date (e.g., 20231025)
function getDailySeed(): number {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

// 2. Simple Mulberry32 PRNG
// Returns a function that generates numbers between 0 and 1
function createSeededRandom(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 3. Global PRNG instance for this request
const TODAY_SEED = getDailySeed();
let rng = createSeededRandom(TODAY_SEED);

// Helper to reset RNG (optional, but good for consistency across requests)
function resetRng() {
  rng = createSeededRandom(TODAY_SEED);
}

/* -------------------------------------------------------
   RANDOM HELPERS (Updated to use Seeding)
------------------------------------------------------- */
function randomInt(min: number, max: number) {
  // Use our 'rng()' instead of Math.random()
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickMultiple(arr: string[], count = 2): string {
  // Deterministic shuffle
  const shuffled = [...arr].sort(() => 0.5 - rng());
  return shuffled.slice(0, count).join(' ');
}

function randomYearRange() {
  const start = randomInt(1996, 2018);
  return {
    year_start: start,
    year_end: Math.min(start + randomInt(3, 8), 2026)
  };
}

/* -------------------------------------------------------
   SEARCH TERM POOLS
------------------------------------------------------- */
const TERM_POOLS = {
  trending: [
    'James Webb Space Telescope',
    'JWST deep field',
    'JWST galaxy',
    'NASA space telescope',
    'infrared universe'
  ],
  mars: [
    'Mars surface',
    'Mars rover',
    'Perseverance rover',
    'Curiosity rover'
  ],
  earth: [
    'International Space Station',
    'Earth from space',
    'ISS Earth view',
    'astronaut photography'
  ],
  classics: [
    'Nebula',
    'Galaxy',
    'Supernova',
    'Star formation',
    'Milky Way'
  ]
};

const HARD_FALLBACKS: Record<keyof typeof TERM_POOLS, string> = {
  trending: 'James Webb Space Telescope',
  mars: 'Mars',
  earth: 'Earth from space',
  classics: 'Nebula'
};

/* -------------------------------------------------------
   SEED GENERATION
------------------------------------------------------- */
function generateSeed() {
  // Reset RNG at start of generation to ensure 100% consistent lane order
  resetRng();
  
  const lanes: any = {};

  (Object.keys(TERM_POOLS) as Array<keyof typeof TERM_POOLS>).forEach(
    (laneId) => {
      const years = randomYearRange();
      lanes[laneId] = {
        q: pickMultiple(TERM_POOLS[laneId], 2),
        page: randomInt(1, 6),
        year_start: years.year_start,
        year_end: years.year_end
      };
    }
  );

  return { date: String(TODAY_SEED), lanes };
}

/* -------------------------------------------------------
   LOW-LEVEL FETCH
------------------------------------------------------- */
async function tryFetch(
  params: Record<string, string>,
  limit: number
): Promise<SpacePost[]> {
  const urlParams = new URLSearchParams({
    ...params,
    page_size: '30'
  });

  try {
    // We still keep the cache tag, just in case
    const res = await fetch(`${BASE_URL}?${urlParams.toString()}`, {
      next: { revalidate: 3600 } // Cache for 1 hour is fine now
    });

    if (!res.ok) return [];

    const data = await res.json();
    const items = data.collection?.items || [];

    return items
      .map(normalizeLibraryItem)
      .filter((i: SpacePost) => i?.imageUrl && i?.title)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/* -------------------------------------------------------
   LANE FETCHER
------------------------------------------------------- */
async function fetchLaneItems(
  laneId: keyof typeof TERM_POOLS,
  limit = 10
): Promise<SpacePost[]> {
  // Generate the deterministic seed
  const seedData = generateSeed(); 
  const seed = seedData.lanes[laneId];

  // 1️⃣ Seeded attempt
  let items = await tryFetch(
    {
      q: seed.q,
      media_type: 'image',
      page: String(seed.page),
      year_start: String(seed.year_start),
      year_end: String(seed.year_end)
    },
    limit
  );
  if (items.length) return items;

  // 2️⃣ Retry page 1
  items = await tryFetch(
    { q: seed.q, media_type: 'image', page: '1' },
    limit
  );
  if (items.length) return items;

  // 3️⃣ Hard Fallback
  return await tryFetch(
    { q: HARD_FALLBACKS[laneId], media_type: 'image' },
    limit
  );
}

/* -------------------------------------------------------
   LANE BUILDERS
------------------------------------------------------- */
async function getTrendingLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems('trending', 10);
  return {
    id: 'trending',
    title: 'Mission Control',
    subtitle: 'Daily highlights from space exploration.',
    layout: 'row',
    items
  };
}

async function getMarsLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems('mars', 8);
  return {
    id: 'mars',
    title: 'The Red Planet',
    subtitle: 'Mars and the machines exploring it.',
    layout: 'grid',
    items
  };
}

async function getEarthLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems('earth', 6);
  return {
    id: 'earth',
    title: 'Earth Orbit',
    subtitle: 'Our planet from low Earth orbit.',
    layout: 'row',
    items
  };
}

async function getClassicsLane(): Promise<ExploreSection> {
  const items = await fetchLaneItems('classics', 12);
  return {
    id: 'classics',
    title: 'Cosmic Wonders',
    subtitle: 'Timeless views of the universe.',
    layout: 'grid',
    items
  };
}

/* -------------------------------------------------------
   MAIN AGGREGATOR
------------------------------------------------------- */
export async function getExplorePageData(): Promise<ExplorePageData> {
  const [trending, mars, earth, classics] = await Promise.all([
    getTrendingLane(),
    getMarsLane(),
    getEarthLane(),
    getClassicsLane()
  ]);

  const allItems = [
    ...trending.items,
    ...mars.items,
    ...earth.items,
    ...classics.items
  ];
  const allIds = allItems.map(item => item.id);

  const likeCounts = await getBulkLikeCounts(allIds);

  const enrich = (section: ExploreSection) => {
    section.items = section.items.map(item => ({
      ...item,
      likes: likeCounts[item.id] || 0
    }));
  };

  enrich(trending);
  enrich(mars);
  enrich(earth);
  enrich(classics);

  return {
    hero: trending.items[0] || mars.items[0],
    sections: [trending, mars, earth, classics]
  };
}