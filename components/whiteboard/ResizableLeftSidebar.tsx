'use client';

import { useState, useRef, useEffect } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { Tool } from '@/types/whiteboard';

interface ResizableLeftSidebarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function ResizableLeftSidebar({ onUndo, onRedo, onClear, canUndo, canRedo }: ResizableLeftSidebarProps) {
  const { currentTool, setTool, currentColor, fillShapes, setFillShapes } = useWhiteboardStore();
  const [width, setWidth] = useState(72); // Default 72px (w-18)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(60, Math.min(300, e.clientX));
      setWidth(newWidth);
      
      // Update CSS variable for canvas positioning
      document.documentElement.style.setProperty('--left-sidebar-width', `${newWidth}px`);
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

  const toolButton = (tool: Tool, icon: React.ReactNode, label: string) => {
    // Scale icon size based on sidebar width
    const iconScale = width < 80 ? 1.2 : 1;
    
    return (
      <button
        onClick={() => setTool(tool)}
        className={`group relative w-full p-3 rounded-xl transition-all ${
          currentTool === tool
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
        }`}
        title={label}
      >
        <div 
          className="flex items-center justify-center"
          style={{ transform: `scale(${iconScale})` }}
        >
          {icon}
        </div>
        {/* Tooltip */}
        <div className="absolute left-full ml-3 px-3 py-2 glass border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 shadow-xl">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-0.5">
            <div className="w-2 h-2 bg-white dark:bg-slate-800 border-l border-t border-slate-200/50 dark:border-slate-700/50 rotate-[-45deg]"></div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <aside 
        ref={sidebarRef}
        className="fixed left-0 top-16 bottom-0 glass border-r border-slate-200/50 dark:border-slate-800/50 shadow-xl z-30 flex flex-col overflow-hidden backdrop-blur-xl"
        style={{ width: `${width}px` }}
      >
        {/* Tools Section */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2">
          {/* Selection & Navigation */}
          <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
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
          <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
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
          <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
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
            <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setFillShapes(!fillShapes)}
                className={`w-full p-3 rounded-xl transition-all ${
                  fillShapes
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
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
        <div className="p-3 space-y-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="w-full p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:scale-95"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="w-full p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 active:scale-95"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          
          <button
            onClick={onClear}
            disabled={!canUndo}
            className="w-full p-3 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 active:scale-95"
            title="Clear Canvas"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Color Indicator */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div
            className="w-full h-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-inner cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: currentColor }}
            title="Current Color"
          />
        </div>

        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-indigo-500 transition-colors group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-slate-300 dark:bg-slate-700 group-hover:bg-indigo-500 rounded-full transition-all"></div>
        </div>
      </aside>
    </>
  );
}

