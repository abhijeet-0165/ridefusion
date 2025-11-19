import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lkzistenanfvaydqaifm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxremlzdGVuYW5mdmF5ZHFhaWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzA5NTIsImV4cCI6MjA3ODk0Njk1Mn0.EVyGI11LKlsm5OABrZq3M6PeNpnS_FmydB-HNUL3qQo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

