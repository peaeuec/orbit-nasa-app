import { normalizeAPOD, normalizeLibraryItem } from "./nasa-cleaners";
import { SpacePost, Story } from "./types";

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
  const query = "James Webb Space Telescope";

  const res = await fetch(
    `https://images-api.nasa.gov/search?q=${query}&media_type=image,video&year_start=2023&page_size=25`,
    { next: { revalidate: 3600 } }, // FIX: Added 1-hour caching
  );

  if (!res.ok) return [];
  const data = await res.json();
  const items = data.collection?.items || [];

  const cleanItems: SpacePost[] = items.map(normalizeLibraryItem);

  return cleanItems;
}

// 2. Popular Feed (The "Greatest Hits")
export async function getPopularFeed(): Promise<SpacePost[]> {
  const query = "earth";

  const res = await fetch(
    `https://images-api.nasa.gov/search?q=${query}&media_type=image&page_size=60`,
    { next: { revalidate: 3600 } }, // FIX: Added 1-hour caching
  );

  if (!res.ok) return [];
  const data = await res.json();
  const items = data.collection?.items || [];

  const cleanItems: SpacePost[] = items.map(normalizeLibraryItem);

  return shuffleArray(cleanItems).slice(0, 24);
}

// 3. Essential Helpers
export async function getHeroPost(): Promise<SpacePost> {
  const res = await fetch(
    `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
    { next: { revalidate: 3600 } }, // FIX: Cache APOD since it only changes once a day!
  );
  if (!res.ok) throw new Error("Failed to fetch APOD");
  return normalizeAPOD(await res.json());
}

export async function getPostById(nasaId: string): Promise<SpacePost | null> {
  try {
    const res = await fetch(
      `https://images-api.nasa.gov/search?nasa_id=${nasaId}`,
      { next: { revalidate: 3600 } }, // FIX: Cache individual post lookups
    );
    const data = await res.json();
    const items = data.collection?.items || [];
    if (items.length > 0) {
      return normalizeLibraryItem(items[0]);
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getHazardStory() {
  const getToday = () => new Date().toISOString().split("T")[0];
  const today = getToday();
  const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY";
  const res = await fetch(
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`,
    {
      next: { revalidate: 3600 },
    },
  );

  if (!res.ok) throw new Error("Failed to fetch asteroids");

  const data = await res.json();
  const rawAsteroids = data.near_earth_objects[today] || [];

  const asteroids = rawAsteroids
    .map((a: any) => ({
      id: a.id,
      name: a.name.replace(/[()]/g, "").trim(),
      isHazardous: a.is_potentially_hazardous_asteroid,
      speedKmh: Math.round(
        parseFloat(
          a.close_approach_data[0].relative_velocity.kilometers_per_hour,
        ),
      ).toLocaleString(),
      lunarDistance: parseFloat(
        a.close_approach_data[0].miss_distance.lunar,
      ).toFixed(2),
      estimatedDiameter: `~${Math.round(a.estimated_diameter.meters.estimated_diameter_max)}m`,
    }))
    .sort(
      (a: any, b: any) =>
        parseFloat(a.lunarDistance) - parseFloat(b.lunarDistance),
    );

  const hazardCount = asteroids.filter((a: any) => a.isHazardous).length;

  return {
    id: `asteroid-${today}`,
    type: "HAZARD",
    thumbnailUrl: "/hazard-icon.png",
    statusColor: hazardCount > 0 ? "red" : "green",
    text: `${asteroids.length} Near Earth Objects (${hazardCount} Hazardous)`,
    asteroids,
  };
}

// 4. Search (For your Navbar Search Bar)
export async function searchLibraryItems(
  query: string,
  page: number = 1,
  mediaTypes: string[] = ["image", "video"],
): Promise<SpacePost[]> {
  const typeParam = mediaTypes.join(",");

  const url = `https://images-api.nasa.gov/search?q=${query}&media_type=${typeParam}&page=${page}&page_size=100`;

  try {
    const res = await fetch(url); // We leave search completely dynamic (uncached)
    if (!res.ok) return [];

    const data = await res.json();
    const items = data.collection?.items || [];

    return items
      .map(normalizeLibraryItem)
      .filter(
        (item: SpacePost) =>
          item.imageUrl && item.imageUrl !== "/placeholder.jpg",
      );
  } catch (e) {
    console.error("Search failed:", e);
    return [];
  }
}
