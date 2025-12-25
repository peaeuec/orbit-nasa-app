import { getHeroPost, getFeedPosts } from '@/lib/api';
import { getPostLikes } from '@/lib/db';

export default async function Home() {
  const hero = await getHeroPost();
  const feed = await getFeedPosts();
  
  // Fetch the dummy likes we created in SQL
  const testLikes = await getPostLikes('test-id'); 

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-4">Backend Test Dashboard</h1>

      {/* NEW: Database Test Section */}
      <div className="bg-yellow-100 p-4 border-l-4 border-yellow-500 text-black mb-8">
        <h2 className="font-bold text-lg">Database Connection Test</h2>
        <p>Checking ID 'test-id': <strong>{testLikes} Likes</strong></p>
        <p className="text-xs text-gray-600">(If this says "5", Supabase is connected!)</p>
      </div>
      
      <h2 className="text-xl text-blue-600 mt-8">1. Hero Post (APOD)</h2>
      <pre className="bg-gray-100 text-black p-4 rounded overflow-auto h-64">
        {JSON.stringify(hero, null, 2)}
      </pre>
      
      <h2 className="text-xl text-green-600 mt-8">2. Feed Posts (Library)</h2>
      <pre className="bg-gray-100 text-black p-4 rounded overflow-auto h-96">
        {JSON.stringify(feed, null, 2)}
      </pre>
    </div>
  );
}