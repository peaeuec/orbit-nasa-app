import { getHeroPost, getHazardStory } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import UserBadge from "@/components/UserBadge";
import AsteroidRadar from "@/components/AsteroidRadar";

export default async function Home() {
  // 1. Check if the user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch API Data
  const hero = await getHeroPost();
  const hazard = await getHazardStory();

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 p-6 flex flex-col md:flex-row justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50 gap-4">
        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          ORBIT
        </h1>

        <div className="flex items-center gap-6">
          <SearchBar />

          {/* Smart Auth Section */}
          {user ? (
            <UserBadge user={user} />
          ) : (
            <Link
              href="/login"
              className="text-sm font-bold text-gray-400 hover:text-white transition uppercase tracking-widest border border-transparent hover:border-gray-700 px-4 py-2 rounded-full"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* 1. Hero Section */}
        <HeroSection hero={hero} />

        {/* 2. Status Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20 h-[450px]">
          {/* ✅ Swapped static card for dynamic AsteroidRadar */}
          <AsteroidRadar data={hazard} />

          {/* Explore Call to Action Card */}
          <div className="p-8 rounded-2xl border border-blue-900/50 bg-linear-to-br from-blue-950/20 to-black flex flex-col justify-center text-center items-center h-full">
            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-2">
              Restricted Access
            </h3>
            <p className="text-2xl font-bold text-white mb-4">
              Deep Space Archives
            </p>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Access thousands of curated images from the Hubble, James Webb,
              and historic missions.
            </p>

            <Link
              href="/explore"
              className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2"
            >
              Enter Archives &rarr;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
