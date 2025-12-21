'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Canvas from '@/components/whiteboard/Canvas';
import Toolbar from '@/components/whiteboard/Toolbar';
import RemoteCursors from '@/components/whiteboard/RemoteCursors';
import ParticipantsList from '@/components/whiteboard/ParticipantsList';
import ExportMenu from '@/components/whiteboard/ExportMenu';
import ShareModal from '@/components/whiteboard/ShareModal';
import ThemeToggle from '@/components/theme-toggle';
import { useWhiteboardStore } from '@/store/whiteboard';
import { generateUserId, generateUserName, generateUserColor, throttle } from '@/lib/canvas/utils';
import { useRoom, useRoomStrokes } from '@/hooks/useRoom';
import { useRealtime } from '@/hooks/useRealtime';
import { saveStroke, clearRoomStrokes } from '@/lib/supabase/api';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Stroke, CursorPosition } from '@/types/whiteboard';

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
    loadStrokes,
    clear,
    updateCursor,
    removeCursor,
  } = useWhiteboardStore();

  const [userColor, setUserColor] = useState('#FF6B6B');
  const [isReady, setIsReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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
      console.log(`📚 Loaded ${historicalStrokes.length} historical strokes`);
    }
  }, [historicalStrokes, strokesLoading, loadStrokes]);

  // Real-time callbacks
  const handleStrokeAdded = useCallback((stroke: Stroke) => {
    console.log('📨 Received remote stroke:', stroke.id);
    addStroke(stroke);
  }, [addStroke]);

  const handleCursorMove = useCallback((cursor: CursorPosition) => {
    updateCursor(cursor.userId, cursor);
  }, [updateCursor]);

  const handleUserJoined = useCallback((userId: string, userName: string, color: string) => {
    console.log(`👋 ${userName} joined the room`);
  }, []);

  const handleUserLeft = useCallback((userId: string) => {
    console.log(`👋 User ${userId} left the room`);
    removeCursor(userId);
  }, [removeCursor]);

  const handleClear = useCallback(() => {
    console.log('🗑️ Received remote clear event');
    clear();
  }, [clear]);

  // Connect to realtime
  realtimeManagerRef.current = useRealtime(
    roomId || '',
    userId,
    userName,
    userColor,
    {
      onStrokeAdded: handleStrokeAdded,
      onCursorMove: handleCursorMove,
      onUserJoined: handleUserJoined,
      onUserLeft: handleUserLeft,
      onClear: handleClear,
    }
  );

  // Handle stroke completion (save to DB)
  const handleStrokeComplete = useCallback(async (stroke: Stroke) => {
    if (!roomId || !isSupabaseConfigured) return;
    
    const success = await saveStroke(roomId, stroke);
    if (success) {
      console.log('✅ Stroke saved to database:', stroke.id);
    } else {
      console.error('❌ Failed to save stroke');
    }
  }, [roomId]);

  // Handle cursor movement (throttled)
  const handleCursorMove2 = useCallback(
    throttle((x: number, y: number) => {
      if (realtimeManagerRef.current?.current) {
        realtimeManagerRef.current.current.sendCursor(x, y);
      }
    }, 50), // 20fps for cursor updates
    []
  );

  // Handle clear canvas
  const handleClearCanvas = useCallback(async () => {
    if (!roomId || !isSupabaseConfigured) return;

    // Clear from database
    await clearRoomStrokes(roomId);
    
    // Broadcast clear event
    if (realtimeManagerRef.current?.current) {
      realtimeManagerRef.current.current.sendClear();
    }
    
    console.log('🗑️ Canvas cleared and broadcasted');
  }, [roomId]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useWhiteboardStore.getState().redo();
        } else {
          useWhiteboardStore.getState().undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useWhiteboardStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isReady || roomLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Collaborative Whiteboard
          </h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Room: {roomSlug}
          </span>
          {isSupabaseConfigured && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Real-time enabled
            </span>
          )}
          {!isSupabaseConfigured && (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">
              Local mode (configure Supabase for real-time)
            </span>
          )}
        </div>
        
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <ExportMenu canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>} roomSlug={roomSlug} />
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute top-20 left-0 right-0 z-10">
        <Toolbar onClear={handleClearCanvas} />
      </div>

      {/* Participants List */}
      <ParticipantsList />

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roomSlug={roomSlug}
      />

      {/* Canvas */}
      <div className="absolute inset-0 top-16">
        <Canvas 
          onStrokeComplete={handleStrokeComplete}
          onCursorMove={handleCursorMove2}
          onCanvasReady={(ref) => {
            canvasRef.current = ref.current;
          }}
        />
        {/* Remote cursors overlay */}
        <RemoteCursors />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs z-10">
        <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white">
          Keyboard Shortcuts
        </h3>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Z</kbd> Undo</li>
          <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Y</kbd> Redo</li>
          <li><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Shift+Z</kbd> Redo</li>
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {userName} • {userColor}
          </p>
        </div>
      </div>
    </div>
  );
}
