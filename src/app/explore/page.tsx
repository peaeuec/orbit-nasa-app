import { getExplorePageData } from '@/lib/explore';
import FeedGrid from '@/components/FeedGrid'; 
import { createClient } from '@/utils/supabase/server';
import { PlayCircle } from 'lucide-react'; 

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch Data
  const data = await getExplorePageData();

  // 2. Fetch Likes
  const { data: likes } = await supabase
    .from('likes')
    .select('nasa_id')
    .eq('user_id', user?.id);
  const likedIds = likes?.map(l => l.nasa_id) || [];

  return (
    <main className="min-h-screen bg-black text-white pb-20 pt-10">
      
      {/* Page Title (Since Hero is gone) */}
      <div className="px-4 max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold">Deep Space Archives</h1>
        <p className="text-gray-400 mt-2">Curated collections from the NASA database.</p>
      </div>

      {/* --- DYNAMIC SECTIONS LOOP --- */}
      <div className="flex flex-col gap-16 px-4 max-w-7xl mx-auto">
        {data.sections.map((section) => {
          //If no items, don't render the section at all
          if (!section.items || section.items.length === 0) return null;

          return (
            <section key={section.id}>
              
              {/* Section Header */}
              <div className="mb-6 border-l-4 border-blue-500 pl-4">
                <h2 className="text-3xl font-bold">{section.title}</h2>
                {section.subtitle && (
                  <p className="text-gray-400 mt-1">{section.subtitle}</p>
                )}
              </div>

              {/* --- LAYOUT SWITCHER --- */}
              {section.layout === 'row' ? (
                // ROW LAYOUT
                <div className="flex gap-6 overflow-x-auto pb-6 snap-x scrollbar-hide">
                  {section.items.map(item => (
                    <div key={item.id} className="min-w-[280px] w-[280px] snap-center group cursor-pointer relative">
                       <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-900 border border-gray-800 mb-3 relative">
                          <img 
                            src={item.imageUrl} 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            alt={item.title} 
                          />
                          {item.mediaType === 'audio' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                               <PlayCircle size={40} className="text-white opacity-80" />
                            </div>
                          )}
                       </div>
                       <h3 className="font-bold truncate group-hover:text-blue-400 transition">
                         {item.title}
                       </h3>
                       <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                // GRID LAYOUT
                <FeedGrid posts={section.items} initialLikes={likedIds} />
              )}
            
            </section>
          );
        })}
      </div>

    </main>
  );
}