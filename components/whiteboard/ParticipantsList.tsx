'use client';

import { useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { Stroke, CursorPosition } from '@/types/whiteboard';

export default function ParticipantsList() {
  const [isOpen, setIsOpen] = useState(false);
  const { participants, remoteCursors, userId, userName, strokes } = useWhiteboardStore();

  // Get active participants from remote cursors (more accurate than DB)
  const activeUsers: CursorPosition[] = Array.from(remoteCursors.values());
  
  // Add current user
  interface UserInfo {
    userId: string;
    userName: string;
    color: string;
  }
  
  const allUsers: UserInfo[] = [
    {
      userId: userId,
      userName: userName + ' (You)',
      color: '#3B82F6',
    },
    ...activeUsers.map((cursor) => ({
      userId: cursor.userId,
      userName: cursor.userName,
      color: cursor.color,
    })),
  ];

  const totalStrokes = strokes.length;
  const userStrokeCount = strokes.filter((s: Stroke) => s.userId === userId).length;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-4 z-30 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Participants"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-sm font-semibold">{allUsers.length}</span>
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white dark:bg-gray-800 shadow-2xl z-20 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Participants
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {allUsers.length} {allUsers.length === 1 ? 'person' : 'people'} in room
            </p>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {allUsers.map((user) => {
              const isCurrentUser = user.userId === userId;
              const userStrokes = strokes.filter((s: Stroke) => s.userId === user.userId).length;
              
              return (
                <div
                  key={user.userId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {/* User color indicator */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.userName}
                      </p>
                      {!isCurrentUser && (
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userStrokes} {userStrokes === 1 ? 'stroke' : 'strokes'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total strokes:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{totalStrokes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Your strokes:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{userStrokeCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Contribution:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalStrokes > 0 ? Math.round((userStrokeCount / totalStrokes) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
