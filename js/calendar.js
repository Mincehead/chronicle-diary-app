/**
 * Calendar Module
 * Renders monthly calendar and handles date navigation
 */

const CalendarView = (() => {
    let currentDate = new Date();
    let selectedDate = null;
    let entriesMap = new Map();
    let onDateSelectCallback = null;

    /**
     * Initialize calendar
     * @param {Function} onDateSelect - Callback when date is selected
     */
    const init = (onDateSelect) => {
        onDateSelectCallback = onDateSelect;

        // Setup navigation buttons
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            render();
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            render();
        });
    };

    /**
     * Load entries for calendar
     * @param {Array} entries - All entries
     */
    const loadEntries = (entries) => {
        entriesMap.clear();

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

            if (!entriesMap.has(dateKey)) {
                entriesMap.set(dateKey, []);
            }
            entriesMap.get(dateKey).push(entry);
        });
    };

    /**
     * Render calendar
     */
    const render = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const titleEl = document.getElementById('calendarTitle');
        if (titleEl) {
            titleEl.textContent = `${monthNames[month]} ${year}`;
        }

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Build calendar grid
        const gridEl = document.getElementById('calendarGrid');
        if (!gridEl) return;

        let html = '<div class="calendar-days">';

        // Day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-cell empty"></div>';
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${month}-${day}`;
            const hasEntries = entriesMap.has(dateKey);
            const entryCount = hasEntries ? entriesMap.get(dateKey).length : 0;
            const isToday = isDateToday(year, month, day);
            const isSelected = isDateSelected(year, month, day);

            html += `
                <div class="calendar-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${hasEntries ? ' has-entries' : ''}" 
                     data-date="${year}-${month}-${day}">
                    <span class="day-number">${day}</span>
                    ${hasEntries ? `<span class="entry-indicator">${entryCount}</span>` : ''}
                </div>
            `;
        }

        html += '</div>';
        gridEl.innerHTML = html;

        // Add click listeners
        gridEl.querySelectorAll('.calendar-cell:not(.empty)').forEach(cell => {
            cell.addEventListener('click', () => {
                const dateStr = cell.dataset.date;
                const [y, m, d] = dateStr.split('-').map(Number);
                selectedDate = new Date(y, m, d);

                if (onDateSelectCallback) {
                    const entries = entriesMap.get(dateStr) || [];
                    onDateSelectCallback(selectedDate, entries);
                }

                render();
            });
        });
    };

    /**
     * Check if date is today
     */
    const isDateToday = (year, month, day) => {
        const today = new Date();
        return today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
    };

    /**
     * Check if date is selected
     */
    const isDateSelected = (year, month, day) => {
        if (!selectedDate) return false;
        return selectedDate.getFullYear() === year &&
            selectedDate.getMonth() === month &&
            selectedDate.getDate() === day;
    };

    // Public API
    return {
        init,
        loadEntries,
        render
    };
})();
