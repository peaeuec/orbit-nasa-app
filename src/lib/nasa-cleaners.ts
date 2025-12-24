import { SpacePost } from './types';

// 1. Clean APOD Data
export function normalizeAPOD(rawJson: any): SpacePost {
  return {
    id: `apod-${rawJson.date}`,
    title: rawJson.title,
    description: rawJson.explanation,
    imageUrl: rawJson.url, 
    date: rawJson.date,
    source: 'APOD',
    likes: 0
  };
}

// 2. Clean Image Library Data
export function normalizeLibraryItem(item: any): SpacePost {
  const data = item.data[0];
  const link = item.links?.[0]?.href; 
  
  return {
    id: data.nasa_id,
    title: data.title,
    description: data.description || "No description available.",
    imageUrl: link || "/placeholder.jpg",
    date: data.date_created?.split('T')[0] || "Unknown Date",
    source: 'NASA_LIB',
    likes: 0
  };
}