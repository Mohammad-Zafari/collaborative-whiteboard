'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Canvas from '@/components/whiteboard/Canvas';
import ResizableLeftSidebar from '@/components/whiteboard/ResizableLeftSidebar';
import ResizableRightPanel from '@/components/whiteboard/ResizableRightPanel';
import MobileToolbar from '@/components/whiteboard/MobileToolbar';
import RemoteCursors from '@/components/whiteboard/RemoteCursors';
import ExportMenu from '@/components/whiteboard/ExportMenu';
import ShareModal from '@/components/whiteboard/ShareModal';
import KeyboardShortcuts from '@/components/whiteboard/KeyboardShortcuts';
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
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showParticipantsTab, setShowParticipantsTab] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const realtimeManagerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Get active users from remote cursors
  const activeUsers = Array.from(useWhiteboardStore.getState().remoteCursors.values());

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      // Show keyboard shortcuts on '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }
      
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900/50"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Loading Board</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Setting up your canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Modern Professional Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 glass border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm z-40">
        <div className="h-full flex items-center justify-between px-3 sm:px-6">
          {/* Left: Logo & Room Info */}
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all group-hover:scale-105">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold hidden sm:block gradient-text">
                CollabBoard
              </span>
            </Link>
            
            {/* Divider */}
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
            
            {/* Room Info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-[200px]">
                    {roomSlug}
                  </span>
                  {isSupabaseConfigured && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                      </span>
                      <span className="hidden sm:inline">Live</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Room • {activeUsers.length + 1} {activeUsers.length === 0 ? 'participant' : 'participants'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Participants Avatars (Desktop only) */}
            {activeUsers.length > 0 && (
              <div className="hidden lg:flex items-center -space-x-2 mr-2">
                {activeUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.userId}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-slate-900 shadow-md"
                    style={{ backgroundColor: user.color }}
                    title={user.userName}
                  >
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                ))}
                {activeUsers.length > 3 && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-2 border-white dark:border-slate-900 shadow-md">
                    +{activeUsers.length - 3}
                  </div>
                )}
              </div>
            )}
            
            {/* Export Menu (Desktop only) */}
            <div className="hidden sm:block">
              <ExportMenu canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>} roomSlug={roomSlug} />
            </div>
            
            {/* Keyboard Shortcuts Button (Desktop only) */}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="hidden lg:flex btn btn-ghost px-3 py-2 text-sm gap-2"
              title="Keyboard Shortcuts (?)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
            
            {/* Share Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="btn btn-primary px-3 sm:px-5 py-2 text-sm gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="hidden sm:inline">Share</span>
            </button>
            
            {/* Theme Toggle (Desktop only) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Left Sidebar - Hidden on Mobile */}
      <div className="hidden md:block">
        <ResizableLeftSidebar
          onUndo={handleUndoAction}
          onRedo={handleRedoAction}
          onClear={handleClearCanvas}
          canUndo={strokes.length > 0}
          canRedo={redoStack.length > 0}
        />
      </div>

      {/* Right Panel - Hidden on Mobile */}
      <div className="hidden md:block">
        <ResizableRightPanel
          showParticipants={showParticipantsTab}
          onToggleParticipants={() => setShowParticipantsTab(!showParticipantsTab)}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
        />
      </div>

      {/* Main Canvas Area - Mobile Responsive */}
      <main 
        className="fixed top-16 bg-white dark:bg-slate-900"
        style={{
          left: isMobile ? '0px' : 'var(--left-sidebar-width, 72px)',
          right: isMobile ? '0px' : (isRightPanelCollapsed ? '0px' : 'var(--right-panel-width, 320px)'),
          bottom: isMobile ? '64px' : '0px', // Space for mobile toolbar
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
        
        {/* Zoom Controls - Floating Modern Design */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 glass rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 px-2 py-2 z-20 backdrop-blur-xl">
          <button
            onClick={() => {
              const newZoom = Math.max(0.1, zoom - 0.1);
              setZoom(newZoom);
            }}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 text-slate-700 dark:text-slate-300"
            title="Zoom Out (Ctrl + -)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <div className="px-3 py-1 min-w-[70px] text-center">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          
          <button
            onClick={() => {
              const newZoom = Math.min(3, zoom + 0.1);
              setZoom(newZoom);
            }}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 text-slate-700 dark:text-slate-300"
            title="Zoom In (Ctrl + +)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
          
          <button
            onClick={() => setZoom(1)}
            className="px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 text-slate-700 dark:text-slate-300"
            title="Reset Zoom (Ctrl + 0)"
          >
            Reset
          </button>
        </div>
      </main>

      {/* Mobile Toolbar */}
      <MobileToolbar
        onUndo={handleUndoAction}
        onRedo={handleRedoAction}
        onClear={handleClearCanvas}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomSlug={roomSlug}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
