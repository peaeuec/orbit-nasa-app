'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Uses client-side supabase
import { User, Camera, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AvatarUpload({ 
  userUrl, 
  userId, 
  username 
}: { 
  userUrl?: string; 
  userId: string; 
  username: string 
}) {
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      // 1. Upload the image to the 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update User Profile Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      // 4. Refresh page to show new image
      router.refresh();
      
    } catch (error) {
      alert('Error uploading avatar!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group w-24 h-24 rounded-full overflow-hidden cursor-pointer shadow-2xl shadow-blue-900/50">
      
      {/* Hidden File Input */}
      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
      />
      
      {/* The Upload Trigger Label */}
      <label htmlFor="avatar-upload" className="block w-full h-full cursor-pointer relative">
        
        {/* Current Image or Placeholder */}
        {userUrl ? (
          <img src={userUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <Loader2 className="animate-spin text-white" size={24} />
          </div>
        )}

        {/* Hover Overlay (Camera Icon) */}
        {!uploading && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10">
            <Camera className="text-white drop-shadow-lg" size={24} />
          </div>
        )}
      </label>
    </div>
  );
}