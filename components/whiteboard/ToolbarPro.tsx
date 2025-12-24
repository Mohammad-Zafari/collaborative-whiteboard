'use client';

import { useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { Tool, StrokeStyle } from '@/types/whiteboard';

interface ToolbarProProps {
  onClear?: () => void;
  onUndo?: (strokeId: string) => void;
  onRedo?: (strokeId: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#00FF7F', '#4B0082'
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12, 16, 20];

const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64];

export default function ToolbarPro({ onClear, onUndo, onRedo, onZoomIn, onZoomOut, onResetZoom }: ToolbarProProps) {
  const {
    currentTool,
    currentColor,
    currentWidth,
    fillShapes,
    setTool,
    setColor,
    setWidth,
    setFillShapes,
    undo,
    redo,
    clear,
    strokes,
    redoStack,
    getLastStrokeId,
    getLastRedoStrokeId,
  } = useWhiteboardStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  const [opacity, setOpacity] = useState(100);
  const [strokeStyle, setStrokeStyle] = useState<StrokeStyle>('solid');
  const [fontSize, setFontSize] = useState(24);
  const [showFontSize, setShowFontSize] = useState(false);

  const handleUndo = () => {
    const strokeId = getLastStrokeId();
    if (strokeId) {
      undo();
      if (onUndo) onUndo(strokeId);
    }
  };

  const handleRedo = () => {
    const strokeId = getLastRedoStrokeId();
    if (strokeId) {
      redo();
      if (onRedo) onRedo(strokeId);
    }
  };

  const handleClear = () => {
    if (confirm('Clear entire canvas? This cannot be undone.')) {
      clear();
      if (onClear) onClear();
    }
  };

  const toolButton = (tool: Tool, icon: React.ReactNode, label: string, shortcut?: string) => (
    <button
      onClick={() => setTool(tool)}
      className={`group relative p-3 rounded-lg transition-all ${
        currentTool === tool
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105'
      }`}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      {icon}
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {label}
        {shortcut && <span className="ml-2 text-gray-400">{shortcut}</span>}
      </div>
    </button>
  );

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30">
      {/* Main Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-4">
          {/* Drawing Tools */}
          <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-600">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Draw</div>
            <div className="flex gap-2">
              {toolButton(
                'select',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>,
                'Select',
                'V'
              )}
              
              {toolButton(
                'hand',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>,
                'Hand (Pan)',
                'H'
              )}

              {toolButton(
                'pen',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>,
                'Pen',
                'P'
              )}
              
              {toolButton(
                'highlighter',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>,
                'Highlighter',
                'H'
              )}
              
              {toolButton(
                'eraser',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>,
                'Eraser',
                'E'
              )}
            </div>
          </div>

          {/* Shape Tools */}
          <div className="flex items-center gap-2 px-3 border-r border-gray-200 dark:border-gray-600">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Shapes</div>
            <div className="flex gap-2">
              {toolButton(
                'rectangle',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
                </svg>,
                'Rectangle',
                'R'
              )}
              
              {toolButton(
                'circle',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                </svg>,
                'Circle',
                'C'
              )}
              
              {toolButton(
                'line',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21L21 3" />
                </svg>,
                'Line',
                'L'
              )}
              
              {toolButton(
                'arrow',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>,
                'Arrow',
                'A'
              )}
              
              {toolButton(
                'text',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>,
                'Text',
                'T'
              )}
            </div>
          </div>

          {/* Color Picker */}
          <div className="relative px-3 border-r border-gray-200 dark:border-gray-600">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Color</div>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-inner hover:scale-110 transition-transform relative"
              style={{ backgroundColor: currentColor }}
              title="Color Picker"
            >
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-64 z-50">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Preset Colors</label>
                    <div className="grid grid-cols-5 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setColor(color);
                            setShowColorPicker(false);
                          }}
                          className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                            currentColor === color
                              ? 'border-blue-600 scale-110 shadow-lg'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Custom Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer"
                      />
                      <button
                        onClick={() => {
                          setColor(customColor);
                          setShowColorPicker(false);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 block">
                      Opacity: {opacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={opacity}
                      onChange={(e) => setOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stroke Width */}
          <div className="relative px-3 border-r border-gray-200 dark:border-gray-600">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Width</div>
            <button
              onClick={() => setShowWidthPicker(!showWidthPicker)}
              className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              title="Stroke Width"
            >
              <div
                className="rounded-full bg-gray-800 dark:bg-gray-200"
                style={{ width: `${Math.min(currentWidth * 2, 24)}px`, height: `${Math.min(currentWidth * 2, 24)}px` }}
              />
            </button>

            {/* Width Picker Dropdown */}
            {showWidthPicker && (
              <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-48 z-50">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 block">Stroke Width</label>
                <div className="space-y-2">
                  {STROKE_WIDTHS.map((width) => (
                    <button
                      key={width}
                      onClick={() => {
                        setWidth(width);
                        setShowWidthPicker(false);
                      }}
                      className={`w-full h-10 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentWidth === width ? 'bg-blue-100 dark:bg-blue-900' : ''
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
            )}
          </div>

          {/* Fill Toggle */}
          {(currentTool === 'rectangle' || currentTool === 'circle') && (
            <div className="px-3 border-r border-gray-200 dark:border-gray-600">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Fill</div>
              <button
                onClick={() => setFillShapes(!fillShapes)}
                className={`w-12 h-12 rounded-lg transition-all ${
                  fillShapes
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={fillShapes ? 'Filled' : 'Outline'}
              >
                <svg className="w-6 h-6 mx-auto" fill={fillShapes ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" strokeWidth={2} />
                </svg>
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 px-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Actions</div>
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={strokes.length === 0}
                className="p-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
              
              <button
                onClick={handleClear}
                disabled={strokes.length === 0}
                className="p-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 hover:scale-105"
                title="Clear Canvas"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Toolbar - Zoom Controls */}
      <div className="mt-3 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center gap-2">
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Zoom Out (-)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        
        <button
          onClick={onResetZoom}
          className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Reset Zoom (Ctrl+0)"
        >
          100%
        </button>
        
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Zoom In (+)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

