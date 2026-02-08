import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getTrendingFeed, getPopularFeed } from '@/lib/api'; 
import FeedGrid from '@/components/FeedGrid';
import { Flame, Star } from 'lucide-react'; 

export default async function ExplorePage() {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=You must be logged in to view the archives');
  }

  // 2. Fetch Feeds in Parallel (Fast!)
  const [trending, popular] = await Promise.all([
    getTrendingFeed(),
    getPopularFeed()
  ]);

  // 3. Fetch User Likes (so hearts show red)
  const { data: likes } = await supabase
    .from('likes')
    .select('nasa_id')
    .eq('user_id', user.id);

  const likedIds = likes?.map(l => l.nasa_id) || [];
  const displayName = user.user_metadata?.username || user.email;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold">Deep Space Archives</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back, <span className="text-blue-400 font-bold">{displayName}</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-16">
        
        {/* SECTION 1: TRENDING (Active Missions) */}
        <section>
           <div className="flex items-center gap-2 mb-6">
              <Flame className="text-orange-500" />
              <h2 className="text-2xl font-bold bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                Trending Missions
              </h2>
           </div>
           {/* If api.ts returns empty, show a fallback message or empty grid */}
           {trending.length > 0 ? (
             <FeedGrid posts={trending} initialLikes={likedIds} />
           ) : (
             <p className="text-gray-500 text-sm">Loading mission data...</p>
           )}
        </section>

        {/* SECTION 2: POPULAR (Greatest Hits) */}
        <section>
           <div className="flex items-center gap-2 mb-6">
              <Star className="text-purple-500" />
              <h2 className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Most Popular
              </h2>
           </div>
           <FeedGrid posts={popular} initialLikes={likedIds} />
        </section>

      </div>
    </main>
  );
}