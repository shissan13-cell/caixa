import { createClient } from '@supabase/supabase-js';

// Suas credenciais fornecidas
const supabaseUrl = 'https://onqfiykzrxxkyzjdhnwj.supabase.co';
const supabaseAnonKey = 'sb_publishable_mjQDn8ZqiyXkmPw4-blv6g_BWwvyT0i';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);