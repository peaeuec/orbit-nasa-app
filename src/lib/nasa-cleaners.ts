import { SpacePost } from "./types";

// 1. Clean APOD Data
export function normalizeAPOD(data: any): SpacePost {
  return {
    id: `apod-${data.date || new Date().toISOString().split("T")[0]}`,
    title: data.title || "Astronomy Picture of the Day",
    description: data.explanation || "No description available.",
    imageUrl: data.url || "/placeholder.jpg",
    highResUrl: data.hdurl || data.url || "/placeholder.jpg",
    date: data.date || new Date().toISOString().split("T")[0],
    source: "APOD",
    likes: 0,
    mediaType: data.media_type || "image",
  };
}

// 2. Clean Image Library Data
export function normalizeLibraryItem(item: any): SpacePost {
  const data = item.data?.[0];
  const link = item.links?.[0]?.href;

  // Grab the thumbnail for fast grid loading
  const thumbUrl = link || "/placeholder.jpg";

  // BULLETPROOF FIX: Use Regex to catch ~thumb, ~small, ~medium, or ~large
  // and replace it with ~orig while preserving the original file extension (.jpg, .png, etc.)
  const highResUrl = thumbUrl.replace(
    /~(thumb|small|medium|large)\./i,
    "~orig.",
  );

  return {
    id: data?.nasa_id || "unknown",
    title: data?.title || "Untitled",
    description: data?.description || "No description available.",
    imageUrl: thumbUrl,
    highResUrl: highResUrl, // Now passes the true uncompressed URL
    date: data?.date_created?.split("T")[0] || "Unknown Date",
    source: "NASA_LIB",
    likes: 0,
    mediaType:
      data?.media_type === "video"
        ? "video"
        : data?.media_type === "audio"
          ? "audio"
          : "image",
  };
}
