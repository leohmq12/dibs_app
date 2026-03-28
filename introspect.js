require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function check() {
  const tables = ['logs', 'profiles', 'stats', 'user_stats', 'vault', 'media'];
  
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (!error) {
      console.log(`Table '${t}' exists. Rows:`, data);
    } else {
      console.log(`Table '${t}' error:`, error.message);
    }
  }
}

check();
