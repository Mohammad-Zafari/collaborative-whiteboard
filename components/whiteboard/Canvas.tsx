'use client';

import { useEffect, useRef, useState } from 'react';
import { useWhiteboardStore } from '@/store/whiteboard';
import { DrawingEngine } from '@/lib/canvas/drawing';
import { generateStrokeId } from '@/lib/canvas/utils';
import { Point, Stroke } from '@/types/whiteboard';

interface CanvasProps {
  onStrokeComplete?: (stroke: Stroke) => void;
  onCursorMove?: (x: number, y: number) => void;
}

export default function Canvas({ onStrokeComplete, onCursorMove }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DrawingEngine | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokePoints = useRef<Point[]>([]);

  const {
    strokes,
    currentTool,
    currentColor,
    currentWidth,
    userId,
    userName,
    addStroke,
  } = useWhiteboardStore();

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    engineRef.current = new DrawingEngine(canvasRef.current);

    const handleResize = () => {
      engineRef.current?.resize();
      engineRef.current?.drawAllStrokes(strokes);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redraw when strokes change
  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.drawAllStrokes(strokes);
  }, [strokes]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;

    setIsDrawing(true);
    const point = engineRef.current.getCanvasPoint(e.clientX, e.clientY);
    currentStrokePoints.current = [point];
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;

    const point = engineRef.current.getCanvasPoint(e.clientX, e.clientY);

    // Send cursor position for real-time tracking
    if (onCursorMove && !isDrawing) {
      onCursorMove(point.x, point.y);
    }

    if (!isDrawing) return;

    currentStrokePoints.current.push(point);

    // Draw temporary stroke
    const tempStroke: Stroke = {
      id: 'temp',
      tool: currentTool,
      points: currentStrokePoints.current,
      color: currentColor,
      width: currentWidth,
      userId,
      userName,
      timestamp: Date.now(),
    };

    engineRef.current.drawAllStrokes([...strokes, tempStroke]);
  };

  const stopDrawing = () => {
    if (!isDrawing || currentStrokePoints.current.length === 0) return;

    const newStroke: Stroke = {
      id: generateStrokeId(),
      tool: currentTool,
      points: [...currentStrokePoints.current],
      color: currentColor,
      width: currentWidth,
      userId,
      userName,
      timestamp: Date.now(),
    };

    addStroke(newStroke);
    
    // Notify parent component (for real-time sync)
    if (onStrokeComplete) {
      onStrokeComplete(newStroke);
    }
    
    setIsDrawing(false);
    currentStrokePoints.current = [];
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-white cursor-crosshair touch-none"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
}
