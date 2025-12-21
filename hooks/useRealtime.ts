import { useEffect, useRef } from 'react';
import { RealtimeManager, RealtimeCallbacks } from '@/lib/supabase/realtime';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function useRealtime(
  roomId: string,
  userId: string,
  userName: string,
  userColor: string,
  callbacks: RealtimeCallbacks
) {
  const managerRef = useRef<RealtimeManager | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.log('⚠️ Realtime disabled: Supabase not configured');
      return;
    }

    if (!roomId) {
      console.log('⚠️ Realtime disabled: roomId is missing');
      return;
    }

    if (!userId) {
      console.log('⚠️ Realtime disabled: userId is missing');
      return;
    }

    console.log('🚀 Initializing realtime connection:', { roomId, userId, userName });

    // Create realtime manager
    const manager = new RealtimeManager(roomId, userId, userName, userColor);
    managerRef.current = manager;

    // Connect with callbacks
    const channel = manager.connect(callbacks);

    if (channel) {
      console.log('✅ Connected to realtime channel:', roomId);
    } else {
      console.error('❌ Failed to connect to realtime channel');
    }

    // Cleanup on unmount
    return () => {
      manager.disconnect();
      managerRef.current = null;
      console.log('❌ Disconnected from realtime channel');
    };
  }, [roomId, userId, userName, userColor]);

  return managerRef;
}
