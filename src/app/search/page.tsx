'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchLibraryItems } from '@/lib/api';
import { SpacePost } from '@/lib/types';
import FeedGrid from '@/components/FeedGrid';
import { Loader2, Search, Filter, ChevronRight, Telescope, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client'; 

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || 'space';

  // --- STATE ---
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SpacePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Auth & Social State
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [likedItemIds, setLikedItemIds] = useState<string[]>([]); // Track which items are liked by user
  
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState({
    image: true,
    video: true,
    audio: false, 
  });

  const supabase = createClient();

  // --- CHECK AUTH ON MOUNT ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    checkUser();
  }, []);

  // --- FETCH LOGIC ---
  const fetchResults = useCallback(async (searchQuery: string, reset = false) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true); 

    const activeTypes = Object.keys(filters).filter(k => filters[k as keyof typeof filters]);
    if (activeTypes.length === 0) activeTypes.push('image'); 

    const newPage = reset ? 1 : page + 1;
    
    // 1. Fetch Raw Data from NASA
    const newItems = await searchLibraryItems(trimmed, newPage, activeTypes);
    
    // --- NEW: Enrich with Supabase Data (Likes & Counts) ---
    if (newItems.length > 0) {
      const itemIds = newItems.map(item => item.id);

      // A. Fetch Global Counts (post_likes)
      const { data: countData } = await supabase
        .from('post_likes')
        .select('post_id, like_count')
        .in('post_id', itemIds);

      const countMap: Record<string, number> = {};
      countData?.forEach((row: any) => {
        countMap[row.post_id] = row.like_count;
      });

      // B. Fetch User Status (likes) - Only if logged in
      let newUserLikes: string[] = [];
      if (userId) {
        const { data: userLikeData } = await supabase
          .from('likes')
          .select('nasa_id')
          .eq('user_id', userId)
          .in('nasa_id', itemIds);
        
        newUserLikes = userLikeData?.map((row: any) => row.nasa_id) || [];
      }

      // C. Merge Counts into Items
      const enrichedItems = newItems.map(item => ({
        ...item,
        likes: countMap[item.id] || 0 // Attach the real count here
      }));

      // D. Update States
      if (reset) {
        setResults(enrichedItems);
        setLikedItemIds(newUserLikes);
        setPage(1);
      } else {
        setResults(prev => [...prev, ...enrichedItems]);
        setLikedItemIds(prev => [...prev, ...newUserLikes]);
        setPage(newPage);
      }
    } else {
      // No items found
      if (reset) {
        setResults([]);
        setPage(1);
      }
    }

    setHasMore(newItems.length >= 100); 
    setLoading(false);
  }, [filters, page, userId]); // Added userId as dependency

  // --- DEBOUNCER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchResults(query, true);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500); 

    return () => clearTimeout(timer); 
  }, [query, filters, userId]); // Added userId

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(query, true);
  };

  const toggleFilter = (type: 'image' | 'video' | 'audio') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6">Deep Space Search</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900 p-4 rounded-2xl border border-gray-800">
          <form onSubmit={handleSearch} className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Search the cosmos..."
            />
          </form>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400 mr-2" />
            {(['image', 'video', 'audio'] as const).map(type => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold uppercase transition ${
                  filters[type] 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS AREA */}
      <div className="max-w-7xl mx-auto min-h-[50vh]">
        
        {/* Count */}
        {query.trim() && hasSearched && !loading && results.length > 0 && (
          <div className="mb-4 text-gray-400 text-sm">
            Showing {results.length} results for <span className="text-white font-bold">"{query}"</span>
          </div>
        )}

        {/* Loading */}
        {loading && results.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 text-gray-500 animate-pulse">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <p>Scanning the archives...</p>
           </div>
        )}

        {/* FEED GRID */}
        {results.length > 0 && (
          <FeedGrid 
            posts={results} 
            userId={userId} 
            initialLikes={likedItemIds} // Pass the red hearts!
          />
        )}

        {/* Idle State */}
        {!query.trim() && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="bg-gray-900 p-6 rounded-full mb-4">
              <Telescope size={48} className="text-blue-500 opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 mb-2">Ready to Explore</h2>
            <p>Enter a term above to search the NASA archives.</p>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !loading && results.length === 0 && query.trim() && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <div className="bg-gray-900 p-6 rounded-full mb-4 border border-gray-800">
                <AlertCircle size={48} className="text-red-400 opacity-80" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Echo Failed</h2>
             <p className="mb-6">We couldn't find anything matching <span className="text-blue-400">"{query}"</span>.</p>
             
             <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 max-w-md w-full">
                <p className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Search Tips:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                   <li>Check your spelling.</li>
                   <li>Try simplified terms (e.g., "Galaxy" instead of "Galaxies").</li>
                </ul>
             </div>
          </div>
        )}

        {/* Load More */}
        <div className="py-12 flex justify-center">
          {loading && results.length > 0 ? (
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
          ) : (
            results.length > 0 && hasMore && (
              <button 
                onClick={() => fetchResults(query, false)}
                className="group px-8 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-full font-bold transition flex items-center gap-2"
              >
                Next <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </button>
            )
          )}
        </div>
      </div>
    </main>
  );
}