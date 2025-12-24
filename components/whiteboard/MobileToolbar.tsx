'use client';

import { useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { Tool } from '@/types/whiteboard';

interface MobileToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function MobileToolbar({ onUndo, onRedo, onClear, canUndo, canRedo }: MobileToolbarProps) {
  const { currentTool, setTool, currentColor, setColor, currentWidth, setWidth } = useWhiteboardStore();
  const [showTools, setShowTools] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showWidths, setShowWidths] = useState(false);

  const tools: { tool: Tool; icon: string; label: string }[] = [
    { tool: 'pen', icon: '✏️', label: 'Pen' },
    { tool: 'eraser', icon: '🧹', label: 'Eraser' },
    { tool: 'rectangle', icon: '▭', label: 'Rectangle' },
    { tool: 'circle', icon: '○', label: 'Circle' },
    { tool: 'line', icon: '/', label: 'Line' },
    { tool: 'arrow', icon: '→', label: 'Arrow' },
    { tool: 'text', icon: 'T', label: 'Text' },
    { tool: 'select', icon: '⌖', label: 'Select' },
    { tool: 'hand', icon: '✋', label: 'Pan' },
  ];

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];
  const widths = [2, 4, 8, 12];

  return (
    <>
      {/* Mobile Bottom Toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-40">
        <div className="flex items-center justify-around p-2">
          {/* Tools Button */}
          <button
            onClick={() => {
              setShowTools(!showTools);
              setShowColors(false);
              setShowWidths(false);
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">Tools</span>
          </button>

          {/* Color Button */}
          <button
            onClick={() => {
              setShowColors(!showColors);
              setShowTools(false);
              setShowWidths(false);
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: currentColor }}></div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">Color</span>
          </button>

          {/* Width Button */}
          <button
            onClick={() => {
              setShowWidths(!showWidths);
              setShowTools(false);
              setShowColors(false);
            }}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <div className="rounded-full bg-gray-800 dark:bg-gray-200" style={{ width: `${currentWidth * 2}px`, height: `${currentWidth * 2}px` }}></div>
            </div>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">Width</span>
          </button>

          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">Undo</span>
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
            <span className="text-[10px] text-gray-600 dark:text-gray-400">Redo</span>
          </button>
        </div>

        {/* Tools Panel */}
        {showTools && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-5 gap-2">
              {tools.map(({ tool, icon, label }) => (
                <button
                  key={tool}
                  onClick={() => {
                    setTool(tool);
                    setShowTools(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                    currentTool === tool
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-[9px]">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Colors Panel */}
        {showColors && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-8 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setColor(color);
                    setShowColors(false);
                  }}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    currentColor === color ? 'border-blue-600 scale-110 shadow-lg' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Widths Panel */}
        {showWidths && (
          <div className="border-t border-gray-200 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-800">
            <div className="grid grid-cols-4 gap-2">
              {widths.map((width) => (
                <button
                  key={width}
                  onClick={() => {
                    setWidth(width);
                    setShowWidths(false);
                  }}
                  className={`flex items-center justify-center h-12 rounded-lg transition-all ${
                    currentWidth === width
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div
                    className={`rounded-full ${currentWidth === width ? 'bg-white' : 'bg-gray-800 dark:bg-gray-200'}`}
                    style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close panels */}
      {(showTools || showColors || showWidths) && (
        <div
          className="md:hidden fixed inset-0 z-30"
          onClick={() => {
            setShowTools(false);
            setShowColors(false);
            setShowWidths(false);
          }}
        />
      )}
    </>
  );
}
