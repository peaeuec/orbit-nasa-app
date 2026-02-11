import { normalizeLibraryItem } from './nasa-cleaners';
import { SpacePost, ExploreSection, ExplorePageData } from './types';

const BASE_URL = 'https://images-api.nasa.gov/search';

/* -------------------------------------------------------
   SESSION + DAILY SEEDING
------------------------------------------------------- */

const SESSION_KEY = 'nasa_explore_seed';

type LaneSeed = {
  q: string;
  page: number;
  year_start?: number;
  year_end?: number;
};

type ExploreSeed = {
  date: string;
  lanes: Record<string, LaneSeed>;
};

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getExploreSeed(): ExploreSeed {
  if (typeof window === 'undefined') {
    return generateSeed();
  }

  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached) {
    const parsed: ExploreSeed = JSON.parse(cached);
    if (parsed.date === getTodayKey()) return parsed;
  }

  const fresh = generateSeed();
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
  return fresh;
}

/* -------------------------------------------------------
   RANDOM HELPERS
------------------------------------------------------- */

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMultiple(arr: string[], count = 2): string {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(' ');
}

function randomYearRange() {
  const start = randomInt(1996, 2018);
  return {
    year_start: start,
    year_end: Math.min(start + randomInt(3, 8), 2024)
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

/* -------------------------------------------------------
   HARD FALLBACKS (GUARANTEED HITS)
------------------------------------------------------- */

const HARD_FALLBACKS: Record<keyof typeof TERM_POOLS, string> = {
  trending: 'James Webb Space Telescope',
  mars: 'Mars',
  earth: 'Earth from space',
  classics: 'Nebula'
};

/* -------------------------------------------------------
   SEED GENERATION
------------------------------------------------------- */

function generateSeed(): ExploreSeed {
  const lanes: ExploreSeed['lanes'] = {};

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

  return { date: getTodayKey(), lanes };
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
    const res = await fetch(`${BASE_URL}?${urlParams.toString()}`);
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
   BULLETPROOF LANE FETCHER
------------------------------------------------------- */

async function fetchLaneItems(
  laneId: keyof typeof TERM_POOLS,
  limit = 10
): Promise<SpacePost[]> {
  const seed = getExploreSeed().lanes[laneId];

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
    {
      q: seed.q,
      media_type: 'image',
      page: '1'
    },
    limit
  );
  if (items.length) return items;

  // 3️⃣ Retry without years
  items = await tryFetch(
    {
      q: seed.q,
      media_type: 'image'
    },
    limit
  );
  if (items.length) return items;

  // 4️⃣ Retry alternate term
  const altQuery = pickMultiple(TERM_POOLS[laneId], 1);
  items = await tryFetch(
    {
      q: altQuery,
      media_type: 'image'
    },
    limit
  );
  if (items.length) return items;

  // 5️⃣ HARD FALLBACK (almost never fails)
  return await tryFetch(
    {
      q: HARD_FALLBACKS[laneId],
      media_type: 'image'
    },
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

  return {
    hero: trending.items[0] || mars.items[0],
    sections: [trending, mars, earth, classics]
  };
}