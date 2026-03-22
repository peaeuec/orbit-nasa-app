import { normalizeLibraryItem } from "./nasa-cleaners";
import { SpacePost, ExploreSection, ExplorePageData } from "./types";
import { getBulkLikeCounts } from "./db";

const BASE_URL = "https://images-api.nasa.gov/search";

/* -------------------------------------------------------
   DETERMINISTIC RNG (4-HOUR CYCLES)
   This ensures the feed cycles new content throughout the day
   but remains perfectly stable while the user is browsing.
------------------------------------------------------- */
function getTimeBasedSeed(): number {
  const now = new Date();
  const chunkedHour = Math.floor(now.getHours() / 4) * 4;
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return parseInt(`${year}${month}${day}${chunkedHour}`);
}

function createSeededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Helper to pick multiple distinct items from an array
function pickMultiple(
  arr: string[],
  count: number,
  rng: () => number,
): string[] {
  const shuffled = [...arr].sort(() => 0.5 - rng());
  return shuffled.slice(0, count);
}

/* -------------------------------------------------------
   SEARCH TERM POOLS (Massively Expanded)
------------------------------------------------------- */
const TERM_POOLS = {
  // Broad, highly-active terms to yield hundreds of recent results
  trending: [
    "Artemis launch",
    "SpaceX Crew Dragon",
    "James Webb Space Telescope",
    "JWST deep field",
    "Perseverance rover",
    "Commercial Crew",
    "Spacewalk",
    "OSIRIS-REx Bennu",
    "DART mission",
    "Europa Clipper",
    "Psyche mission",
    "Lucy spacecraft",
    "SLS rocket",
    "Orion capsule",
    "Ingenuity helicopter",
    "Hubble Space Telescope",
    "Astronaut training",
  ],
  // Majestic orbital shots, topological features, and moons
  mars: [
    "Mars surface",
    "Mars orbit",
    "Olympus Mons",
    "Valles Marineris",
    "Gale Crater",
    "Martian dunes",
    "MRO HiRISE",
    "Mars ice cap",
    "Phobos moon",
    "Deimos moon",
    "Noctis Labyrinthus",
    "Mars dust storm",
    "Hellas Planitia",
    "Mars crater",
    "Mars horizon",
  ],
  // Specific Earth phenomena shot from the ISS or high-orbit satellites
  earth: [
    "International Space Station",
    "Earth from space night",
    "Earth aurora borealis",
    "hurricane from space",
    "city lights space",
    "Earth limb",
    "ISS Cupola",
    "volcano from space",
    "glacier from space",
    "Earth sunrise space",
    "Himalayas from space",
    "Nile river space",
    "Earth clouds space",
    "ocean from space",
    "astronaut Earth background",
  ],
  // The absolute greatest hits of deep space astronomy
  classics: [
    "Nebula",
    "Galaxy cluster",
    "Supernova remnant",
    "Star formation",
    "Black hole",
    "Pillars of Creation",
    "Carina Nebula",
    "Orion Nebula",
    "Crab Nebula",
    "Andromeda Galaxy",
    "Sombrero Galaxy",
    "Whirlpool Galaxy",
    "Eagle Nebula",
    "Horsehead Nebula",
    "Tarantula Nebula",
    "Ring Nebula",
    "Interacting galaxies",
    "Quasar",
    "Pulsar",
    "Globular cluster",
  ],
  // Gritty, boots-on-the-ground robotics and surface geology
  rover: [
    "Curiosity rover surface",
    "Perseverance landscape",
    "Mars surface rocks",
    "Jezero crater",
    "Opportunity rover",
    "Spirit rover",
    "Mars rover selfie",
    "Mars tracks",
    "Martian soil",
    "Mars rock core",
    "Mastcam",
    "Hazcam",
  ],
};

const HARD_FALLBACKS: Record<keyof typeof TERM_POOLS, string> = {
  trending: "Space Station",
  mars: "Mars",
  earth: "Earth",
  classics: "Galaxy",
  rover: "Mars surface",
};

/* -------------------------------------------------------
   SYNCHRONOUS CONFIG GENERATOR
------------------------------------------------------- */
function generateLaneConfigs() {
  const seed = getTimeBasedSeed();
  const rng = createSeededRandom(seed);

  const currentYear = new Date().getFullYear();

  return {
    seed,
    trending: {
      // Pick 3 random trending terms
      terms: pickMultiple(TERM_POOLS.trending, 3, rng),
      year_start: String(currentYear - 2), // 2022+ for recent news
    },
    mars: {
      // Pick 3 random mars orbital terms
      terms: pickMultiple(TERM_POOLS.mars, 3, rng),
      year_start: undefined, // Drop date limits for better quality
    },
    earth: {
      // Pick 3 random earth terms
      terms: pickMultiple(TERM_POOLS.earth, 3, rng),
      year_start: "2010",
    },
    classics: {
      // Pick 4 random deep space terms
      terms: pickMultiple(TERM_POOLS.classics, 4, rng),
      year_start: undefined,
    },
    rover: {
      // Pick 2 random rover terms
      terms: pickMultiple(TERM_POOLS.rover, 2, rng),
    },
  };
}

/* -------------------------------------------------------
   LOW-LEVEL FETCH (NASA Images API)
------------------------------------------------------- */
async function tryFetch(
  params: Record<string, string>,
  limit: number,
): Promise<SpacePost[]> {
  const urlParams = new URLSearchParams({
    ...params,
    page_size: "50",
  });

  try {
    const res = await fetch(`${BASE_URL}?${urlParams.toString()}`, {
      next: { revalidate: 3600 },
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
   THE NEW "SCATTER & SHUFFLE" FETCHER
------------------------------------------------------- */
async function fetchScatteredLane(
  config: any,
  fallbackKey: keyof typeof HARD_FALLBACKS,
  totalLimit: number,
  isRover: boolean = false,
): Promise<SpacePost[]> {
  // Calculate how many items we need per term (e.g., 20 items / 4 terms = 5 items each)
  // We add +3 as a buffer in case some items get filtered out
  const perTermLimit = Math.ceil(totalLimit / config.terms.length) + 3;

  // 1️⃣ Scatter: Fire off concurrent requests for EVERY term in the config array
  const fetchPromises = config.terms.map((term: string) => {
    const params: any = { q: term, media_type: "image" };
    if (config.year_start) params.year_start = config.year_start;
    if (config.year_end) params.year_end = config.year_end;

    return tryFetch(params, perTermLimit);
  });

  const results = await Promise.all(fetchPromises);

  // 2️⃣ Merge: Flatten the array of arrays into one massive pool of posts
  let combinedItems = results.flat();

  // 3️⃣ Deduplicate: Ensure no repeated images if two terms yielded the same photo
  const uniqueItems = Array.from(
    new Map(combinedItems.map((item) => [item.id, item])).values(),
  );

  // Fallback if the strict date limits killed the fetch completely
  if (uniqueItems.length < Math.floor(totalLimit / 2)) {
    const fallbackItems = await tryFetch(
      { q: HARD_FALLBACKS[fallbackKey], media_type: "image" },
      totalLimit,
    );
    uniqueItems.push(...fallbackItems);
  }

  // 4️⃣ Shuffle: Use our daily seed so the shuffled order stays stable for 4 hours
  const shuffleRng = createSeededRandom(getTimeBasedSeed());
  let finalMix = uniqueItems.sort(() => 0.5 - shuffleRng());

  // If these are rover photos, prepend the robot emoji
  if (isRover) {
    finalMix = finalMix.map((item) => ({ ...item, title: `🤖 ${item.title}` }));
  }

  // 5️⃣ Slice to the exact requested limit
  return finalMix.slice(0, totalLimit);
}

/* -------------------------------------------------------
   MAIN AGGREGATOR
------------------------------------------------------- */
export async function getExplorePageData(): Promise<ExplorePageData> {
  const configs = generateLaneConfigs();

  // Fire all "Scatter & Shuffle" fetches concurrently
  const [trendingItems, marsLibrary, marsRover, earthItems, classicsItems] =
    await Promise.all([
      fetchScatteredLane(configs.trending, "trending", 20),
      fetchScatteredLane(configs.mars, "mars", 16),
      fetchScatteredLane(configs.rover, "rover", 16, true), // isRover = true
      fetchScatteredLane(configs.earth, "earth", 20),
      fetchScatteredLane(configs.classics, "classics", 36),
    ]);

  // Merge the orbital Mars photos with the surface Rover photos and shuffle one last time
  const marsRng = createSeededRandom(configs.seed);
  const combinedMars = [...marsLibrary, ...marsRover].sort(
    () => 0.5 - marsRng(),
  );

  // Build the layout sections
  const trending: ExploreSection = {
    id: "trending",
    title: "Mission Control",
    subtitle: "Recent highlights from deep space exploration.",
    layout: "row",
    items: trendingItems,
  };

  const mars: ExploreSection = {
    id: "mars",
    title: "The Red Planet",
    subtitle: "Orbital imagery combined with raw Curiosity rover surface data.",
    layout: "grid",
    items: combinedMars,
  };

  const earth: ExploreSection = {
    id: "earth",
    title: "Earth Orbit",
    subtitle: "Our planet viewed from low Earth orbit.",
    layout: "row",
    items: earthItems,
  };

  const classics: ExploreSection = {
    id: "classics",
    title: "Cosmic Wonders",
    subtitle: "Timeless views of nebulas and distant galaxies.",
    layout: "grid",
    items: classicsItems,
  };

  const allItems = [
    ...trending.items,
    ...mars.items,
    ...earth.items,
    ...classics.items,
  ];

  const allIds = allItems.map((item) => item.id);
  const likeCounts = await getBulkLikeCounts(allIds);

  const enrich = (section: ExploreSection) => {
    section.items = section.items.map((item) => ({
      ...item,
      likes: likeCounts[item.id] || 0,
    }));
  };

  enrich(trending);
  enrich(mars);
  enrich(earth);
  enrich(classics);

  return {
    hero: trending.items[0] || mars.items[0],
    sections: [trending, mars, earth, classics],
  };
}
