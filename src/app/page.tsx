import { getHeroPost, getHazardStory } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import UserBadge from "@/components/UserBadge";
import AsteroidRadar from "@/components/AsteroidRadar";
import StaggeredText from "@/components/StaggeredText";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hero = await getHeroPost();
  const hazard = await getHazardStory();

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50 gap-4">
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

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* 1. Hero Section */}
        <HeroSection hero={hero} />

        {/* 2. Status Dashboard (60/40 Grid Split) */}
        {/* We use grid-cols-5. 3 columns = 60%, 2 columns = 40% */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12 mb-20">
          {/* AsteroidRadar gets 3 out of 5 columns (60%) */}
          <div className="lg:col-span-3">
            <AsteroidRadar data={hazard} />
          </div>

          {/* Explore Archives gets 2 out of 5 columns (40%) */}
          {/* Explicitly set to h-[500px] to match the exact height we gave the Radar component */}
          <div className="lg:col-span-2 p-8 rounded-2xl border border-cyan-900/50 bg-gradient-to-br from-cyan-950/20 to-black flex flex-col justify-center text-center items-center h-[500px] transition-all duration-500 hover:border-cyan-800/80">
            <button
              className="group/archive outline-none cursor-none flex justify-center mb-4"
              data-cursor-invert="true"
            >
              <StaggeredText
                text="Deep Space Archives"
                className="text-2xl md:text-3xl font-bold text-cyan-400"
                hideClass="group-hover/archive:-translate-y-full"
                showClass="group-hover/archive:translate-y-0"
              />
            </button>

            <p
              className="text-gray-400 text-sm mb-8 max-w-xs"
              data-cursor-invert="true"
            >
              Access thousands of curated images from the Hubble, James Webb,
              and historic missions.
            </p>

            <Link
              href="/explore"
              className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2 cursor-none"
            >
              Enter Archives &rarr;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
