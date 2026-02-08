import { getLibraryItems } from '@/lib/api';
import FeedGrid from '@/components/FeedGrid';
import SearchBar from '@/components/SearchBar';

type Props = {
  searchParams: Promise<{ q?: string }>; // Next.js 16 requires this to be a Promise
};

export default async function SearchPage({ searchParams }: Props) {
  // 1. Await the parameters before using them
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  // 2. Fetch results
  const results = query ? await getLibraryItems(query) : [];

  return (
    <main className="min-h-screen bg-black text-white font-sans">
      {/* --- Navbar --- */}
      <nav className="border-b border-gray-800 p-6 flex flex-col md:flex-row justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50 gap-4">
        <a href="/" className="text-2xl font-bold tracking-tighter bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ORBIT
        </a>
  
        <div className="flex items-center gap-6">
          <SearchBar />
          <div className="flex items-center gap-2 hidden md:flex">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
             </span>
             <span className="text-xs text-gray-500 font-mono">SYSTEM ONLINE</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          {query ? (
            <p className="text-gray-400">
              Found {results.length} results for <span className="text-blue-400">"{query}"</span>
            </p>
          ) : (
            <p className="text-gray-400">Please enter a search term.</p>
          )}
        </div>

        {results.length > 0 ? (
          <FeedGrid posts={results} />
        ) : query ? (
          <div className="text-center text-gray-500 py-20 border border-dashed border-gray-800 rounded-xl">
            No results found. Try searching for something else like "Apollo" or "Jupiter".
          </div>
        ) : null}
      </div>
    </main>
  );
}