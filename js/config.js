// Supabase Configuration
// TODO: Replace these with your actual Supabase credentials
// Find these in: Supabase Dashboard → Project Settings → API

const SUPABASE_CONFIG = {
    url: 'https://qmwngkhnmpnptexvinwl.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtd25na2hubXBucHRleHZpbndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1MTUwNzcsImV4cCI6MjA1NTA5MTA3N30.RIn8Q7n-p8-d4y8F83ocaMUUlG_GsXnwB8UQoXc88h0'
};

// Initialize Supabase client (will be initialized in app.js)
let supabaseClient = null;

/**
 * Initialize Supabase client
 */
const initSupabase = () => {
    if (typeof supabase === 'undefined') {
        console.error('Supabase library not loaded. Make sure to include the CDN script in index.html');
        return null;
    }

    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey ||
        SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL' ||
        SUPABASE_CONFIG.anonKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('⚠️ Supabase credentials not configured. Running in local-only mode.');
        return null;
    }

    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✓ Supabase client initialized');
    return supabaseClient;
};

/**
 * Get Supabase client instance
 */
const getSupabaseClient = () => {
    return supabaseClient;
};

/**
 * Check if Supabase is configured
 */
const isSupabaseConfigured = () => {
    return supabaseClient !== null;
};
