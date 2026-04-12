const supabase = require('./config/supabase');

async function testConnection() {
  console.log('Testing Supabase Connection...');
  
  const { data, error } = await supabase.from('users').select('id').limit(1);
  
  if (error) {
    console.error('❌ Supabase Error:', error.message);
  } else {
    console.log('✅ Supabase connected successfully!');
    console.log('✅ The "users" table exists in your database.');
  }

  process.exit(0);
}

testConnection();
