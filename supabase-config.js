// Shared Supabase initialization for all pages.
// Replace the placeholder URL and anon key with your Supabase project values
// or set window.SUPABASE_URL / window.SUPABASE_ANON_KEY before loading this file.
(function initSupabaseClient() {
    const supabaseUrl = 'https://lkzistenanfvaydqaifm.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxremlzdGVuYW5mdmF5ZHFhaWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzA5NTIsImV4cCI6MjA3ODk0Njk1Mn0.EVyGI11LKlsm5OABrZq3M6PeNpnS_FmydB-HNUL3qQo'
    if (!window.supabase) {
      console.error('Supabase JS library not loaded. Include it before supabase-config.js');
      return;
    }
  
    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      supabaseAnonKey.includes('YOUR_ACTUAL_KEY_HERE')
    ) {
      console.warn('Supabase credentials are not configured. Update supabase-config.js with your project details.');
      return;
    }
  
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client initialized successfully');
  })();
