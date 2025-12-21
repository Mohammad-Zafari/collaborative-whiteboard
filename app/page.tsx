'use client';

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function Home() {
  const [roomCode, setRoomCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      window.location.href = `/board/${roomCode.trim()}`;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
          Collaborative Whiteboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Draw together in real-time. Create a room and share with your team.
        </p>
        
        <div className="flex flex-col gap-4 items-center mt-8">
          <div className="flex gap-4">
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

          {/* Join Room Section */}
          <div className="mt-4">
            {!showJoinInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Have a room code? Join existing room →
              </button>
            ) : (
              <form onSubmit={handleJoinRoom} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="Enter room code..."
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!roomCode.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinInput(false);
                    setRoomCode("");
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
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
