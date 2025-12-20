import { useEffect, useState } from 'react';
import { getOrCreateRoom, loadRoomStrokes } from '@/lib/supabase/api';
import { Stroke } from '@/types/whiteboard';

export function useRoom(slug: string) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initRoom() {
      try {
        setIsLoading(true);
        const room = await getOrCreateRoom(slug);
        
        if (room) {
          setRoomId(room.id);
        } else {
          // Supabase not configured, use slug as room ID
          setRoomId(slug);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error initializing room:', err);
        setError('Failed to initialize room');
        // Fallback to using slug as room ID
        setRoomId(slug);
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      initRoom();
    }
  }, [slug]);

  return { roomId, isLoading, error };
}

export function useRoomStrokes(roomId: string | null) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStrokes() {
      if (!roomId) return;

      try {
        setIsLoading(true);
        const loadedStrokes = await loadRoomStrokes(roomId);
        setStrokes(loadedStrokes);
      } catch (err) {
        console.error('Error loading strokes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStrokes();
  }, [roomId]);

  return { strokes, isLoading };
}
