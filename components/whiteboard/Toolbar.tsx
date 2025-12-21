'use client';

import { useWhiteboardStore } from '@/store/whiteboard';
import { Tool } from '@/types/whiteboard';

const COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
];

const WIDTHS = [1, 2, 4, 8, 12];

interface ToolbarProps {
  onClear?: () => void;
  onUndo?: (strokeId: string) => void;
  onRedo?: (strokeId: string) => void;
}

export default function Toolbar({ onClear, onUndo, onRedo }: ToolbarProps) {
  const {
    currentTool,
    currentColor,
    currentWidth,
    setTool,
    setColor,
    setWidth,
    undo,
    redo,
    clear,
    strokes,
    redoStack,
    getLastStrokeId,
    getLastRedoStrokeId,
  } = useWhiteboardStore();

  const handleUndo = () => {
    const strokeId = getLastStrokeId();
    if (strokeId) {
      undo();
      if (onUndo) {
        onUndo(strokeId);
      }
    }
  };

  const handleRedo = () => {
    const strokeId = getLastRedoStrokeId();
    if (strokeId) {
      redo();
      if (onRedo) {
        onRedo(strokeId);
      }
    }
  };

  const handleClear = () => {
    if (confirm('Clear entire canvas? This cannot be undone.')) {
      clear();
      if (onClear) {
        onClear();
      }
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex gap-6 items-center z-10">
      {/* Tools */}
      <div className="flex gap-2">
        <button
          onClick={() => setTool('pen')}
          className={`p-3 rounded-lg transition-colors ${
            currentTool === 'pen'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="Pen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        
        <button
          onClick={() => setTool('eraser')}
          className={`p-3 rounded-lg transition-colors ${
            currentTool === 'eraser'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title="Eraser"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

      {/* Colors */}
      <div className="flex gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setColor(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === color
                ? 'border-blue-600 scale-110'
                : 'border-gray-300 dark:border-gray-600 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

      {/* Width */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">Width:</span>
        {WIDTHS.map((width) => (
          <button
            key={width}
            onClick={() => setWidth(width)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              currentWidth === width
                ? 'bg-blue-600'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={`${width}px`}
          >
            <div
              className={`rounded-full ${
                currentWidth === width ? 'bg-white' : 'bg-gray-600 dark:bg-gray-300'
              }`}
              style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        
        <button
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        
        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400"
          title="Clear Canvas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
