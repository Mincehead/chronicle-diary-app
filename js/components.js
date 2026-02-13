/**
 * Components Module
 * Reusable UI components and utilities
 */

const Components = (() => {
    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'info'
     * @param {number} duration - Duration in ms (default: 3000)
     */
    const showToast = (message, type = 'info', duration = 3000) => {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast ${type}`;

        // Trigger reflow for animation
        void toast.offsetWidth;

        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, duration);
    };

    /**
     * Format date for display
     * @param {Date} date
     * @returns {string}
     */
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Format time for display
     * @param {Date} date
     * @returns {string}
     */
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    /**
     * Export data as JSON file
     * @param {Object} data - Data to export
     * @param {string} filename - Filename
     */
    const exportJSON = (data, filename) => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);
    };

    /**
     * Import JSON file
     * @param {File} file - File to import
     * @returns {Promise<Object>}
     */
    const importJSON = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    // Public API
    return {
        showToast,
        formatDate,
        formatTime,
        exportJSON,
        importJSON
    };
})();
