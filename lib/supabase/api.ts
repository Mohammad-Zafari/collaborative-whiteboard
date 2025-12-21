import { supabase, isSupabaseConfigured } from './client';
import { Stroke } from '@/types/whiteboard';

export interface Room {
  id: string;
  slug: string;
  name: string;
  created_at: string;
  last_activity: string;
}

/**
 * Get or create a room by slug
 */
export async function getOrCreateRoom(slug: string): Promise<Room | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured. Room will work locally only.');
    return null;
  }

  try {
    console.log('🔍 Looking up room with slug:', slug);
    
    // First, try to get existing room
    const { data: existingRoom, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .eq('slug', slug)
      .single();

    if (existingRoom) {
      console.log('✅ Found existing room:', existingRoom.id);
      return existingRoom as Room;
    }

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine, we'll create it
      console.error('❌ Error fetching room:', fetchError);
    }

    // If room doesn't exist, create it
    console.log('📝 Creating new room with slug:', slug);
    const { data: newRoom, error: createError } = await supabase
      .from('rooms')
      .insert({
        slug,
        name: `Room ${slug}`,
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating room:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      return null;
    }

    console.log('✅ Created new room:', newRoom.id);
    return newRoom as Room;
  } catch (error) {
    console.error('❌ Error in getOrCreateRoom:', error);
    return null;
  }
}

/**
 * Load historical strokes for a room
 */
export async function loadRoomStrokes(roomId: string): Promise<Stroke[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Cannot load strokes: Supabase not configured');
    return [];
  }

  try {
    console.log('📥 Loading strokes for room:', roomId);
    const { data, error } = await supabase
      .from('strokes')
      .select('*')
      .eq('room_id', roomId)
      .order('sequence_number', { ascending: true });

    if (error) {
      console.error('❌ Error loading strokes:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }

    const strokes = (data || []).map((dbStroke: any) => ({
      id: dbStroke.stroke_id,
      tool: dbStroke.tool,
      points: dbStroke.points,
      color: dbStroke.color,
      width: dbStroke.width,
      userId: dbStroke.user_id,
      userName: dbStroke.user_name,
      timestamp: new Date(dbStroke.created_at).getTime(),
    }));

    console.log(`✅ Loaded ${strokes.length} strokes from database`);
    return strokes;
  } catch (error) {
    console.error('❌ Error in loadRoomStrokes:', error);
    return [];
  }
}

/**
 * Save a stroke to the database
 */
export async function saveStroke(roomId: string, stroke: Stroke): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Cannot save stroke: Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase.from('strokes').insert({
      room_id: roomId,
      stroke_id: stroke.id,
      user_id: stroke.userId,
      user_name: stroke.userName,
      tool: stroke.tool,
      color: stroke.color,
      width: stroke.width,
      points: stroke.points,
    });

    if (error) {
      console.error('❌ Error saving stroke:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Room ID:', roomId);
      console.error('Stroke ID:', stroke.id);
      return false;
    }

    console.log('✅ Stroke saved:', stroke.id);
    return true;
  } catch (error) {
    console.error('❌ Error in saveStroke:', error);
    return false;
  }
}

/**
 * Clear all strokes from a room
 */
export async function clearRoomStrokes(roomId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('strokes')
      .delete()
      .eq('room_id', roomId);

    if (error) {
      console.error('Error clearing strokes:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in clearRoomStrokes:', error);
    return false;
  }
}

/**
 * Update participant's last seen timestamp
 */
export async function updateParticipantPresence(
  roomId: string,
  userId: string,
  userName: string,
  userColor: string
): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { error } = await supabase.from('room_participants').upsert(
      {
        room_id: roomId,
        user_id: userId,
        user_name: userName,
        user_color: userColor,
        last_seen: new Date().toISOString(),
      },
      {
        onConflict: 'room_id,user_id',
      }
    );

    if (error) {
      console.error('Error updating participant:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateParticipantPresence:', error);
    return false;
  }
}

/**
 * Get active participants in a room
 */
export async function getRoomParticipants(roomId: string) {
  if (!isSupabaseConfigured) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 minutes

    if (error) {
      console.error('Error getting participants:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRoomParticipants:', error);
    return [];
  }
}
