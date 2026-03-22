import { getExplorePageData } from "@/lib/explore";
import FeedGrid from "@/components/FeedGrid";
import HorizontalFeed from "@/components/HorizontalFeed";
import { createClient } from "@/utils/supabase/server";
import { TrendingUp, Sparkles } from "lucide-react";
import StaggeredText from "@/components/StaggeredText";
import Link from "next/link";
import BackButton from "@/components/BackButton";

const TRENDING_TOPICS = [
  "Supernova",
  "Black Hole",
  "James Webb",
  "Apollo 11",
  "Jupiter",
  "Saturn Rings",
  "Artemis",
  "Nebula",
];

const SURPRISE_TERMS = [
  "Pulsar",
  "Quasar",
  "Tardigrade space",
  "Voyager 1",
  "Cosmic Microwave Background",
  "Titan moon",
  "Event Horizon",
];

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getExplorePageData();

  const { data: likes } = await supabase
    .from("likes")
    .select("nasa_id")
    .eq("user_id", user?.id);
  const likedIds = likes?.map((l) => l.nasa_id) || [];

  const randomSurpriseTerm =
    SURPRISE_TERMS[Math.floor(Math.random() * SURPRISE_TERMS.length)];

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-10 cursor-none">
      {/* --- HEADER --- */}
      <div className="px-4 max-w-7xl mx-auto mb-10 flex flex-col items-start">
        {/* BACK BUTTON (Stacked cleanly on top) */}
        <div className="mb-4">
          <BackButton />
        </div>

        {/* TITLE */}
        <button
          className="group cursor-none w-fit outline-none flex mb-1"
          data-cursor-invert="true"
        >
          <StaggeredText
            text="Deep Space Archives"
            className="text-4xl md:text-5xl font-extrabold text-cyan-400 tracking-tight"
            hideClass="group-hover:-translate-y-full"
            showClass="group-hover:translate-y-0 text-white"
          />
        </button>

        {/* SUBTITLE */}
        <p
          className="text-gray-400 cursor-none w-fit text-base md:text-lg mt-1"
          data-cursor-invert="true"
        >
          Curated collections and live surface data from NASA databases.
        </p>
      </div>

      {/* --- TRENDING SEARCHES WIDGET --- */}
      <div className="px-4 max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-4 text-cyan-400">
          <TrendingUp size={18} />
          <h3 className="font-bold text-sm uppercase tracking-widest">
            Trending Searches
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
          <Link
            href={`/search?q=${encodeURIComponent(randomSurpriseTerm)}`}
            className="snap-start shrink-0 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white rounded-full px-5 py-2.5 transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-none"
            data-cursor-invert="true"
          >
            <Sparkles size={16} className="mr-2" />
            <span className="font-bold text-sm whitespace-nowrap">
              Surprise Me
            </span>
          </Link>

          {TRENDING_TOPICS.map((topic) => (
            <Link
              key={topic}
              href={`/search?q=${encodeURIComponent(topic)}`}
              className="snap-start shrink-0 bg-gray-900 border border-gray-800 hover:border-cyan-500 hover:bg-gray-800 text-gray-300 hover:text-white rounded-full px-5 py-2.5 transition-all text-sm font-medium whitespace-nowrap cursor-none"
              data-cursor-invert="true"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>

      {/* --- DYNAMIC SECTIONS LOOP --- */}
      <div className="flex flex-col gap-16 px-4 max-w-7xl mx-auto">
        {data.sections.map((section) => {
          if (!section.items || section.items.length === 0) return null;

          return (
            <section key={section.id}>
              {/* --- LAYOUT SWITCHER --- */}
              {section.layout === "row" ? (
                <HorizontalFeed
                  posts={section.items}
                  title={section.title}
                  subtitle={section.subtitle}
                  initialLikes={likedIds}
                  userId={user?.id}
                />
              ) : (
                <>
                  <div className="mb-6 border-l-4 border-cyan-500 pl-4">
                    <h2
                      className="group cursor-none w-fit outline-none flex"
                      data-cursor-invert="true"
                    >
                      <StaggeredText
                        text={section.title}
                        className="text-3xl font-bold text-white"
                        hideClass="group-hover:-translate-y-full"
                        showClass="group-hover:translate-y-0 text-cyan-400"
                      />
                    </h2>
                    {section.subtitle && (
                      <p
                        className="text-gray-400 mt-1 cursor-none w-fit"
                        data-cursor-invert="true"
                      >
                        {section.subtitle}
                      </p>
                    )}
                  </div>

                  <FeedGrid
                    posts={section.items}
                    initialLikes={likedIds}
                    userId={user?.id}
                  />
                </>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
