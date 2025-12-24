'use client';

import { useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';

interface BottomBarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export default function BottomBar({ onZoomIn, onZoomOut, onResetZoom }: BottomBarProps) {
  const { zoom } = useWhiteboardStore();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const zoomPercentage = Math.round(zoom * 100);

  const shortcuts = [
    { keys: ['V'], desc: 'Select tool' },
    { keys: ['H'], desc: 'Hand tool' },
    { keys: ['P'], desc: 'Pen tool' },
    { keys: ['E'], desc: 'Eraser' },
    { keys: ['R'], desc: 'Rectangle' },
    { keys: ['C'], desc: 'Circle' },
    { keys: ['L'], desc: 'Line' },
    { keys: ['A'], desc: 'Arrow' },
    { keys: ['T'], desc: 'Text' },
    { keys: ['Ctrl', 'Z'], desc: 'Undo' },
    { keys: ['Ctrl', 'Y'], desc: 'Redo' },
    { keys: ['Del'], desc: 'Delete selected' },
  ];

  return (
    <>
      <div className="w-full h-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-30 flex items-center justify-between px-4">
        {/* Left: Info */}
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Keyboard Shortcuts
          </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onZoomOut}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <button
            onClick={onResetZoom}
            className="min-w-[60px] px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            {zoomPercentage}%
          </button>
          
          <button
            onClick={onZoomIn}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
        </div>

        {/* Right: Status */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Connected
          </span>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{shortcut.desc}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, i) => (
                        <kbd
                          key={i}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-sm"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
