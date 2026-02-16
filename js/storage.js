/**
 * Storage Module - Hybrid Supabase + IndexedDB Data Layer
 * Handles all data persistence for diary entries
 * Uses Supabase when configured, falls back to IndexedDB for local-only mode
 */

const DiaryStorage = (() => {
    const DB_NAME = 'ChronicleDB';
    const DB_VERSION = 2; // Incremented to trigger upgrade and create object stores
    const STORE_NAME = 'entries';

    let db = null;
    let useSupabase = false;

    /**
     * Initialize storage (IndexedDB + Supabase)
     * @returns {Promise<IDBDatabase|null>}
     */
    const init = async () => {
        // Check if Supabase is configured
        useSupabase = isSupabaseConfigured();

        // ALWAYS initialize IndexedDB as a fallback, even if Supabase is configured
        // This allows local storage when user is not authenticated
        console.log(useSupabase ? '✓ Using Supabase for storage (with local fallback)' : 'Using IndexedDB for local storage');
        return initIndexedDB();
    };

    /**
     * Initialize IndexedDB
     */
    const initIndexedDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                db = request.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = database.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: false
                    });

                    objectStore.createIndex('type', 'type', { unique: false });
                    objectStore.createIndex('date', 'date', { unique: false });
                    objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    };

    /**
     * Create a new entry
     * @param {Object} entryData - Entry data
     * @returns {Promise<string>} Entry ID
     */
    const createEntry = async (entryData) => {
        if (useSupabase) {
            return createEntrySupabase(entryData);
        }
        return createEntryIndexedDB(entryData);
    };

    /**
     * Create entry in Supabase
     */
    const createEntrySupabase = async (entryData) => {
        const client = getSupabaseClient();
        const userId = Auth.getUserId();

        // If not authenticated, fallback to IndexedDB  
        if (!userId) {
            console.warn('User not authenticated, falling back to local storage');
            return createEntryIndexedDB(entryData);
        }

        try {
            const entry = {
                user_id: userId,
                type: entryData.type || 'event',
                content: entryData.content,
                tags: entryData.tags || []
            };

            const { data, error } = await client
                .from('entries')
                .insert([entry])
                .select()
                .single();

            if (error) throw error;
            return data.id;
        } catch (error) {
            // If Supabase fails, fallback to local storage
            console.warn('Failed to save to Supabase, saving to local storage:', error);
            return createEntryIndexedDB(entryData);
        }
    };

    /**
     * Create entry in IndexedDB
     */
    const createEntryIndexedDB = (entryData) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const entry = {
                id: Date.now().toString(),
                timestamp: Date.now(),
                date: new Date().toISOString(),
                type: entryData.type || 'event',
                content: entryData.content,
                tags: entryData.tags || [],
                customFields: entryData.customFields || {}
            };

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(entry);

            request.onsuccess = () => resolve(entry.id);
            request.onerror = () => reject(request.error);
        });
    };

    /**
     * Get all entries
     * @returns {Promise<Array>}
     */
    const getAllEntries = async () => {
        if (useSupabase) {
            return getAllEntriesSupabase();
        }
        return getAllEntriesIndexedDB();
    };

    /**
     * Get all entries from Supabase
     */
    const getAllEntriesSupabase = async () => {
        const client = getSupabaseClient();
        const userId = Auth.getUserId();

        // If not authenticated, fallback to IndexedDB
        if (!userId) {
            console.warn('User not authenticated, loading from local storage');
            return getAllEntriesIndexedDB();
        }

        try {
            const { data, error } = await client
                .from('entries')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Convert to local format
            return data.map(entry => ({
                id: entry.id,
                timestamp: new Date(entry.created_at).getTime(),
                date: entry.created_at,
                type: entry.type,
                content: entry.content,
                tags: entry.tags || []
            }));
        } catch (error) {
            // If Supabase fails, fallback to local storage
            console.warn('Failed to fetch from Supabase, loading from local storage:', error);
            return getAllEntriesIndexedDB();
        }
    };

    /**
     * Get all entries from IndexedDB
     */
    const getAllEntriesIndexedDB = () => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const entries = request.result;
                entries.sort((a, b) => b.timestamp - a.timestamp);
                resolve(entries);
            };
            request.onerror = () => reject(request.error);
        });
    };

    /**
     * Get entry by ID
     */
    const getEntry = async (id) => {
        if (useSupabase) {
            try {
                const client = getSupabaseClient();
                const { data, error } = await client
                    .from('entries')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return data;
            } catch (error) {
                // Fallback to IndexedDB if Supabase fails
                console.warn('Failed to fetch from Supabase, trying local storage:', error);
                return getEntryIndexedDB(id);
            }
        }
        return getEntryIndexedDB(id);
    };

    const getEntryIndexedDB = (id) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    };

    /**
     * Get entries by date range
     */
    const getEntriesByDateRange = async (startDate, endDate) => {
        if (useSupabase) {
            const client = getSupabaseClient();
            const userId = Auth.getUserId();

            const { data, error } = await client
                .from('entries')
                .select('*')
                .eq('user_id', userId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(entry => ({
                id: entry.id,
                timestamp: new Date(entry.created_at).getTime(),
                date: entry.created_at,
                type: entry.type,
                content: entry.content,
                tags: entry.tags || []
            }));
        }
        return getEntriesByDateRangeIndexedDB(startDate, endDate);
    };

    const getEntriesByDateRangeIndexedDB = (startDate, endDate) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('date');

            const range = IDBKeyRange.bound(
                startDate.toISOString(),
                endDate.toISOString()
            );

            const request = index.getAll(range);

            request.onsuccess = () => {
                const entries = request.result;
                entries.sort((a, b) => b.timestamp - a.timestamp);
                resolve(entries);
            };
            request.onerror = () => reject(request.error);
        });
    };

    /**
     * Get entries by type
     */
    const getEntriesByType = async (type) => {
        if (useSupabase) {
            const client = getSupabaseClient();
            const userId = Auth.getUserId();

            const { data, error } = await client
                .from('entries')
                .select('*')
                .eq('user_id', userId)
                .eq('type', type)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(entry => ({
                id: entry.id,
                timestamp: new Date(entry.created_at).getTime(),
                date: entry.created_at,
                type: entry.type,
                content: entry.content,
                tags: entry.tags || []
            }));
        }
        return getEntriesByTypeIndexedDB(type);
    };

    const getEntriesByTypeIndexedDB = (type) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('type');
            const request = index.getAll(type);

            request.onsuccess = () => {
                const entries = request.result;
                entries.sort((a, b) => b.timestamp - a.timestamp);
                resolve(entries);
            };
            request.onerror = () => reject(request.error);
        });
    };

    /**
     * Update an entry
     */
    const updateEntry = async (id, updates) => {
        if (useSupabase) {
            const client = getSupabaseClient();
            const { error } = await client
                .from('entries')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            return;
        }
        return updateEntryIndexedDB(id, updates);
    };

    const updateEntryIndexedDB = (id, updates) => {
        return new Promise(async (resolve, reject) => {
            try {
                const entry = await getEntryIndexedDB(id);
                if (!entry) {
                    reject(new Error('Entry not found'));
                    return;
                }

                const updatedEntry = { ...entry, ...updates, id, timestamp: entry.timestamp };

                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.put(updatedEntry);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    };

    /**
     * Delete an entry
     */
    const deleteEntry = async (id) => {
        if (useSupabase) {
            const client = getSupabaseClient();
            const { error } = await client
                .from('entries')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return;
        }
        return deleteEntryIndexedDB(id);
    };

    const deleteEntryIndexedDB = (id) => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    };

    /**
     * Clear all entries
     */
    const clearAll = async () => {
        if (useSupabase) {
            const client = getSupabaseClient();
            const userId = Auth.getUserId();
            const { error } = await client
                .from('entries')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return;
        }
        return clearAllIndexedDB();
    };

    const clearAllIndexedDB = () => {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    };

    // Public API
    return {
        init,
        createEntry,
        getAllEntries,
        getEntry,
        getEntriesByDateRange,
        getEntriesByType,
        updateEntry,
        deleteEntry,
        clearAll
    };
})();
