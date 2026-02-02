import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getLibraryItems } from '@/lib/api';
import FeedGrid from '@/components/FeedGrid';

export default async function ExplorePage() {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?message=You must be logged in to view the archives');
  }

  // 2. Fetch Topics (Feed)
  const topics = ['nebula', 'black hole', 'mars rover', 'supernova', 'galaxy', 'astronaut', 'saturn'];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  const feed = await getLibraryItems(randomTopic);

  // 3. ✅ FETCH LIKES: Get the list of IDs this user has liked
  const { data: likes } = await supabase
    .from('likes')
    .select('nasa_id')
    .eq('user_id', user.id);

  // Convert the array of objects [{nasa_id: "123"}] -> ["123"]
  const likedIds = likes?.map(like => like.nasa_id) || [];

  const displayName = user.user_metadata?.username || user.email;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold">Deep Space Archives</h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, <span className="text-blue-400 font-bold">{displayName}</span>
          </p>
        </div>
        <span className="bg-blue-900/30 text-blue-400 px-3 py-1 rounded-full text-xs font-mono border border-blue-900 uppercase">
          QUERY: {randomTopic}
        </span>
      </div>

      {/* The Grid */}
      <div className="max-w-7xl mx-auto">
        {/* ✅ Pass the liked IDs to the component */}
        <FeedGrid posts={feed} initialLikes={likedIds} />
      </div>
    </main>
  );
}