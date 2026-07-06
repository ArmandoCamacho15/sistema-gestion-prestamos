require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCashflow() {
  const { data, error } = await supabase.from('v_monthly_cashflow').select('*');
  console.log('Cashflow:', data);
  
  const { data: payments } = await supabase.from('payments').select('id, amount, payment_date').gte('payment_date', '2026-05-01').lte('payment_date', '2026-05-31');
  console.log('Pagos en Mayo:', payments);
}
checkCashflow();
