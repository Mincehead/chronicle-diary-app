// Supabase Configuration
// TODO: Replace these with your actual Supabase credentials
// Find these in: Supabase Dashboard → Project Settings → API

const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL', // e.g., https://xxxxxxxxxxxxx.supabase.co
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Your public/anonymous key
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
