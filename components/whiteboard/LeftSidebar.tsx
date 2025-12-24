'use client';

import { useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { Tool } from '@/types/whiteboard';

interface LeftSidebarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function LeftSidebar({ onUndo, onRedo, onClear, canUndo, canRedo }: LeftSidebarProps) {
  const { currentTool, setTool, currentColor, currentWidth, fillShapes, setFillShapes } = useWhiteboardStore();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const toolButton = (tool: Tool, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setTool(tool)}
      className={`group relative w-full p-3 rounded-xl transition-all ${
        currentTool === tool
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
      title={label}
    >
      <div className="flex items-center justify-center">{icon}</div>
      {/* Tooltip */}
      <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    </button>
  );

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-18 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-30 flex flex-col overflow-hidden">
      {/* Tools Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
        {/* Selection & Navigation */}
        <div className="space-y-1 pb-2 border-b border-gray-200 dark:border-gray-800">
          {toolButton(
            'select',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>,
            'Select (V)'
          )}
          
          {toolButton(
            'hand',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>,
            'Hand (H)'
          )}
        </div>

        {/* Drawing Tools */}
        <div className="space-y-1 pb-2 border-b border-gray-200 dark:border-gray-800">
          {toolButton(
            'pen',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>,
            'Pen (P)'
          )}
          
          {toolButton(
            'highlighter',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>,
            'Highlighter'
          )}
          
          {toolButton(
            'eraser',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>,
            'Eraser (E)'
          )}
        </div>

        {/* Shape Tools */}
        <div className="space-y-1 pb-2 border-b border-gray-200 dark:border-gray-800">
          {toolButton(
            'rectangle',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
            </svg>,
            'Rectangle (R)'
          )}
          
          {toolButton(
            'circle',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
            </svg>,
            'Circle (C)'
          )}
          
          {toolButton(
            'line',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21L21 3" />
            </svg>,
            'Line (L)'
          )}
          
          {toolButton(
            'arrow',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>,
            'Arrow (A)'
          )}
          
          {toolButton(
            'text',
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10" />
            </svg>,
            'Text (T)'
          )}
        </div>

        {/* Fill Toggle for Shapes */}
        {(currentTool === 'rectangle' || currentTool === 'circle') && (
          <div className="pb-2 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setFillShapes(!fillShapes)}
              className={`w-full p-3 rounded-xl transition-all ${
                fillShapes
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
              title={fillShapes ? 'Filled' : 'Outline'}
            >
              <svg className="w-5 h-5 mx-auto" fill={fillShapes ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="p-2 space-y-1 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="w-full p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="w-full p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        
        <button
          onClick={onClear}
          disabled={!canUndo}
          className="w-full p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Clear Canvas"
        >
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Color Indicator */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="w-full p-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          style={{ backgroundColor: currentColor }}
          title="Current Color"
        >
          <div className="h-8"></div>
        </button>
      </div>
    </aside>
  );
}
