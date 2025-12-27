'use client'; 

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app, you would log this to a service like Sentry
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-2xl text-red-500 font-bold mb-4">
        Houston, we have a problem.
      </h2>
      <p className="text-gray-400 mb-8 max-w-md">
        {error.message || "Something went wrong communicating with the backend."}
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition font-bold"
      >
        Try Again
      </button>
    </div>
  );
}