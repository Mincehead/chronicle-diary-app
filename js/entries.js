/**
 * Entries Module
 * Manages diary entry creation, display, and editing
 */

const EntriesManager = (() => {
    let currentType = 'event';
    let entries = [];
    let onEntryChangeCallback = null;

    // Types that use quick-log mode
    const QUICK_LOG_TYPES = ['habit', 'food', 'health'];

    /**
     * Initialize entries manager
     * @param {Function} onEntryChange - Callback when entries change
     */
    const init = (onEntryChange) => {
        onEntryChangeCallback = onEntryChange;

        // Type selector handlers
        const typeButtons = document.querySelectorAll('.type-btn');
        typeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                currentType = btn.dataset.type;
                typeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Switch between text entry and quick-log mode
                updateEntryMode();

                // If quick-log type, populate dropdown
                if (QUICK_LOG_TYPES.includes(currentType)) {
                    populateQuickLogDropdown();
                }
            });
        });

        // Quick-log dropdown change handler
        const quickLogSelect = document.getElementById('quickLogSelect');
        quickLogSelect?.addEventListener('change', handleQuickLogSelection);

        // Add custom option handlers
        const addCustomBtn = document.getElementById('addCustomBtn');
        const saveCustomBtn = document.getElementById('saveCustomBtn');
        const cancelCustomBtn = document.getElementById('cancelCustomBtn');

        addCustomBtn?.addEventListener('click', () => {
            document.getElementById('addCustomForm')?.classList.remove('hidden');
            document.getElementById('customOptionInput')?.focus();
        });

        saveCustomBtn?.addEventListener('click', handleSaveCustomOption);
        cancelCustomBtn?.addEventListener('click', () => {
            document.getElementById('addCustomForm')?.classList.add('hidden');
            document.getElementById('customOptionInput').value = '';
        });
    };

    /**
     * Update entry mode based on current type
     */
    const updateEntryMode = () => {
        const textMode = document.getElementById('textEntryMode');
        const quickLogMode = document.getElementById('quickLogMode');

        if (QUICK_LOG_TYPES.includes(currentType)) {
            textMode?.classList.add('hidden');
            quickLogMode?.classList.remove('hidden');
        } else {
            textMode?.classList.remove('hidden');
            quickLogMode?.classList.add('hidden');
        }
    };

    /**
     * Populate quick-log dropdown with options
     */
    const populateQuickLogDropdown = () => {
        const select = document.getElementById('quickLogSelect');
        if (!select) return;

        const options = QuickLog.getOptions(currentType);

        select.innerHTML = '<option value="">Select an option...</option>';
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option;
            optionEl.textContent = option;
            select.appendChild(optionEl);
        });
    };

    /**
     * Handle quick-log dropdown selection
     */
    const handleQuickLogSelection = async (e) => {
        const option = e.target.value;
        if (!option) return;

        try {
            const id = await QuickLog.createQuickLogEntry(currentType, option);
            const entry = await DiaryStorage.getEntry(id);

            entries.unshift(entry);
            renderEntries();

            if (onEntryChangeCallback) {
                onEntryChangeCallback();
            }

            Components.showToast(`${currentType} logged: ${option}`, 'success');

            // Reset dropdown
            e.target.value = '';
        } catch (error) {
            console.error('Error creating quick-log entry:', error);
            Components.showToast('Failed to log entry', 'error');
        }
    };

    /**
     * Handle saving custom option
     */
    const handleSaveCustomOption = () => {
        const input = document.getElementById('customOptionInput');
        const option = input?.value.trim();

        if (!option) return;

        const success = QuickLog.addCustomOption(currentType, option);

        if (success) {
            populateQuickLogDropdown();
            Components.showToast('Custom option added', 'success');
            input.value = '';
            document.getElementById('addCustomForm')?.classList.add('hidden');
        } else {
            Components.showToast('Option already exists', 'error');
        }
    };

    /**
     * Render entries list
     * @param {Array} entriesToRender - Entries to display
     */
    const renderEntries = (entriesToRender = entries) => {
        const container = document.getElementById('entriesContainer');
        if (!container) return;

        if (entriesToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No entries yet. Start recording your thoughts!</p>
                </div>
            `;
            return;
        }

        const html = entriesToRender.map(entry => createEntryCard(entry)).join('');
        container.innerHTML = html;

        // Add event listeners
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteEntry(btn.dataset.id));
        });
    };

    /**
     * Create entry card HTML
     * @param {Object} entry
     * @returns {string}
     */
    const createEntryCard = (entry) => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const typeIcons = {
            event: '🎯',
            thought: '💭',
            habit: '✅',
            food: '🍽️',
            health: '❤️'
        };

        return `
            <div class="entry-card" data-id="${entry.id}">
                <div class="entry-header">
                    <div class="entry-type">
                        <span class="entry-icon">${typeIcons[entry.type]}</span>
                        <span class="entry-type-label">${entry.type}</span>
                    </div>
                    <div class="entry-actions">
                        <button class="delete-btn" data-id="${entry.id}" aria-label="Delete entry">🗑️</button>
                    </div>
                </div>
                <div class="entry-content">${escapeHtml(entry.content)}</div>
                ${entry.tags && entry.tags.length > 0 ? `
                    <div class="entry-tags">
                        ${entry.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="entry-date">${formattedDate}</div>
            </div>
        `;
    };

    /**
     * Delete entry
     * @param {string} id - Entry ID
     */
    const deleteEntry = async (id) => {
        if (!confirm('Are you sure you want to delete this entry?')) return;

        try {
            await DiaryStorage.deleteEntry(id);
            entries = entries.filter(e => e.id !== id);
            renderEntries();

            if (onEntryChangeCallback) {
                onEntryChangeCallback();
            }

            Components.showToast('Entry deleted', 'success');
        } catch (error) {
            console.error('Error deleting entry:', error);
            Components.showToast('Failed to delete entry', 'error');
        }
    };

    /**
     * Escape HTML to prevent XSS
     * @param {string} text
     * @returns {string}
     */
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    /**
     * Load entries from storage
     */
    const loadEntries = async () => {
        try {
            entries = await DiaryStorage.getAllEntries();
            renderEntries();
        } catch (error) {
            console.error('Error loading entries:', error);
            Components.showToast('Failed to load entries', 'error');
        }
    };

    /**
     * Get current entry type
     * @returns {string}
     */
    const getCurrentType = () => currentType;

    /**
     * Get all entries
     * @returns {Array}
     */
    const getEntries = () => entries;

    /**
     * Add new entry to list
     * @param {Object} entry
     */
    const addEntry = (entry) => {
        entries.unshift(entry);
        renderEntries();
    };

    // Public API
    return {
        init,
        renderEntries,
        loadEntries,
        getCurrentType,
        getEntries,
        addEntry
    };
})();
