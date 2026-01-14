'use client'; // This component needs interactive features like useState

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react'; // Make sure you have lucide-react installed

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the page from reloading
    if (query.trim()) {
      // Redirect to the search results page with the query in the URL
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search cosmos..."
        className="bg-gray-900/50 border border-gray-800 text-sm text-gray-300 rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-blue-500 focus:text-white transition w-40 md:w-64 placeholder-gray-500"
      />
      <button type="submit" className="absolute right-3 text-gray-500 hover:text-blue-400 transition">
        <Search size={18} />
      </button>
    </form>
  );
}