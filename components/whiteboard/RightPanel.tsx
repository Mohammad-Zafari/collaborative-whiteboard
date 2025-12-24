'use client';

import { useState, useEffect } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#4B0082'
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16, 20];

interface RightPanelProps {
  showParticipants: boolean;
  onToggleParticipants: () => void;
}

export default function RightPanel({ showParticipants, onToggleParticipants }: RightPanelProps) {
  const {
    currentTool,
    currentColor,
    currentWidth,
    opacity,
    setColor,
    setWidth,
    setOpacity,
    strokes,
    shapes,
    textElements,
    remoteCursors,
    userId,
    userName,
  } = useWhiteboardStore();

  const [customColor, setCustomColor] = useState(currentColor);
  
  // Update customColor when currentColor changes
  useEffect(() => {
    setCustomColor(currentColor);
  }, [currentColor]);
  const activeUsers = Array.from(remoteCursors.values());
  const totalElements = strokes.length + shapes.length + textElements.length;

  return (
    <aside className="fixed right-0 top-14 bottom-10 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-xl z-30 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            if (showParticipants) onToggleParticipants();
          }}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            !showParticipants
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => {
            if (!showParticipants) onToggleParticipants();
          }}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            showParticipants
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          People ({activeUsers.length + 1})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!showParticipants ? (
          // Properties Panel
          <div className="p-4 space-y-6">
            {/* Tool Info */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Current Tool
              </h3>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{currentTool}</p>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Color
              </h3>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                      currentColor === color
                        ? 'border-blue-600 scale-110 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setColor(e.target.value);
                  }}
                  className="w-full h-10 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Opacity
                </h3>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Stroke Width */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stroke Width
                </h3>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{currentWidth}px</span>
              </div>
              <div className="space-y-2">
                {STROKE_WIDTHS.map((width) => (
                  <button
                    key={width}
                    onClick={() => setWidth(width)}
                    className={`w-full h-10 rounded-lg flex items-center px-3 transition-all ${
                      currentWidth === width
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className="rounded-full bg-gray-800 dark:bg-gray-200"
                      style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">{width}px</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Stats */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Canvas Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Total Elements</span>
                  <span className="font-medium text-gray-900 dark:text-white">{totalElements}</span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Strokes</span>
                  <span className="font-medium text-gray-900 dark:text-white">{strokes.length}</span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Shapes</span>
                  <span className="font-medium text-gray-900 dark:text-white">{shapes.length}</span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Text</span>
                  <span className="font-medium text-gray-900 dark:text-white">{textElements.length}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Participants Panel
          <div className="p-4 space-y-4">
            {/* Current User */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                You
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Host</p>
                </div>
              </div>
            </div>

            {/* Active Users */}
            {activeUsers.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Active ({activeUsers.length})
                </h3>
                <div className="space-y-2">
                  {activeUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {user.userName}
                          </p>
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Online" />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Editing</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeUsers.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No other users online</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Share the room to collaborate</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
