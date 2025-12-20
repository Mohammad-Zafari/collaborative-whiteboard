import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './client';
import { Stroke, CursorPosition } from '@/types/whiteboard';

export interface RealtimeCallbacks {
  onStrokeAdded?: (stroke: Stroke) => void;
  onCursorMove?: (cursor: CursorPosition) => void;
  onUserJoined?: (userId: string, userName: string, color: string) => void;
  onUserLeft?: (userId: string) => void;
  onClear?: () => void;
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
    // Create a channel for this room
    this.channel = supabase.channel(`room:${this.roomId}`, {
      config: {
        broadcast: { self: false }, // Don't receive own broadcasts
        presence: { key: this.userId },
      },
    });

    // Subscribe to stroke inserts from database
    this.channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'strokes',
        filter: `room_id=eq.${this.roomId}`,
      },
      (payload) => {
        if (payload.new && callbacks.onStrokeAdded) {
          const dbStroke = payload.new as any;
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
          callbacks.onStrokeAdded(stroke);
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
      if (status === 'SUBSCRIBED') {
        // Track this user's presence
        await this.channel?.track({
          userId: this.userId,
          userName: this.userName,
          color: this.userColor,
          online_at: new Date().toISOString(),
        });
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

  public disconnect() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
