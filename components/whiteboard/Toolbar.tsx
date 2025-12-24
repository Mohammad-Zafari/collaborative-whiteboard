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

  const { fillShapes, setFillShapes } = useWhiteboardStore();

  const toolButton = (tool: Tool, icon: React.ReactNode, title: string) => (
    <button
      onClick={() => setTool(tool)}
      className={`p-3 rounded-lg transition-colors ${
        currentTool === tool
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
      }`}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-lg p-4 flex gap-6 items-center z-10 border border-gray-300 dark:border-gray-700 max-w-[95vw] overflow-x-auto">
      {/* Drawing Tools */}
      <div className="flex gap-2">
        {toolButton(
          'pen',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>,
          'Pen'
        )}
        
        {toolButton(
          'eraser',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8l-1 12H9l-1-12z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l5-4 5 4" />
          </svg>,
          'Eraser'
        )}
      </div>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

      {/* Shape Tools */}
      <div className="flex gap-2">
        {toolButton(
          'rectangle',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
          </svg>,
          'Rectangle'
        )}
        
        {toolButton(
          'circle',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth={2} />
          </svg>,
          'Circle'
        )}
        
        {toolButton(
          'line',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21L21 3" />
          </svg>,
          'Line'
        )}
        
        {toolButton(
          'arrow',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>,
          'Arrow'
        )}
      </div>

      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

      {/* Text & Select Tools */}
      <div className="flex gap-2">
        {toolButton(
          'text',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>,
          'Text'
        )}
        
        {toolButton(
          'select',
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>,
          'Select'
        )}
      </div>

      {/* Fill Toggle for Shapes */}
      {(currentTool === 'rectangle' || currentTool === 'circle') && (
        <>
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />
          <button
            onClick={() => setFillShapes(!fillShapes)}
            className={`p-3 rounded-lg transition-colors ${
              fillShapes
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={fillShapes ? 'Filled' : 'Outline'}
          >
            <svg className="w-5 h-5" fill={fillShapes ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
            </svg>
          </button>
        </>
      )}
      
      <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

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
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        
        <button
          onClick={handleRedo}
          disabled={redoStack.length === 0}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
          </svg>
        </button>
        
        <button
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400"
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
