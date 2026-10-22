import { normalizeAPOD, normalizeLibraryItem } from "./nasa-cleaners";
import { SpacePost, Story } from "./types";

const API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY";

// Helper to recover real APOD data if NASA's API returns the generic theme logo ("NASA Science" / "nasa-logo@2x.png")
async function fetchScienceNasaApodFallback(): Promise<{
  imageUrl?: string;
  highResUrl?: string;
  title?: string;
} | null> {
  try {
    const pageRes = await fetch("https://science.nasa.gov/apod/", {
      next: { revalidate: 3600 },
    });
    if (!pageRes.ok) return null;
    const html = await pageRes.text();

    const imgMatch =
      html.match(
        /<img[^>]+src=["'](https:\/\/assets\.science\.nasa\.gov\/dynamicimage\/assets\/science\/cds\/apod\/apod\/[^"']+)["']/i
      ) ||
      html.match(
        /<img[^>]+src=["'](https:\/\/assets\.science\.nasa\.gov\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i
      );

    const articleLinkMatch = html.match(
      /href=["'](https:\/\/science\.nasa\.gov\/image-article\/apod-[^"']+)["']/i
    );

    let title: string | undefined = undefined;

    if (articleLinkMatch) {
      try {
        const articleRes = await fetch(articleLinkMatch[1], {
          next: { revalidate: 3600 },
        });
        if (articleRes.ok) {
          const articleHtml = await articleRes.text();
          const h1Match = articleHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
          if (h1Match) {
            title = h1Match[1].replace(/<[^>]+>/g, "").trim();
          }
        }
      } catch {
        const slug = articleLinkMatch[1].split("/").filter(Boolean).pop() || "";
        const titlePart = slug.replace(/^apod-\d{4}-[a-z]+-\d{1,2}-/i, "");
        if (titlePart) {
          title = titlePart
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        }
      }
    }

    if (imgMatch) {
      const rawUrl = imgMatch[1].replace(/&amp;/g, "&");
      const highResUrl = rawUrl.split("?")[0];
      return {
        imageUrl: rawUrl,
        highResUrl: highResUrl,
        title: title || undefined,
      };
    }
    return null;
  } catch (err) {
    console.error("Failed to recover APOD from science.nasa.gov:", err);
    return null;
  }
}

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
  let apodData: any = null;

  try {
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`,
      { next: { revalidate: 3600 } }, // FIX: Cache APOD since it only changes once a day!
    );
    if (res.ok) {
      apodData = await res.json();
    }
  } catch (err) {
    console.error("NASA APOD API request error:", err);
  }

  // Detect if NASA API returned the broken generic WordPress theme logo or failed
  const isBrokenLogo =
    apodData?.title === "NASA Science" ||
    apodData?.url?.includes("nasa-logo") ||
    !apodData?.url;

  if (isBrokenLogo || !apodData) {
    const fallback = await fetchScienceNasaApodFallback();
    if (fallback?.imageUrl) {
      if (apodData) {
        apodData.url = fallback.imageUrl;
        apodData.hdurl = fallback.highResUrl || fallback.imageUrl;
        if (fallback.title) apodData.title = fallback.title;
      } else {
        apodData = {
          date: new Date().toISOString().split("T")[0],
          title: fallback.title || "Astronomy Picture of the Day",
          explanation:
            "Each day a different image or photograph of our fascinating universe is featured, along with a brief explanation written by a professional astronomer.",
          url: fallback.imageUrl,
          hdurl: fallback.highResUrl || fallback.imageUrl,
          media_type: "image",
        };
      }
    }
  }

  // Guaranteed fallback so the site never crashes even if both NASA endpoints fail
  if (!apodData || !apodData.url) {
    apodData = {
      date: new Date().toISOString().split("T")[0],
      title: "Cosmic Cliffs of the Carina Nebula",
      explanation:
        "This landscape of 'mountains' and 'valleys' speckled with glittering stars is actually the edge of a nearby, young, star-forming region called NGC 3324 in the Carina Nebula. Captured in infrared light by NASA's James Webb Space Telescope, this image reveals for the first time previously invisible areas of star birth.",
      url: "https://images-assets.nasa.gov/image/PIA25328/PIA25328~orig.jpg",
      hdurl: "https://images-assets.nasa.gov/image/PIA25328/PIA25328~orig.jpg",
      media_type: "image",
    };
  }

  return normalizeAPOD(apodData);
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
