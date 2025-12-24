'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Canvas from '@/components/whiteboard/Canvas';
import ResizableLeftSidebar from '@/components/whiteboard/ResizableLeftSidebar';
import ResizableRightPanel from '@/components/whiteboard/ResizableRightPanel';
import RemoteCursors from '@/components/whiteboard/RemoteCursors';
import ExportMenu from '@/components/whiteboard/ExportMenu';
import ShareModal from '@/components/whiteboard/ShareModal';
import ThemeToggle from '@/components/theme-toggle';
import { useWhiteboardStore } from '@/store/whiteboard';
import { generateUserId, generateUserName, generateUserColor, throttle } from '@/lib/canvas/utils';
import { useRoom, useRoomStrokes } from '@/hooks/useRoom';
import { useRealtime } from '@/hooks/useRealtime';
import { saveStroke, clearRoomStrokes } from '@/lib/supabase/api';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Stroke, CursorPosition, Shape, TextElement, DrawingElement } from '@/types/whiteboard';

export default function BoardPage() {
  const params = useParams();
  const roomSlug = params.slug as string;
  const { 
    setUserId, 
    setUserName, 
    setRoomId, 
    userId, 
    userName,
    addStroke,
    addShape,
    addText,
    removeElement,
    loadStrokes,
    clear,
    updateCursor,
    removeCursor,
    getAllElements,
    strokes,
    redoStack,
    zoom,
    setZoom,
  } = useWhiteboardStore();

  const [userColor, setUserColor] = useState('#FF6B6B');
  const [isReady, setIsReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showParticipantsTab, setShowParticipantsTab] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const realtimeManagerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize user
  useEffect(() => {
    if (!userId) {
      setUserId(generateUserId());
      setUserName(generateUserName());
      setUserColor(generateUserColor());
    }
    setRoomId(roomSlug);
    setIsReady(true);
  }, [roomSlug, userId, setUserId, setUserName, setRoomId]);

  // Load room and historical strokes
  const { roomId, isLoading: roomLoading } = useRoom(roomSlug);
  const { strokes: historicalStrokes, isLoading: strokesLoading } = useRoomStrokes(roomId);

  // Load historical strokes into store
  useEffect(() => {
    if (!strokesLoading && historicalStrokes.length > 0) {
      loadStrokes(historicalStrokes);
    }
  }, [historicalStrokes, strokesLoading, loadStrokes]);

  // Real-time callbacks
  const handleStrokeAdded = useCallback((stroke: Stroke) => {
    addStroke(stroke);
  }, [addStroke]);

  const handleShapeAdded = useCallback((shape: Shape) => {
    addShape(shape);
  }, [addShape]);

  const handleTextAdded = useCallback((text: TextElement) => {
    addText(text);
  }, [addText]);

  const handleElementDeleted = useCallback((elementId: string) => {
    const allElements = getAllElements();
    const element = allElements.find(el => el.id === elementId);
    if (element) {
      removeElement(element);
    }
  }, [getAllElements, removeElement]);

  const handleCursorMove = useCallback((cursor: CursorPosition) => {
    updateCursor(cursor.userId, cursor);
  }, [updateCursor]);

  const handleUserJoined = useCallback((userId: string, userName: string, color: string) => {
    console.log(`👋 ${userName} joined`);
  }, []);

  const handleUserLeft = useCallback((userId: string) => {
    removeCursor(userId);
  }, [removeCursor]);

  const handleClear = useCallback(() => {
    clear();
  }, [clear]);

  const handleUndo = useCallback((strokeId: string) => {
    const { removeStrokeById } = useWhiteboardStore.getState();
    removeStrokeById(strokeId);
  }, []);

  const handleRedo = useCallback((strokeId: string) => {
    const { addStrokeById } = useWhiteboardStore.getState();
    addStrokeById(strokeId);
  }, []);

  // Connect to realtime
  realtimeManagerRef.current = useRealtime(
    roomId || '',
    userId,
    userName,
    userColor,
    {
      onStrokeAdded: handleStrokeAdded,
      onShapeAdded: handleShapeAdded,
      onTextAdded: handleTextAdded,
      onElementDeleted: handleElementDeleted,
      onCursorMove: handleCursorMove,
      onUserJoined: handleUserJoined,
      onUserLeft: handleUserLeft,
      onClear: handleClear,
      onUndo: handleUndo,
      onRedo: handleRedo,
    }
  );

  // Handle stroke completion
  const handleStrokeComplete = useCallback(async (stroke: Stroke) => {
    if (!roomId || !isSupabaseConfigured) return;
    await saveStroke(roomId, stroke);
  }, [roomId]);

  // Handle shape completion
  const handleShapeComplete = useCallback((shape: Shape) => {
    if (realtimeManagerRef.current?.current) {
      realtimeManagerRef.current.current.sendShape(shape);
    }
  }, []);

  // Handle text completion
  const handleTextComplete = useCallback((text: TextElement) => {
    if (realtimeManagerRef.current?.current) {
      realtimeManagerRef.current.current.sendText(text);
    }
  }, []);

  // Handle element deletion
  const handleElementDelete = useCallback((element: DrawingElement) => {
    if (realtimeManagerRef.current?.current) {
      realtimeManagerRef.current.current.sendDelete(element.id);
    }
  }, []);

  // Handle cursor movement
  const handleCursorMove2 = useCallback(
    throttle((x: number, y: number) => {
      if (realtimeManagerRef.current?.current) {
        realtimeManagerRef.current.current.sendCursor(x, y);
      }
    }, 50),
    []
  );

  // Handle clear canvas
  const handleClearCanvas = useCallback(async () => {
    if (!confirm('Clear entire canvas? This cannot be undone.')) return;
    if (roomId && isSupabaseConfigured) {
      await clearRoomStrokes(roomId);
    }
    clear();
    if (realtimeManagerRef.current?.current) {
      realtimeManagerRef.current.current.sendClear();
    }
  }, [roomId, clear]);

  // Handle undo/redo
  const handleUndoAction = useCallback(() => {
    const { getLastStrokeId, undo } = useWhiteboardStore.getState();
    const strokeId = getLastStrokeId();
    if (strokeId) {
      undo();
      if (realtimeManagerRef.current?.current) {
        realtimeManagerRef.current.current.sendUndo(strokeId);
      }
    }
  }, []);

  const handleRedoAction = useCallback(() => {
    const { getLastRedoStrokeId, redo } = useWhiteboardStore.getState();
    const strokeId = getLastRedoStrokeId();
    if (strokeId) {
      redo();
      if (realtimeManagerRef.current?.current) {
        realtimeManagerRef.current.current.sendRedo(strokeId);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedoAction();
        } else {
          handleUndoAction();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedoAction();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndoAction, handleRedoAction]);

  if (!isReady || roomLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading Room</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Preparing your canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Modern Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm z-40">
        <div className="h-full flex items-center justify-between px-4">
          {/* Left: Logo & Room */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">CollabBoard</h1>
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800"></div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{roomSlug}</span>
              {isSupabaseConfigured && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <ExportMenu canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>} roomSlug={roomSlug} />
            
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      <ResizableLeftSidebar
        onUndo={handleUndoAction}
        onRedo={handleRedoAction}
        onClear={handleClearCanvas}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
      />

      {/* Right Panel */}
      <ResizableRightPanel
        showParticipants={showParticipantsTab}
        onToggleParticipants={() => setShowParticipantsTab(!showParticipantsTab)}
        isCollapsed={isRightPanelCollapsed}
        onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
      />

      {/* Main Canvas Area */}
      <main 
        className="fixed top-14 bottom-0 bg-white dark:bg-gray-800"
        style={{
          left: 'var(--left-sidebar-width, 72px)',
          right: isRightPanelCollapsed ? '0px' : 'var(--right-panel-width, 320px)',
        }}
      >
        <Canvas
          onStrokeComplete={handleStrokeComplete}
          onShapeComplete={handleShapeComplete}
          onTextComplete={handleTextComplete}
          onElementDelete={handleElementDelete}
          onCursorMove={handleCursorMove2}
          onCanvasReady={(ref) => {
            canvasRef.current = ref.current;
          }}
        />
        <RemoteCursors />
        
        {/* Zoom Controls - Floating */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 z-20">
          <button
            onClick={() => {
              const newZoom = Math.max(0.1, zoom - 0.1);
              setZoom(newZoom);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <button
            onClick={() => {
              const newZoom = Math.min(3, zoom + 0.1);
              setZoom(newZoom);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomSlug={roomSlug}
      />
    </div>
  );
}
