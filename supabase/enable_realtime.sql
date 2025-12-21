-- Enable Realtime for strokes table
-- Run this in Supabase SQL Editor if strokes aren't syncing in real-time

-- Add strokes table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE strokes;

-- Verify it was added
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('strokes', 'rooms', 'room_participants');

-- Expected output should show:
-- strokes
-- rooms (if you want realtime for rooms too)
-- room_participants (if you want realtime for participants)
