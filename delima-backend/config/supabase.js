const path = require('path');
require('dotenv').config();
require('dotenv').config({
  path: path.resolve(__dirname, '../../delima-project-website/.env.local'),
  override: false,
});
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase client is not configured for backend operations.');
  console.warn('Set SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in delima-backend/.env');
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('✓ Supabase client initialized for backend services');

  if (!supabaseServiceRoleKey) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Write operations may fail due to RLS policies.');
  }
}

module.exports = {
  supabase,
  isConfigured: Boolean(supabase),
  hasServiceRoleKey: Boolean(supabaseServiceRoleKey),
};
