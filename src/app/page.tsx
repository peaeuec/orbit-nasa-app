import { getHeroPost, getHazardStory } from "@/lib/api";
import HeroSection from "@/components/HeroSection";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import UserBadge from "@/components/UserBadge";
import AsteroidRadar from "@/components/AsteroidRadar";
import DeepSpaceArchives from "@/components/DeepSpaceArchives";
import SplashScreen from "@/components/SplashScreen";
import NavStarfield from "@/components/NavStarfield";
import { Compass } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hero = await getHeroPost();
  const hazard = await getHazardStory();

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. SPLASH SCREEN */}
      <SplashScreen />

      {/* Navbar */}
      <nav className="relative overflow-hidden border-b border-gray-800 p-4 flex flex-col md:flex-row justify-between items-center bg-black/80 backdrop-blur-md gap-4">
        {/* The animated background */}
        <NavStarfield />

        <div className="flex flex-col md:flex-row justify-between items-center w-full relative z-10">
          <h1 className="text-3xl font-bold tracking-tightest bg-linear-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            <button className="cursor-none outline-none">ORBIT</button>
          </h1>

          <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-0">
            <SearchBar />

            {/* Explore Archives Button */}
            <Link
              href="/explore"
              className="flex items-center gap-2 text-xs md:text-sm text-cyan-400 hover:text-white transition font-medium border border-cyan-900/50 hover:border-cyan-500 bg-cyan-950/30 hover:bg-cyan-900/50 px-4 py-2 rounded-full cursor-none shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Compass size={16} />
              <span className="hidden sm:inline">Explore</span>
            </Link>

            {user ? (
              <div className="avatar-container cursor-none">
                <UserBadge user={user} />
              </div>
            ) : (
              /* NEW: Dual Auth Buttons for Guests */
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs md:text-sm font-bold text-gray-400 hover:text-white transition uppercase tracking-widest px-3 py-2 rounded-full cursor-none"
                >
                  Log In
                </Link>
                <Link
                  href="/login?view=signup"
                  className="text-xs md:text-sm font-bold text-black bg-white hover:bg-gray-200 transition uppercase tracking-widest px-4 py-2 rounded-full cursor-none shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        {/* 1. Hero Section */}
        <HeroSection hero={hero} userId={user?.id} />

        {/* 2. The Asteroid Radar Canvas */}
        <AsteroidRadar data={hazard} />
      </div>

      {/* 3. Explore Archives (Edge-to-Edge) */}
      <DeepSpaceArchives />
    </main>
  );
}
