require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('logs').select('*').limit(3);
  if (!error) {
    console.log('LOGS TABLE ROWS:');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log('LOGS ERROR:', error.message);
  }
}

check();
