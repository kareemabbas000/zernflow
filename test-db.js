const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://yeqaqngjsqtfszwttgbm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllcWFxbmdqc3F0ZnN6d3R0Z2JtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzc1ODA3NCwiZXhwIjoyMTAzMzM0MDc0fQ.5pJ1HDgUvzw91Ez7K_ALvKbt8M_tZOYTDJk1KJYECL0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePassword() {
  const { data, error } = await supabase.auth.admin.updateUserById('ac4e10f5-5395-4e58-b3f0-99dbbd2609c4', {
    password: 'Password123!'
  });
  console.log(error ? error : "Password updated");
}
updatePassword();
