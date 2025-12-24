'use client';

import { useState, useEffect, useRef } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#4B0082'
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16, 20];

interface ResizableRightPanelProps {
  showParticipants: boolean;
  onToggleParticipants: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ResizableRightPanel({ showParticipants, onToggleParticipants, isCollapsed, onToggleCollapse }: ResizableRightPanelProps) {
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
  const [width, setWidthState] = useState(320); // Default 320px (w-80)
  const [isResizing, setIsResizing] = useState(false);
  
  // Update customColor when currentColor changes
  useEffect(() => {
    setCustomColor(currentColor);
  }, [currentColor]);

  const activeUsers = Array.from(remoteCursors.values());
  const totalElements = strokes.length + shapes.length + textElements.length;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(250, Math.min(600, window.innerWidth - e.clientX));
      setWidthState(newWidth);
      
      // Update CSS variable for canvas positioning
      document.documentElement.style.setProperty('--right-panel-width', `${newWidth}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  if (isCollapsed) {
    return (
      <aside className="fixed right-0 top-16 bottom-0 w-14 glass border-l border-slate-200/50 dark:border-slate-800/50 shadow-xl z-30 flex flex-col items-center py-6">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95"
          title="Expand Panel"
        >
          <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside 
      className="fixed right-0 top-16 bottom-0 glass border-l border-slate-200/50 dark:border-slate-800/50 shadow-xl z-30 flex flex-col transition-all duration-300 backdrop-blur-xl"
      style={{ width: `${width}px` }}
    >
      {/* Collapse Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -left-11 top-6 p-2.5 glass border border-slate-200/50 dark:border-slate-700/50 rounded-l-xl hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all shadow-lg active:scale-95"
        title="Collapse Panel"
      >
        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-indigo-500 transition-colors group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 rounded-full transition-all"></div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            if (showParticipants) onToggleParticipants();
          }}
          className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all relative ${
            !showParticipants
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Properties
          {!showParticipants && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
          )}
        </button>
        <button
          onClick={() => {
            if (!showParticipants) onToggleParticipants();
          }}
          className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all relative ${
            showParticipants
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span className="flex items-center gap-2 justify-center">
            People
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-semibold">
              {activeUsers.length + 1}
            </span>
          </span>
          {showParticipants && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"></div>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!showParticipants ? (
          // Properties Panel
          <div className="p-5 space-y-6">
            {/* Tool Info */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Current Tool
              </h3>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{currentTool}</p>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Color
              </h3>
              <div className="grid grid-cols-5 gap-2.5 mb-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setColor(color)}
                    className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-110 active:scale-95 ${
                      currentColor === color
                        ? 'border-indigo-600 scale-110 shadow-lg ring-2 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-700'
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
                  className="w-full h-11 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Opacity
                </h3>
                <span className="text-sm font-semibold text-slate-900 dark:text-white px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Stroke Width */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Stroke Width
                </h3>
                <span className="text-sm font-semibold text-slate-900 dark:text-white px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{currentWidth}px</span>
              </div>
              <div className="space-y-2">
                {STROKE_WIDTHS.map((width) => (
                  <button
                    key={width}
                    onClick={() => setWidth(width)}
                    className={`w-full h-11 rounded-xl flex items-center px-4 transition-all active:scale-98 ${
                      currentWidth === width
                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className="rounded-full bg-slate-800 dark:bg-slate-200"
                      style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                    />
                    <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">{width}px</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Stats */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Canvas Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Total Elements</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{totalElements}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Strokes</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{strokes.length}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Shapes</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{shapes.length}</span>
                </div>
                <div className="flex justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Text</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{textElements.length}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Participants Panel
          <div className="p-5 space-y-4">
            {/* Current User */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                You
              </h3>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-200 dark:border-indigo-800">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Host</p>
                </div>
              </div>
            </div>

            {/* Active Users */}
            {activeUsers.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Active ({activeUsers.length})
                </h3>
                <div className="space-y-2">
                  {activeUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {user.userName}
                          </p>
                          <span className="relative flex h-2.5 w-2.5" title="Online">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Editing</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">No one else is here</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Share this board to collaborate in real-time</p>
              </div>
            )}
          </div>
        )}
      </div>

    </aside>
  );
}

