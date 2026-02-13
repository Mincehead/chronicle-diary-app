/**
 * Settings Module
 * Manages user preferences and data import/export
 */

const Settings = (() => {
    const SETTINGS_KEY = 'chronicle_settings';
    const defaultSettings = {
        darkMode: true
    };

    let settings = { ...defaultSettings };

    /**
     * Initialize settings
     */
    const init = () => {
        loadSettings();
        setupEventListeners();
    };

    /**
     * Load settings from localStorage
     */
    const loadSettings = () => {
        try {
            const stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                settings = { ...defaultSettings, ...JSON.parse(stored) };
            }
            applySettings();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    /**
     * Save settings to localStorage
     */
    const saveSettings = () => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    /**
     * Apply settings to UI
     */
    const applySettings = () => {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.checked = settings.darkMode;
        }
    };

    /**
     * Setup event listeners
     */
    const setupEventListeners = () => {
        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle?.addEventListener('change', (e) => {
            settings.darkMode = e.target.checked;
            saveSettings();
            Components.showToast('Settings updated', 'success');
        });

        // Export data
        const exportBtn = document.getElementById('exportBtn');
        exportBtn?.addEventListener('click', exportData);

        // Import data
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');

        importBtn?.addEventListener('click', () => {
            importFile?.click();
        });

        importFile?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await importData(file);
                e.target.value = '';
            }
        });
    };

    /**
     * Export all data
     */
    const exportData = async () => {
        try {
            const entries = await DiaryStorage.getAllEntries();
            const exportData = {
                version: 1,
                timestamp: new Date().toISOString(),
                entries,
                settings
            };

            const filename = `chronicle_backup_${new Date().toISOString().split('T')[0]}.json`;
            Components.exportJSON(exportData, filename);
            Components.showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            Components.showToast('Failed to export data', 'error');
        }
    };

    /**
     * Import data
     * @param {File} file
     */
    const importData = async (file) => {
        try {
            const data = await Components.importJSON(file);

            if (!data.entries || !Array.isArray(data.entries)) {
                throw new Error('Invalid data format');
            }

            // Confirm before overwriting
            const confirmMsg = `This will import ${data.entries.length} entries. Continue?`;
            if (!confirm(confirmMsg)) return;

            // Import entries
            for (const entry of data.entries) {
                await DiaryStorage.createEntry(entry);
            }

            // Import settings if available
            if (data.settings) {
                settings = { ...defaultSettings, ...data.settings };
                saveSettings();
                applySettings();
            }

            Components.showToast('Data imported successfully', 'success');

            // Reload app
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Error importing data:', error);
            Components.showToast('Failed to import data', 'error');
        }
    };

    /**
     * Get setting value
     * @param {string} key
     * @returns {*}
     */
    const getSetting = (key) => settings[key];

    // Public API
    return {
        init,
        getSetting
    };
})();
