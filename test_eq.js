const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('http://localhost:54321', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
try {
  supabase.from('messages').select('*').eq('conversation_id', undefined);
  console.log("Did not throw");
} catch(e) {
  console.log("Threw error: " + e.message);
}
