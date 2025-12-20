'use client';

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
          Collaborative Whiteboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Draw together in real-time. Create a room and share with your team.
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/board/demo"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Try Demo
          </Link>
          <button
            onClick={() => {
              const roomId = Math.random().toString(36).substring(7);
              window.location.href = `/board/${roomId}`;
            }}
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700"
          >
            Create New Room
          </button>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">🎨 Drawing Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pen, eraser, colors, and adjustable stroke widths
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">⚡ Real-time Sync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See changes instantly as others draw on the canvas
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">👥 Collaboration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Multiple users can draw together in the same room
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
