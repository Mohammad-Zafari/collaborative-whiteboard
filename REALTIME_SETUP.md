# Real-time Collaboration Setup Guide

## Current Status

✅ **Step 2 Complete**: Single-user canvas with drawing tools  
✅ **Step 3 Complete**: Real-time collaboration code implemented

🔧 **Action Required**: Configure Supabase to enable real-time features

---

## What Works Now (Without Supabase)

- ✅ Drawing with pen and eraser
- ✅ Color picker and stroke width
- ✅ Undo/Redo/Clear
- ✅ Keyboard shortcuts
- ✅ Room-based URLs
- ✅ Local state management

## What You'll Get With Supabase

- 🔄 **Real-time collaboration**: Multiple users drawing simultaneously
- 💾 **Persistence**: Strokes saved to database
- 📜 **History**: Load previous drawings when rejoining a room
- 👥 **Presence**: See who's online
- 🖱️ **Cursor sharing**: See other users' cursors (Step 4)

---

## Setup Instructions

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub (or email)
3. Verify your email if needed

### Step 2: Create a New Project

1. Click "New Project"
2. Fill in:
   - **Organization**: Create new or select existing
   - **Name**: `collaborative-whiteboard`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free (perfect for portfolio)
3. Click "Create new project"
4. Wait 2-3 minutes for setup to complete

### Step 3: Run Database Schema

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "+ New query"
3. Open the file: `supabase/schema.sql` in your project
4. Copy ALL the contents
5. Paste into the SQL editor
6. Click "Run" (or press Ctrl+Enter)
7. You should see: "Success. No rows returned"

This creates:
- `rooms` table
- `strokes` table  
- `room_participants` table
- Indexes and triggers
- Row Level Security policies

### Step 4: Get API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Find these two values:

   **Project URL**  
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key**  
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

### Step 5: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Save the file

### Step 6: Restart Dev Server

1. Stop the dev server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```
3. You should see: "✅ Connected to realtime channel"

---

## Verify It's Working

### Test 1: Check Connection

1. Open http://localhost:3001
2. Create a new room
3. Look for "Real-time enabled" badge in the header (green dot)
4. Open browser console (F12)
5. You should see: `✅ Connected to realtime channel: room:xxxxx`

### Test 2: Verify Database

1. Draw something on the canvas
2. Go to Supabase dashboard → **Table Editor**
3. Select `rooms` table → You should see your room
4. Select `strokes` table → You should see your strokes

### Test 3: Real-time Collaboration

1. Open the same room in two browser windows/tabs
2. Draw in one window
3. **It should appear in the other window instantly!** 🎉

---

## Troubleshooting

### "supabaseUrl is required" Error

**Problem**: Environment variables not loaded  
**Solution**:
1. Make sure `.env.local` file exists in project root
2. Check that values don't have quotes or extra spaces
3. Restart dev server completely

### "Failed to connect to realtime channel"

**Problem**: Invalid credentials or network issue  
**Solution**:
1. Verify credentials in Supabase dashboard → Settings → API
2. Make sure you copied the entire key (it's very long)
3. Check browser console for detailed error messages

### Strokes Not Saving

**Problem**: RLS policies or database schema issue  
**Solution**:
1. Re-run the `schema.sql` script completely
2. Check Supabase logs: Dashboard → Logs → Postgres Logs
3. Verify tables exist: Table Editor → should see rooms, strokes, room_participants

### Real-time Not Working

**Problem**: Realtime not enabled or subscription issue  
**Solution**:
1. Check Supabase: Settings → API → Realtime (should be ON)
2. Make sure both windows are in the SAME room (check URL)
3. Open browser console to see connection status

---

## Free Tier Limits

Supabase Free tier includes:
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ 200 concurrent realtime connections
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users

**More than enough for a portfolio project!**

---

## Testing Checklist

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Environment variables configured
- [ ] Dev server restarted
- [ ] "Real-time enabled" badge shows in header
- [ ] Drawing saves to database (check Table Editor)
- [ ] Two windows show same drawings in real-time
- [ ] Room persists after refresh (strokes reload)

---

## What's Next?

Once real-time is working:

**Step 4** (Coming): Cursor sharing + UX polish
- See other users' cursors with names
- Participant list sidebar
- Better visual feedback

**Step 5** (Coming): Portfolio integration
- Add to your portfolio projects page
- Export canvas as PNG
- Professional project description

---

## Need Help?

1. Check browser console (F12) for error messages
2. Check Supabase logs: Dashboard → Logs
3. Review `supabase/SETUP_INSTRUCTIONS.md` for detailed steps
4. Make sure all tables were created (Table Editor)

## Current Mode

Without Supabase configured, the app works in **Local Mode**:
- ✅ All drawing features work
- ❌ No real-time collaboration
- ❌ No persistence (lost on refresh)
- ❌ No multi-user support

**Configure Supabase to unlock full features!**
