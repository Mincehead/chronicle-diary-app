/**
 * Quick-Log Module
 * Handles dropdown-based quick logging for Habit, Food, and Health entries
 */

const QuickLog = (() => {
    const STORAGE_KEY = 'chronicle_quicklog_options';

    // Default options for each quick-log type
    const defaultOptions = {
        habit: [
            'Morning meditation',
            'Exercise',
            'Read for 30min',
            'Drink 8 glasses of water',
            'No social media',
            'Early to bed',
            'Journaling',
            'Gratitude practice'
        ],
        food: [
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snack',
            'Healthy meal',
            'Cheat meal',
            'Skipped meal',
            'Ate out',
            'Meal prep'
        ],
        health: [
            'Took medication',
            '8+ hours sleep',
            'Feeling energetic',
            'Feeling tired',
            'Headache',
            'Workout completed',
            'Doctor appointment',
            'Vitamins taken',
            'Feeling great'
        ]
    };

    let customOptions = {
        habit: [],
        food: [],
        health: []
    };

    /**
     * Initialize quick-log system
     */
    const init = () => {
        loadCustomOptions();
    };

    /**
     * Load custom options from localStorage
     */
    const loadCustomOptions = () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                customOptions = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading custom options:', error);
        }
    };

    /**
     * Save custom options to localStorage
     */
    const saveCustomOptions = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(customOptions));
        } catch (error) {
            console.error('Error saving custom options:', error);
        }
    };

    /**
     * Get all options for a type (default + custom)
     * @param {string} type - Entry type (habit, food, health)
     * @returns {Array<string>}
     */
    const getOptions = (type) => {
        if (!defaultOptions[type]) return [];

        const defaults = defaultOptions[type];
        const custom = customOptions[type] || [];

        // Combine and remove duplicates
        return [...new Set([...defaults, ...custom])].sort();
    };

    /**
     * Add custom option
     * @param {string} type - Entry type
     * @param {string} option - New option to add
     * @returns {boolean} Success
     */
    const addCustomOption = (type, option) => {
        if (!option || !option.trim()) return false;

        const trimmedOption = option.trim();

        if (!customOptions[type]) {
            customOptions[type] = [];
        }

        // Check if already exists (in default or custom)
        const allOptions = getOptions(type);
        if (allOptions.includes(trimmedOption)) {
            return false; // Already exists
        }

        customOptions[type].push(trimmedOption);
        saveCustomOptions();
        return true;
    };

    /**
     * Remove custom option
     * @param {string} type - Entry type
     * @param {string} option - Option to remove
     * @returns {boolean} Success
     */
    const removeCustomOption = (type, option) => {
        if (!customOptions[type]) return false;

        const index = customOptions[type].indexOf(option);
        if (index === -1) return false;

        customOptions[type].splice(index, 1);
        saveCustomOptions();
        return true;
    };

    /**
     * Create entry from quick-log selection
     * @param {string} type - Entry type
     * @param {string} option - Selected option
     * @returns {Promise<string>} Entry ID
     */
    const createQuickLogEntry = async (type, option) => {
        const entryData = {
            type: type,
            content: option,
            tags: ['quick-log']
        };

        return await DiaryStorage.createEntry(entryData);
    };

    /**
     * Get custom options for a type
     * @param {string} type - Entry type
     * @returns {Array<string>}
     */
    const getCustomOptions = (type) => {
        return customOptions[type] || [];
    };

    /**
     * Check if option is custom (not default)
     * @param {string} type - Entry type
     * @param {string} option - Option to check
     * @returns {boolean}
     */
    const isCustomOption = (type, option) => {
        return !defaultOptions[type].includes(option);
    };

    // Public API
    return {
        init,
        getOptions,
        addCustomOption,
        removeCustomOption,
        createQuickLogEntry,
        getCustomOptions,
        isCustomOption
    };
})();
