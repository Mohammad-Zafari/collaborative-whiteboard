-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table (whiteboard sessions)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_last_activity ON rooms(last_activity DESC);

-- Strokes table (drawing events - event sourcing)
CREATE TABLE IF NOT EXISTS strokes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  stroke_id TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  tool TEXT NOT NULL,
  color TEXT NOT NULL,
  width INTEGER NOT NULL,
  points JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sequence_number BIGSERIAL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_strokes_room_sequence ON strokes(room_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_strokes_room_created ON strokes(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_strokes_stroke_id ON strokes(stroke_id);

-- Room participants table (active users)
CREATE TABLE IF NOT EXISTS room_participants (
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_color TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Create index for faster participant lookups
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_last_seen ON room_participants(last_seen DESC);

-- Function to update last_activity on rooms
CREATE OR REPLACE FUNCTION update_room_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms 
  SET last_activity = NOW() 
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update room activity when strokes are added
DROP TRIGGER IF EXISTS trigger_update_room_activity ON strokes;
CREATE TRIGGER trigger_update_room_activity
  AFTER INSERT ON strokes
  FOR EACH ROW
  EXECUTE FUNCTION update_room_last_activity();

-- Function to clean up old inactive participants (optional)
CREATE OR REPLACE FUNCTION cleanup_inactive_participants()
RETURNS void AS $$
BEGIN
  DELETE FROM room_participants
  WHERE last_seen < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for now (public whiteboard)
-- You can make these more restrictive later

-- Rooms policies
CREATE POLICY "Allow public read access to rooms"
  ON rooms FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to rooms"
  ON rooms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to rooms"
  ON rooms FOR UPDATE
  USING (true);

-- Strokes policies
CREATE POLICY "Allow public read access to strokes"
  ON strokes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to strokes"
  ON strokes FOR INSERT
  WITH CHECK (true);

-- Participants policies
CREATE POLICY "Allow public read access to participants"
  ON room_participants FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to participants"
  ON room_participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to participants"
  ON room_participants FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete to participants"
  ON room_participants FOR DELETE
  USING (true);

-- Create a function to get or create a room by slug
CREATE OR REPLACE FUNCTION get_or_create_room(room_slug TEXT, room_name TEXT DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  room_uuid UUID;
  final_room_name TEXT;
BEGIN
  -- Try to get existing room
  SELECT id INTO room_uuid FROM rooms WHERE slug = room_slug;
  
  -- If room doesn't exist, create it
  IF room_uuid IS NULL THEN
    final_room_name := COALESCE(room_name, 'Room ' || room_slug);
    INSERT INTO rooms (slug, name)
    VALUES (room_slug, final_room_name)
    RETURNING id INTO room_uuid;
  END IF;
  
  RETURN room_uuid;
END;
$$ LANGUAGE plpgsql;
