/**
 * Authentication Module
 * Handles user authentication with Supabase
 */

const Auth = (() => {
    let currentUser = null;

    /**
     * Initialize authentication
     */
    const init = async () => {
        const client = getSupabaseClient();
        if (!client) {
            console.log('Running in local mode without authentication');
            return null;
        }

        // Check for existing session
        const { data: { session } } = await client.auth.getSession();

        if (session) {
            currentUser = session.user;
            console.log('✓ User authenticated:', currentUser.email);
        }

        // Listen for auth state changes
        client.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                currentUser = session.user;
                console.log('User signed in:', currentUser.email);
                window.location.href = 'index.html';
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                console.log('User signed out');
                window.location.href = 'login.html';
            }
        });

        return currentUser;
    };

    /**
     * Sign up with email and password
     */
    const signUp = async (email, password) => {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase not configured');

        const { data, error } = await client.auth.signUp({
            email,
            password
        });

        if (error) throw error;
        return data;
    };

    /**
     * Sign in with email and password
     */
    const signIn = async (email, password) => {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase not configured');

        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        currentUser = data.user;
        return data;
    };

    /**
     * Sign in with magic link (passwordless)
     */
    const signInWithMagicLink = async (email) => {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase not configured');

        const { data, error } = await client.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin + '/index.html'
            }
        });

        if (error) throw error;
        return data;
    };

    /**
     * Sign out
     */
    const signOut = async () => {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase not configured');

        const { error } = await client.auth.signOut();
        if (error) throw error;

        currentUser = null;
    };

    /**
     * Get current user
     */
    const getCurrentUser = () => {
        return currentUser;
    };

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = () => {
        return currentUser !== null;
    };

    /**
     * Get user ID
     */
    const getUserId = () => {
        return currentUser ? currentUser.id : null;
    };

    // Public API
    return {
        init,
        signUp,
        signIn,
        signInWithMagicLink,
        signOut,
        getCurrentUser,
        isAuthenticated,
        getUserId
    };
})();
