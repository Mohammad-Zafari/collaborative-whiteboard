import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './client';
import { Stroke, CursorPosition } from '@/types/whiteboard';

export interface RealtimeCallbacks {
  onStrokeAdded?: (stroke: Stroke) => void;
  onCursorMove?: (cursor: CursorPosition) => void;
  onUserJoined?: (userId: string, userName: string, color: string) => void;
  onUserLeft?: (userId: string) => void;
  onClear?: () => void;
  onUndo?: (strokeId: string) => void;
  onRedo?: (strokeId: string) => void;
}

export class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private roomId: string;
  private userId: string;
  private userName: string;
  private userColor: string;

  constructor(roomId: string, userId: string, userName: string, userColor: string) {
    this.roomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.userColor = userColor;
  }

  public connect(callbacks: RealtimeCallbacks) {
    if (!this.roomId) {
      console.warn('⚠️ Cannot connect to realtime: roomId is missing');
      return null;
    }

    console.log('🔌 Connecting to realtime channel for room:', this.roomId);
    
    // Create a channel for this room
    this.channel = supabase.channel(`room:${this.roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own broadcasts
        presence: { key: this.userId },
      },
    });

    // Subscribe to stroke inserts from database
    console.log('🔔 Setting up postgres_changes subscription for room_id:', this.roomId);
    console.log('🔔 Room ID type check:', {
      isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.roomId),
      length: this.roomId.length,
    });
    
    // Supabase postgres_changes filter format for UUID
    // Format: column=eq.value (no quotes needed for UUIDs in Supabase)
    const filter = `room_id=eq.${this.roomId}`;
    console.log('🔔 Using filter:', filter);
    
    this.channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'strokes',
        filter: filter,
      },
      (payload) => {
        console.log('📨 Received postgres_changes event:', {
          eventType: payload.eventType,
          new: payload.new,
          old: payload.old,
          roomId: payload.new?.room_id,
          strokeId: payload.new?.stroke_id,
          userId: payload.new?.user_id,
        });
        
        if (payload.new && callbacks.onStrokeAdded) {
          const dbStroke = payload.new as any;
          
          // Debug: Log all stroke data
          console.log('🔍 Stroke data:', {
            room_id: dbStroke.room_id,
            expected_room_id: this.roomId,
            user_id: dbStroke.user_id,
            current_user_id: this.userId,
            stroke_id: dbStroke.stroke_id,
          });
          
          // Skip if this is our own stroke (already rendered locally)
          if (dbStroke.user_id === this.userId) {
            console.log('⏭️ Skipping own stroke (already rendered locally):', dbStroke.stroke_id);
            return;
          }
          
          // Verify room_id matches
          if (dbStroke.room_id !== this.roomId) {
            console.warn('⚠️ Room ID mismatch! Expected:', this.roomId, 'Got:', dbStroke.room_id);
            return;
          }
          
          const stroke: Stroke = {
            id: dbStroke.stroke_id,
            tool: dbStroke.tool,
            points: dbStroke.points,
            color: dbStroke.color,
            width: dbStroke.width,
            userId: dbStroke.user_id,
            userName: dbStroke.user_name,
            timestamp: new Date(dbStroke.created_at).getTime(),
          };
          console.log('✅ Processing remote stroke:', stroke.id, 'from user:', stroke.userName);
          callbacks.onStrokeAdded(stroke);
        } else {
          console.warn('⚠️ Missing payload.new or callback:', { 
            hasNew: !!payload.new, 
            hasCallback: !!callbacks.onStrokeAdded 
          });
        }
      }
    );

    // Subscribe to cursor movements (broadcast)
    this.channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
      if (callbacks.onCursorMove && payload.userId !== this.userId) {
        callbacks.onCursorMove(payload as CursorPosition);
      }
    });

    // Subscribe to clear events (broadcast)
    this.channel.on('broadcast', { event: 'clear' }, ({ payload }) => {
      if (callbacks.onClear && payload.userId !== this.userId) {
        callbacks.onClear();
      }
    });

    // Subscribe to undo events (broadcast)
    this.channel.on('broadcast', { event: 'undo' }, ({ payload }) => {
      if (callbacks.onUndo && payload.userId !== this.userId) {
        console.log('↩️ Received remote undo for stroke:', payload.strokeId);
        callbacks.onUndo(payload.strokeId);
      }
    });

    // Subscribe to redo events (broadcast)
    this.channel.on('broadcast', { event: 'redo' }, ({ payload }) => {
      if (callbacks.onRedo && payload.userId !== this.userId) {
        console.log('↪️ Received remote redo for stroke:', payload.strokeId);
        callbacks.onRedo(payload.strokeId);
      }
    });

    // Track presence (who's online)
    this.channel.on('presence', { event: 'sync' }, () => {
      const state = this.channel?.presenceState();
      if (!state) return;

      // Get all users currently present
      const users = Object.keys(state).map((key) => {
        const user = state[key][0] as any;
        return {
          userId: user.userId,
          userName: user.userName,
          color: user.color,
        };
      });

      // You can handle this in the callback if needed
      console.log('Users online:', users);
    });

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const user = newPresences[0] as any;
      if (callbacks.onUserJoined && user.userId !== this.userId) {
        callbacks.onUserJoined(user.userId, user.userName, user.color);
      }
    });

    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      const user = leftPresences[0] as any;
      if (callbacks.onUserLeft && user.userId !== this.userId) {
        callbacks.onUserLeft(user.userId);
      }
    });

    // Subscribe and track presence
    this.channel.subscribe(async (status) => {
      console.log('📡 Realtime subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to realtime channel');
        // Track this user's presence
        await this.channel?.track({
          userId: this.userId,
          userName: this.userName,
          color: this.userColor,
          online_at: new Date().toISOString(),
        });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Realtime channel error');
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Realtime connection timed out');
      } else if (status === 'CLOSED') {
        console.warn('⚠️ Realtime channel closed');
      }
    });

    return this.channel;
  }

  public sendCursor(x: number, y: number) {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: {
        x,
        y,
        userId: this.userId,
        userName: this.userName,
        color: this.userColor,
      },
    });
  }

  public sendClear() {
    if (!this.channel) return;

    this.channel.send({
      type: 'broadcast',
      event: 'clear',
      payload: {
        userId: this.userId,
      },
    });
  }

  public sendUndo(strokeId: string) {
    if (!this.channel) return;

    console.log('📤 Broadcasting undo for stroke:', strokeId);
    this.channel.send({
      type: 'broadcast',
      event: 'undo',
      payload: {
        userId: this.userId,
        strokeId: strokeId,
      },
    });
  }

  public sendRedo(strokeId: string) {
    if (!this.channel) return;

    console.log('📤 Broadcasting redo for stroke:', strokeId);
    this.channel.send({
      type: 'broadcast',
      event: 'redo',
      payload: {
        userId: this.userId,
        strokeId: strokeId,
      },
    });
  }

  public disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
