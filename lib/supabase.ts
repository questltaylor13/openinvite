import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knunlvzmxjrdsolekzrz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudW5sdnpteGpyZHNvbGVrenJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjE0NTYsImV4cCI6MjA4MjI5NzQ1Nn0.hlUdSHFtf-yko-ryjuDoftj1MRqKC8kQypY1hc3STDc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
