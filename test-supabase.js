// Quick test script to verify Supabase connection
// Run with: node test-supabase.js

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('\n🔍 Testing Supabase Configuration:\n');
console.log('Reading from:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  console.log('\nFile content:');
  console.log(content);
  
  // Parse manually
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const env = {};
  
  lines.forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
      console.log(`\nFound: ${key} = ${value.substring(0, 30)}...`);
    }
  });
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('\n📊 Results:');
  console.log('URL:', supabaseUrl ? `✅ ${supabaseUrl.substring(0, 40)}...` : '❌ NOT FOUND');
  console.log('Key:', supabaseAnonKey ? `✅ ${supabaseAnonKey.substring(0, 30)}...` : '❌ NOT FOUND');
  console.log('Configured:', !!(supabaseUrl && supabaseAnonKey) ? '✅ YES' : '❌ NO');
  
  if (supabaseUrl && supabaseAnonKey) {
    console.log('\n✅ Environment variables are set correctly!');
    console.log('⚠️  Make sure you have:');
    console.log('   1. Restarted the dev server (npm run dev)');
    console.log('   2. Run the database schema in Supabase SQL Editor');
    console.log('   3. Check browser console for connection errors\n');
  } else {
    console.log('\n❌ Environment variables are missing!');
    console.log('   Check your .env.local file\n');
  }
} else {
  console.log('\n❌ .env.local file not found!\n');
}
