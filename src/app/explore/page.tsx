import { getExplorePageData } from "@/lib/explore";
import FeedGrid from "@/components/FeedGrid";
import { createClient } from "@/utils/supabase/server";
import { PlayCircle } from "lucide-react";
import StaggeredText from "@/components/StaggeredText"; // 1. Import Staggered Text

export default async function ExplorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch Data
  const data = await getExplorePageData();

  // 2. Fetch Likes
  const { data: likes } = await supabase
    .from("likes")
    .select("nasa_id")
    .eq("user_id", user?.id);
  const likedIds = likes?.map((l) => l.nasa_id) || [];

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-10">
      {/* Page Title */}
      <div className="px-4 max-w-7xl mx-auto mb-8">
        {/* 2. Added Group, Cursor None, Invert, and StaggeredText */}
        <button
          className="group cursor-none w-fit mb-2"
          data-cursor-invert="true"
        >
          <StaggeredText
            text="Deep Space Archives"
            className="text-4xl font-bold text-cyan-400"
          />
        </button>
        {/* 3. Added Cursor Invert to the subtitle */}
        <p
          className="text-gray-400 mt-2 cursor-none w-fit"
          data-cursor-invert="true"
        >
          Curated collections from the NASA database.
        </p>
      </div>

      {/* --- DYNAMIC SECTIONS LOOP --- */}
      <div className="flex flex-col gap-16 px-4 max-w-7xl mx-auto">
        {data.sections.map((section) => {
          // If no items, don't render the section at all
          if (!section.items || section.items.length === 0) return null;

          return (
            <section key={section.id}>
              {/* Section Header */}
              {/* Updated accent border to cyan */}
              <div className="mb-6 border-l-4 border-cyan-500 pl-4">
                {/* 4. Added Group, Cursor None, Invert, and StaggeredText to Section Titles */}
                <h2
                  className="group cursor-none w-fit"
                  data-cursor-invert="true"
                >
                  <StaggeredText
                    text={section.title}
                    className="text-3xl font-bold text-white"
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

              {/* --- LAYOUT SWITCHER --- */}
              {section.layout === "row" ? (
                // ROW LAYOUT (Horizontal Scroll)
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x custom-scrollbar">
                  {section.items.map((item) => (
                    // 5. Added cursor-none and data-cursor-image to row items so the ripple custom cursor works on them too!
                    <div
                      key={item.id}
                      className="min-w-[280px] w-[280px] snap-center group cursor-none relative"
                      data-cursor-image="true"
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-900 border border-gray-800 mb-3 relative">
                        <img
                          src={item.imageUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          alt={item.title}
                        />
                        {item.mediaType === "video" && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <PlayCircle
                              size={40}
                              className="text-white opacity-80"
                            />
                          </div>
                        )}
                      </div>
                      {/* Hover text changed to cyan to match aesthetic */}
                      <h3 className="font-bold truncate group-hover:text-cyan-400 transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // GRID LAYOUT (FeedGrid natively handles its own custom cursors inside)
                <FeedGrid
                  posts={section.items}
                  initialLikes={likedIds}
                  userId={user?.id}
                />
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
