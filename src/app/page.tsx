import { getHeroPost, getHazardStory } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import UserBadge from "@/components/UserBadge";
import AsteroidRadar from "@/components/AsteroidRadar";
import DeepSpaceArchives from "@/components/DeepSpaceArchives";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hero = await getHeroPost();
  const hazard = await getHazardStory();

  // Changed to a standard JS comment above the return statement
  // CRITICAL FIX: Removed overflow-x-hidden so 'sticky' works perfectly again!
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center bg-black/50 backdrop-blur-md gap-4">
        <h1 className="text-3xl font-bold tracking-tightest bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          ORBIT
        </h1>

        <div className="flex items-center gap-6">
          <SearchBar />

          {user ? (
            <div className="avatar-container cursor-none">
              <UserBadge user={user} />
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-gray-400 hover:text-white transition uppercase tracking-widest border border-transparent hover:border-gray-700 px-4 py-2 rounded-full cursor-none"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* 1. Hero Section */}
        <HeroSection hero={hero} />

        {/* 2. The Asteroid Radar Canvas */}
        <AsteroidRadar data={hazard} />
      </div>

      {/* 3. Explore Archives (Edge-to-Edge) */}
      <DeepSpaceArchives />
    </main>
  );
}
