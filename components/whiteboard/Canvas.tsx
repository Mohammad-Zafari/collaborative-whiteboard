'use client';

import { useEffect, useRef, useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { DrawingEngine } from '@/lib/canvas/drawing';
import { generateStrokeId } from '@/lib/canvas/utils';
import { Point, Stroke, Shape, TextElement, DrawingElement } from '@/types/whiteboard';

interface CanvasProps {
  onStrokeComplete?: (stroke: Stroke) => void;
  onShapeComplete?: (shape: Shape) => void;
  onTextComplete?: (text: TextElement) => void;
  onElementDelete?: (element: DrawingElement) => void;
  onCursorMove?: (x: number, y: number) => void;
  onCanvasReady?: (canvasRef: React.RefObject<HTMLCanvasElement | null>) => void;
}

export default function Canvas({ 
  onStrokeComplete, 
  onShapeComplete, 
  onTextComplete,
  onElementDelete,
  onCursorMove, 
  onCanvasReady 
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DrawingEngine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textBoxBounds, setTextBoxBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const [isDrawingTextBox, setIsDrawingTextBox] = useState(false);
  const currentStrokePoints = useRef<Point[]>([]);

  // Expose canvas ref to parent
  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(canvasRef);
    }
  }, [onCanvasReady]);

  const {
    currentTool,
    currentColor,
    currentWidth,
    fillShapes,
    opacity,
    strokeStyle,
    fontSize,
    userId,
    userName,
    addStroke,
    addShape,
    addText,
    removeElement,
    selectedElement,
    setSelectedElement,
    getAllElements,
    zoom,
    panX,
    panY,
  } = useWhiteboardStore();

  const allElements = getAllElements();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    engineRef.current = new DrawingEngine(canvasRef.current);

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
        // Redraw all elements after resize
        const { getAllElements: getElements } = useWhiteboardStore.getState();
        const currentElements = getElements();
        engineRef.current.drawAllElements(currentElements);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw when elements change or zoom/pan changes
  useEffect(() => {
    if (!engineRef.current) return;
    
    // Apply zoom and pan transformations
    const ctx = engineRef.current.getContext();
    const dpr = window.devicePixelRatio || 1;
    
    ctx.save();
    // Reset to identity, then apply devicePixelRatio, then pan, then zoom
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.scale(dpr, dpr); // Apply devicePixelRatio scaling
    ctx.translate(panX, panY); // Pan in CSS pixels
    ctx.scale(zoom, zoom); // Zoom
    
    engineRef.current.drawAllElements(allElements);
    ctx.restore();
    
    // Draw selection box if element is selected (after a short delay to ensure rendering)
    if (selectedElement && currentTool === 'select') {
      requestAnimationFrame(() => {
        drawSelectionBox(selectedElement);
      });
    }
  }, [allElements, selectedElement, currentTool, zoom, panX, panY]);

  const drawSelectionBox = (element: DrawingElement) => {
    if (!engineRef.current) return;
    
    const ctx = engineRef.current.getContext();
    let bounds = getElementBounds(element);
    if (!bounds) return;

    ctx.save();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      bounds.x - 5,
      bounds.y - 5,
      bounds.width + 10,
      bounds.height + 10
    );
    ctx.restore();
  };

  const getElementBounds = (element: DrawingElement): { x: number; y: number; width: number; height: number } | null => {
    if ('points' in element) {
      const points = element.points;
      if (points.length === 0) return null;
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
      };
    } else if ('type' in element && 'start' in element) {
      const minX = Math.min(element.start.x, element.end.x);
      const minY = Math.min(element.start.y, element.end.y);
      const maxX = Math.max(element.start.x, element.end.x);
      const maxY = Math.max(element.start.y, element.end.y);
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    } else if ('text' in element) {
      // Approximate text bounds
      const textWidth = element.text.length * element.fontSize * 0.6;
      return {
        x: element.position.x,
        y: element.position.y,
        width: textWidth,
        height: element.fontSize,
      };
    }
    return null;
  };

  const isPointInElement = (point: Point, element: DrawingElement): boolean => {
    const bounds = getElementBounds(element);
    if (!bounds) return false;
    
    return (
      point.x >= bounds.x - 5 &&
      point.x <= bounds.x + bounds.width + 5 &&
      point.y >= bounds.y - 5 &&
      point.y <= bounds.y + bounds.height + 5
    );
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || showTextInput) return;

    // Use offsetX/offsetY for more accurate coordinates relative to canvas element
    // These are in CSS pixels and account for any CSS transforms automatically
    const rawPoint = {
      x: e.nativeEvent.offsetX ?? engineRef.current.getCanvasPoint(e.clientX, e.clientY).x,
      y: e.nativeEvent.offsetY ?? engineRef.current.getCanvasPoint(e.clientX, e.clientY).y,
    };
    
    // Debug logging
    console.log('Click Debug:', {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY,
      clientX: e.clientX,
      clientY: e.clientY,
      rawPoint,
      panX,
      panY,
      zoom,
      calculatedPoint: {
        x: (rawPoint.x - panX) / zoom,
        y: (rawPoint.y - panY) / zoom,
      }
    });
    
    // Transform to logical canvas coordinates (accounting for zoom and pan)
    // panX/panY are in CSS pixels, zoom is a scale factor
    const point = {
      x: (rawPoint.x - panX) / zoom,
      y: (rawPoint.y - panY) / zoom,
    };

    // Handle text tool - draw box first
    if (currentTool === 'text') {
      e.preventDefault();
      e.stopPropagation();
      setIsDrawingTextBox(true);
      setStartPoint(point);
      setIsDrawing(true);
      return;
    }

    // Handle select tool
    if (currentTool === 'select') {
      // Check if clicking on an element
      const clickedElement = [...allElements].reverse().find(el => isPointInElement(point, el));
      setSelectedElement(clickedElement || null);
      return;
    }

    // Handle hand tool (pan)
    if (currentTool === 'hand') {
      setIsPanning(true);
      setLastPanPoint(rawPoint); // Use raw point for panning
      return;
    }

    setIsDrawing(true);

    // For shapes, store start point
    if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
      setStartPoint(point);
    } else if (currentTool === 'pen' || currentTool === 'eraser') {
      currentStrokePoints.current = [point];
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;

    // Use offsetX/offsetY for accurate coordinates relative to canvas element
    const rawPoint = {
      x: e.nativeEvent.offsetX ?? engineRef.current.getCanvasPoint(e.clientX, e.clientY).x,
      y: e.nativeEvent.offsetY ?? engineRef.current.getCanvasPoint(e.clientX, e.clientY).y,
    };
    
    // Handle panning
    if (isPanning && lastPanPoint && currentTool === 'hand') {
      const { panX, panY, setPan } = useWhiteboardStore.getState();
      // Pan uses raw CSS pixel coordinates
      const dx = rawPoint.x - lastPanPoint.x;
      const dy = rawPoint.y - lastPanPoint.y;
      setPan(panX + dx, panY + dy);
      setLastPanPoint(rawPoint);
      return;
    }

    // Transform to logical canvas coordinates for drawing
    const point = {
      x: (rawPoint.x - panX) / zoom,
      y: (rawPoint.y - panY) / zoom,
    };

    // Send cursor position for real-time tracking
    if (onCursorMove && !isDrawing && !isPanning) {
      onCursorMove(point.x, point.y);
    }

    if (!isDrawing) return;

    // Handle text box drawing preview
    if (isDrawingTextBox && startPoint) {
      // Draw preview rectangle for text box
      const ctx = engineRef.current.getContext();
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.scale(dpr, dpr); // Apply devicePixelRatio scaling
      ctx.translate(panX, panY); // Pan in CSS pixels
      ctx.scale(zoom, zoom); // Zoom
      
      engineRef.current.drawAllElements(allElements);
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        point.x - startPoint.x,
        point.y - startPoint.y
      );
      ctx.restore();
      return;
    }

    // Handle pen/eraser drawing
    if (currentTool === 'pen' || currentTool === 'eraser' || currentTool === 'highlighter') {
      currentStrokePoints.current.push(point);

      // Draw temporary stroke
      const tempStroke: Stroke = {
        id: 'temp',
        tool: currentTool,
        points: currentStrokePoints.current,
        color: currentColor,
        width: currentWidth,
        opacity,
        strokeStyle,
        userId,
        userName,
        timestamp: Date.now(),
      };

      // Redraw with zoom/pan
      const ctx = engineRef.current.getContext();
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.scale(dpr, dpr); // Apply devicePixelRatio scaling
      ctx.translate(panX, panY); // Pan in CSS pixels
      ctx.scale(zoom, zoom); // Zoom
      engineRef.current.drawAllElements([...allElements, tempStroke]);
      ctx.restore();
    }
    // Handle shape drawing preview
    else if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool) && startPoint) {
      const tempShape: Shape = {
        id: 'temp',
        type: currentTool as 'rectangle' | 'circle' | 'line' | 'arrow',
        start: startPoint,
        end: point,
        color: currentColor,
        width: currentWidth,
        fill: fillShapes,
        opacity,
        strokeStyle,
        userId,
        userName,
        timestamp: Date.now(),
      };

      // Redraw with zoom/pan
      const ctx = engineRef.current.getContext();
      const dpr = window.devicePixelRatio || 1;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.scale(dpr, dpr); // Apply devicePixelRatio scaling
      ctx.translate(panX, panY); // Pan in CSS pixels
      ctx.scale(zoom, zoom); // Zoom
      engineRef.current.drawAllElements([...allElements, tempShape]);
      ctx.restore();
    }
  };

  const stopDrawing = () => {
    // Stop panning
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
      return;
    }

    // Handle text box completion
    if (isDrawingTextBox && startPoint && engineRef.current) {
      const mouseEvent = window.event as MouseEvent;
      const rawEndPoint = engineRef.current.getCanvasPoint(
        mouseEvent?.clientX || 0,
        mouseEvent?.clientY || 0
      );
      const endPoint = {
        x: (rawEndPoint.x - panX) / zoom,
        y: (rawEndPoint.y - panY) / zoom,
      };

      const minX = Math.min(startPoint.x, endPoint.x);
      const minY = Math.min(startPoint.y, endPoint.y);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);

      // Only show text input if box is large enough
      if (width > 20 && height > 20) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          setTextBoxBounds({
            x: minX,
            y: minY,
            width,
            height,
          });
          setShowTextInput(true);
          setTextInputValue('');
        }
      }

      setIsDrawingTextBox(false);
      setIsDrawing(false);
      setStartPoint(null);
      return;
    }

    if (!isDrawing) return;

    // Handle pen/eraser/highlighter
    if ((currentTool === 'pen' || currentTool === 'eraser' || currentTool === 'highlighter') && currentStrokePoints.current.length > 0) {
      const newStroke: Stroke = {
        id: generateStrokeId(),
        tool: currentTool,
        points: [...currentStrokePoints.current],
        color: currentColor,
        width: currentWidth,
        opacity,
        strokeStyle,
        userId,
        userName,
        timestamp: Date.now(),
      };

      addStroke(newStroke);
      
      if (onStrokeComplete) {
        onStrokeComplete(newStroke);
      }
      
      currentStrokePoints.current = [];
    }
    // Handle shapes
    else if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool) && startPoint) {
      if (!engineRef.current) return;
      const endPoint = engineRef.current.getCanvasPoint(
        (window.event as MouseEvent)?.clientX || 0,
        (window.event as MouseEvent)?.clientY || 0
      );

      const newShape: Shape = {
        id: generateStrokeId(),
        type: currentTool as 'rectangle' | 'circle' | 'line' | 'arrow',
        start: startPoint,
        end: endPoint,
        color: currentColor,
        width: currentWidth,
        fill: fillShapes,
        opacity,
        strokeStyle,
        userId,
        userName,
        timestamp: Date.now(),
      };

      addShape(newShape);
      
      if (onShapeComplete) {
        onShapeComplete(newShape);
      }
      
      setStartPoint(null);
    }
    
    setIsDrawing(false);
  };

  const handleTextSubmit = () => {
    if (textInputValue.trim() && textBoxBounds) {
      const newText: TextElement = {
        id: generateStrokeId(),
        text: textInputValue,
        position: { x: textBoxBounds.x, y: textBoxBounds.y },
        color: currentColor,
        fontSize,
        opacity,
        userId,
        userName,
        timestamp: Date.now(),
      };

      addText(newText);
      
      if (onTextComplete) {
        onTextComplete(newText);
      }
    }
    
    setShowTextInput(false);
    setTextInputValue('');
    setTextBoxBounds(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (currentTool === 'select' && selectedElement) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        removeElement(selectedElement);
        if (onElementDelete) {
          onElementDelete(selectedElement);
        }
        setSelectedElement(null);
      }
    }
  };

  const getCursorStyle = () => {
    switch (currentTool) {
      case 'pen':
      case 'eraser':
      case 'rectangle':
      case 'circle':
      case 'line':
      case 'arrow':
        return 'cursor-crosshair';
      case 'text':
        return 'cursor-text';
      case 'select':
        return 'cursor-pointer';
      case 'hand':
        return isPanning ? 'cursor-grabbing' : 'cursor-grab';
      default:
        return 'cursor-default';
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`w-full h-full bg-white touch-none ${getCursorStyle()}`}
        onMouseDown={(e) => {
          if (!showTextInput) {
            startDrawing(e);
          }
        }}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      />
      
      {/* Text Input Box */}
      {showTextInput && textBoxBounds && (
        <div
          className="absolute z-50 pointer-events-auto border-2 border-blue-500 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          style={{
            left: `${textBoxBounds.x * zoom + panX}px`,
            top: `${textBoxBounds.y * zoom + panY}px`,
            width: `${textBoxBounds.width * zoom}px`,
            height: `${textBoxBounds.height * zoom}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <textarea
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                e.preventDefault();
                setShowTextInput(false);
                setTextInputValue('');
                setTextBoxBounds(null);
              }
              // Ctrl+Enter to submit
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
            onBlur={() => {
              // Delay blur to allow Ctrl+Enter to work
              setTimeout(() => {
                if (textInputValue.trim()) {
                  handleTextSubmit();
                } else {
                  setShowTextInput(false);
                  setTextInputValue('');
                  setTextBoxBounds(null);
                }
              }, 100);
            }}
            autoFocus
            className="w-full h-full p-2 outline-none resize-none bg-transparent"
            style={{ 
              fontSize: `${fontSize * zoom}px`, 
              color: currentColor,
              lineHeight: '1.4',
            }}
            placeholder="Type text... (Ctrl+Enter to finish)"
          />
        </div>
      )}
    </div>
  );
}
