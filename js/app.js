/**
 * Main Application Controller
 * Coordinates all modules and manages app state
 */

(async () => {
    let currentView = 'entries';
    let transcribedText = '';

    /**
     * Initialize the application
     */
    const init = async () => {
        try {
            // Initialize Supabase
            initSupabase();
            console.log('✓ Supabase client ready');

            // Initialize authentication (only check, don't force login)
            const user = await Auth.init();
            if (user) {
                console.log('✓ Authenticated as:', user.email);
            } else {
                console.log('Running in local mode (not authenticated)');
            }

            // Initialize database
            await DiaryStorage.init();
            console.log('✓ Database initialized');

            // Initialize modules
            QuickLog.init();
            EntriesManager.init(onEntriesChange);
            CalendarView.init(onDateSelect);
            Settings.init();
            console.log('✓ Modules initialized');

            // Initialize voice if supported
            if (VoiceRecorder.isSupported()) {
                VoiceRecorder.init(onTranscript, onVoiceError);
                console.log('✓ Voice recognition enabled');
            } else {
                console.warn('⚠ Voice recognition not supported');
                const voiceBtn = document.getElementById('voiceBtn');
                if (voiceBtn) {
                    voiceBtn.disabled = true;
                    voiceBtn.title = 'Voice input not supported in this browser';
                }
            }

            // Setup event listeners
            setupEventListeners();

            // Load initial data
            await loadData();

            Components.showToast('Chronicle ready!', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            Components.showToast('Failed to initialize app', 'error');
        }
    };

    /**
     * Setup all event listeners
     */
    const setupEventListeners = () => {
        // Navigation
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                switchView(view);
            });
        });

        // Entry form
        const entryForm = document.getElementById('entryForm');
        entryForm?.addEventListener('submit', handleSubmit);

        // Voice button
        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn?.addEventListener('click', toggleVoiceRecording);
    };

    /**
     * Switch between views
     * @param {string} view - View name ('entries', 'calendar', 'settings')
     */
    const switchView = (view) => {
        currentView = view;

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show/hide sections
        document.getElementById('entrySection')?.classList.toggle('hidden', view !== 'entries');
        document.getElementById('calendarSection')?.classList.toggle('hidden', view !== 'calendar');
        document.getElementById('settingsSection')?.classList.toggle('hidden', view !== 'settings');

        // Render calendar if switching to it
        if (view === 'calendar') {
            CalendarView.render();
        }
    };

    /**
     * Handle form submission
     * @param {Event} e
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const contentEl = document.getElementById('entryContent');
        const tagsEl = document.getElementById('entryTags');

        const content = contentEl?.value.trim();
        if (!content) {
            Components.showToast('Please enter some content', 'error');
            return;
        }

        const tags = tagsEl?.value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        try {
            const entryData = {
                type: EntriesManager.getCurrentType(),
                content,
                tags
            };

            const id = await DiaryStorage.createEntry(entryData);
            const entry = await DiaryStorage.getEntry(id);

            EntriesManager.addEntry(entry);
            onEntriesChange();

            // Reset form
            contentEl.value = '';
            tagsEl.value = '';
            transcribedText = '';

            Components.showToast('Entry saved!', 'success');
        } catch (error) {
            console.error('Error saving entry:', error);
            Components.showToast('Failed to save entry', 'error');
        }
    };

    /**
     * Toggle voice recording
     */
    const toggleVoiceRecording = () => {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceText = voiceBtn?.querySelector('.voice-text');

        if (VoiceRecorder.getIsRecording()) {
            VoiceRecorder.stop();
            voiceBtn?.classList.remove('recording');
            if (voiceText) voiceText.textContent = 'Click to speak';
        } else {
            VoiceRecorder.start();
            voiceBtn?.classList.add('recording');
            if (voiceText) voiceText.textContent = 'Recording...';
        }
    };

    /**
     * Handle voice transcript
     * @param {Object} result - Transcript result
     */
    const onTranscript = (result) => {
        const contentEl = document.getElementById('entryContent');
        if (!contentEl) return;

        // Only add final results to the permanent transcript
        if (result.isFinal && result.final) {
            // Add space before appending if there's already content
            if (transcribedText && !transcribedText.endsWith(' ')) {
                transcribedText += ' ';
            }
            transcribedText += result.final;
            // Trim and ensure single space between sentences
            transcribedText = transcribedText.replace(/\s+/g, ' ').trim();
            contentEl.value = transcribedText;
        } else if (result.interim) {
            // Show interim results temporarily without saving them
            const displayText = transcribedText ? transcribedText + ' ' + result.interim : result.interim;
            contentEl.value = displayText;
        }
    };

    /**
     * Handle voice errors
     * @param {string} error
     */
    const onVoiceError = (error) => {
        console.error('Voice error:', error);

        if (error === 'not-allowed') {
            Components.showToast('Microphone access denied', 'error');
        } else {
            Components.showToast('Voice recognition error', 'error');
        }

        const voiceBtn = document.getElementById('voiceBtn');
        voiceBtn?.classList.remove('recording');
    };

    /**
     * Handle date selection in calendar
     * @param {Date} date
     * @param {Array} entries
     */
    const onDateSelect = (date, entries) => {
        const dateEntriesEl = document.getElementById('dateEntries');
        if (!dateEntriesEl) return;

        if (entries.length === 0) {
            dateEntriesEl.innerHTML = `
                <div class="card glass-card">
                    <h3>No entries for ${Components.formatDate(date)}</h3>
                </div>
            `;
        } else {
            const entriesHtml = entries.map(entry => {
                const typeIcons = {
                    event: '🎯',
                    thought: '💭',
                    habit: '✅',
                    food: '🍽️',
                    health: '❤️'
                };

                return `
                    <div class="entry-card">
                        <div class="entry-header">
                            <div class="entry-type">
                                <span class="entry-icon">${typeIcons[entry.type]}</span>
                                <span class="entry-type-label">${entry.type}</span>
                            </div>
                        </div>
                        <div class="entry-content">${entry.content}</div>
                        ${entry.tags && entry.tags.length > 0 ? `
                            <div class="entry-tags">
                                ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            dateEntriesEl.innerHTML = `
                <div class="card glass-card">
                    <h3>${Components.formatDate(date)}</h3>
                    ${entriesHtml}
                </div>
            `;
        }
    };

    /**
     * Handle entries change
     */
    const onEntriesChange = () => {
        const entries = EntriesManager.getEntries();
        CalendarView.loadEntries(entries);
        if (currentView === 'calendar') {
            CalendarView.render();
        }
    };

    /**
     * Load all data
     */
    const loadData = async () => {
        await EntriesManager.loadEntries();
        onEntriesChange();
    };

    // Start the app
    init();
})();
