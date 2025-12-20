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
    if (!isSupabaseConfigured || !roomId || !userId) {
      console.log('Realtime disabled: Supabase not configured or missing room/user info');
      return;
    }

    // Create realtime manager
    const manager = new RealtimeManager(roomId, userId, userName, userColor);
    managerRef.current = manager;

    // Connect with callbacks
    manager.connect(callbacks);

    console.log('✅ Connected to realtime channel:', roomId);

    // Cleanup on unmount
    return () => {
      manager.disconnect();
      managerRef.current = null;
      console.log('❌ Disconnected from realtime channel');
    };
  }, [roomId, userId, userName, userColor]);

  return managerRef;
}
