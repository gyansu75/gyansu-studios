import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase Project credentials
const SUPABASE_URL = 'https://lettkawprdrhntdbanpw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxldHRrYXdwcmRyaG50ZGJhbnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4ODg5MDAsImV4cCI6MjEwMjQ2NDkwMH0.TTq5iiC6URrWuiSilorZxBS1pdwv92ejCSCViE0IRLs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});