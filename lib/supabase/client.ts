import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Debug logging (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Config Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl.length,
    keyLength: supabaseAnonKey.length,
    isConfigured: isSupabaseConfigured,
  });
}

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase credentials not found. Real-time features will be disabled.');
  console.warn('Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
  console.warn('Make sure to restart the dev server after adding environment variables!');
}

// Create a dummy client if not configured to prevent errors
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
