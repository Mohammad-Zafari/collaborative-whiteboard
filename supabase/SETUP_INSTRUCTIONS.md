# Supabase Setup Instructions

Follow these steps to set up Supabase for real-time collaboration.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `collaborative-whiteboard` (or any name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be created

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

This creates:
- `rooms` table (whiteboard sessions)
- `strokes` table (drawing data)
- `room_participants` table (active users)
- Indexes for performance
- Row Level Security policies
- Helper functions

## Step 3: Get Your API Credentials

1. In Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Open the file `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key
```

3. Save the file

## Step 5: Restart Your Dev Server

1. Stop the dev server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. The app will now connect to Supabase!

## Step 6: Verify Setup

1. Open http://localhost:3001
2. Create a new room
3. Draw something
4. Go to Supabase dashboard → **Table Editor**
5. Check the `rooms` and `strokes` tables
6. You should see your data!

## Step 7: Test Real-time Collaboration

1. Open the same room in two browser windows/tabs
2. Draw in one window
3. You should see it appear in the other window in real-time!

## Troubleshooting

### "Failed to connect to Supabase"
- Check that your `.env.local` file has the correct credentials
- Make sure you restarted the dev server after adding credentials
- Verify the URL doesn't have trailing slashes

### "Permission denied" errors
- Make sure you ran the `schema.sql` script completely
- Check that RLS policies were created (they allow public access for now)

### Real-time not working
- Check browser console for errors
- Verify Realtime is enabled in Supabase: Settings → API → Realtime (should be ON)
- Make sure you're using the same room slug in both windows

## Security Note

The current setup allows **public access** to all rooms (no authentication required). This is fine for a portfolio demo, but for production, you should:

1. Enable Supabase Auth
2. Restrict RLS policies to authenticated users
3. Add room ownership/permissions

## Next Steps

Once Supabase is set up, you can:
- Share room links with others
- See real-time collaboration in action
- View all strokes in the Supabase dashboard
- Export data if needed

## Free Tier Limits

Supabase free tier includes:
- 500MB database storage
- 2GB bandwidth per month
- 200 concurrent realtime connections
- Unlimited API requests

This is more than enough for a portfolio project!
