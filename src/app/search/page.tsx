'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchLibraryItems } from '@/lib/api';
import { SpacePost } from '@/lib/types';
import FeedGrid from '@/components/FeedGrid';
import { Loader2, Search, Filter, ChevronRight } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || 'space';

  // --- STATE ---
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SpacePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    image: true,
    video: true,
    audio: false, // Audio is usually boring visually, so default off
  });

  // --- FETCH LOGIC ---
  const fetchResults = async (reset = false) => {
    setLoading(true);
    
    // Calculate which media types to ask for
    const activeTypes = Object.keys(filters).filter(k => filters[k as keyof typeof filters]);
    if (activeTypes.length === 0) activeTypes.push('image'); // Fallback

    const newPage = reset ? 1 : page + 1;
    const newItems = await searchLibraryItems(query, newPage, activeTypes);

    if (reset) {
      setResults(newItems);
      setPage(1);
    } else {
      setResults(prev => [...prev, ...newItems]);
      setPage(newPage);
    }

    // If we got less than 100 items, we probably reached the end
    setHasMore(newItems.length >= 100);
    setLoading(false);
  };

  // Initial Load & Query Change
  useEffect(() => {
    fetchResults(true);
  }, [query, filters]); // Re-run if query or filters change

  // --- HANDLERS ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(true);
  };

  const toggleFilter = (type: 'image' | 'video' | 'audio') => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      
      {/* --- SEARCH HEADER --- */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-6">Deep Space Search</h1>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-900 p-4 rounded-2xl border border-gray-800">
          
          {/* Search Bar */}
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

          {/* Filters */}
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

      {/* --- RESULTS GRID --- */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 text-gray-400 text-sm">
          Showing {results.length} results for <span className="text-white font-bold">"{query}"</span>
        </div>

        <FeedGrid posts={results} />

        {/* --- LOAD MORE / LOADING --- */}
        <div className="py-12 flex justify-center">
          {loading ? (
            <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
          ) : hasMore ? (
            <button 
              onClick={() => fetchResults(false)}
              className="group px-8 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-full font-bold transition flex items-center gap-2"
            >
              Next <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
            </button>
          ) : (
            <p className="text-gray-500">End of the universe reached.</p>
          )}
        </div>
      </div>

    </main>
  );
}