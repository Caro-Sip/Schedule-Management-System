// Schedule Management System
class ScheduleManager {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'class'; // 'class', 'teacher', 'room'
        this.events = this.loadEvents();
        this.selectedEvent = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
        this.updateCurrentDate();
    }

    setupEventListeners() {
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Navigation
        document.getElementById('prevWeek').addEventListener('click', () => this.previousWeek());
        document.getElementById('nextWeek').addEventListener('click', () => this.nextWeek());
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // Modal controls
        document.querySelector('.close-btn').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('saveEventBtn').addEventListener('click', () => this.saveEvent());
        document.getElementById('deleteEventBtn').addEventListener('click', () => this.deleteEvent());

        // Close modal when clicking outside
        document.getElementById('eventModal').addEventListener('click', (e) => {
            if (e.target.id === 'eventModal') {
                this.closeModal();
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        this.render();
    }

    previousWeek() {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        this.render();
    }

    nextWeek() {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
    }

    render() {
        this.renderTimeLabels();
        this.renderDayHeaders();
        this.renderScheduleGrid();
        this.updateWeekInfo();
    }

    renderTimeLabels() {
        const timeLabels = document.getElementById('timeLabels');
        timeLabels.innerHTML = '';

        for (let hour = 6; hour <= 20; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            const displayHour = hour > 12 ? hour - 12 : hour;
            const period = hour >= 12 ? 'PM' : 'AM';
            timeSlot.textContent = `${displayHour}:00 ${period}`;
            timeLabels.appendChild(timeSlot);
        }
    }

    renderDayHeaders() {
        const dayHeader = document.querySelector('.day-header');
        dayHeader.innerHTML = '';

        const startOfWeek = this.getMonday(this.currentDate);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);

            const cell = document.createElement('div');
            cell.className = 'day-header-cell';

            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
            const dayDate = date.getDate();

            let dateHTML = `<div class="day-name">${dayName}</div>`;
            
            if (this.isToday(date)) {
                dateHTML += `<div class="day-date today">${dayDate}</div>`;
            } else {
                dateHTML += `<div class="day-date">${dayDate}</div>`;
            }

            cell.innerHTML = dateHTML;
            dayHeader.appendChild(cell);
        }
    }

    renderScheduleGrid() {
        const scheduleGrid = document.getElementById('scheduleGrid');
        scheduleGrid.innerHTML = '';

        const startOfWeek = this.getMonday(this.currentDate);
        const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 6 AM to 8 PM

        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';

            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + dayIndex);

            for (let hour = 0; hour < 15; hour++) {
                const timeBlock = document.createElement('div');
                timeBlock.className = 'time-block';
                timeBlock.dataset.date = date.toISOString().split('T')[0];
                timeBlock.dataset.hour = hours[hour];

                timeBlock.addEventListener('click', () => this.openNewEventModal(date, hours[hour]));

                dayColumn.appendChild(timeBlock);
            }

            scheduleGrid.appendChild(dayColumn);
        }

        // Render events
        this.renderEvents();
    }

    renderEvents() {
        const events = this.getEventsForView();

        events.forEach(event => {
            const dayIndex = this.getDayOfWeek(new Date(event.date));
            const startOfWeek = this.getMonday(this.currentDate);
            const eventDate = new Date(event.date);

            if (this.isEventInWeek(eventDate, startOfWeek)) {
                const dayColumns = document.querySelectorAll('.day-column');
                const columnDate = new Date(startOfWeek);
                columnDate.setDate(columnDate.getDate() + dayIndex);

                let columnToUse = null;
                dayColumns.forEach((col, idx) => {
                    const blockDate = new Date(col.querySelector('.time-block').dataset.date);
                    if (blockDate.toDateString() === columnDate.toDateString()) {
                        columnToUse = col;
                    }
                });

                if (columnToUse) {
                    const eventElement = this.createEventElement(event);
                    const startHour = parseInt(event.startTime.split(':')[0]);
                    const startMinute = parseInt(event.startTime.split(':')[1]);
                    const offsetTop = (startHour - 6) * 60 + startMinute;

                    const endHour = parseInt(event.endTime.split(':')[0]);
                    const endMinute = parseInt(event.endTime.split(':')[1]);
                    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);

                    eventElement.style.top = `${offsetTop}px`;
                    eventElement.style.height = `${duration}px`;
                    eventElement.style.position = 'absolute';

                    columnToUse.appendChild(eventElement);

                    eventElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.openEventModal(event);
                    });
                }
            }
        });
    }

    createEventElement(event) {
        const div = document.createElement('div');
        div.className = `event ${event.color}`;
        div.innerHTML = `
            <span class="event-title">${event.title}</span>
            <span class="event-time">${event.startTime} - ${event.endTime}</span>
        `;
        return div;
    }

    getEventsForView() {
        return this.events.filter(event => event.view === this.currentView);
    }

    isEventInWeek(eventDate, startOfWeek) {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        return eventDate >= startOfWeek && eventDate < endOfWeek;
    }

    getDayOfWeek(date) {
        let day = date.getDay() - 1;
        return day === -1 ? 6 : day;
    }

    getMonday(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    updateWeekInfo() {
        const startOfWeek = this.getMonday(this.currentDate);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);

        const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const weekText = `Week of ${formatter.format(startOfWeek)}`;
        document.getElementById('currentWeek').textContent = weekText;
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    updateCurrentDate() {
        setInterval(() => {
            this.render();
        }, 60000); // Update every minute
    }

    openNewEventModal(date, hour) {
        this.selectedEvent = null;
        document.getElementById('modalTitle').textContent = 'Create New Event';
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventStartTime').value = `${String(hour).padStart(2, '0')}:00`;
        document.getElementById('eventEndTime').value = `${String(hour + 1).padStart(2, '0')}:00`;
        document.getElementById('eventRoom').value = '';
        document.getElementById('eventInstructor').value = '';
        document.getElementById('deleteEventBtn').style.display = 'none';
        document.getElementById('deleteEventBtn').disabled = true;

        this.selectedDate = date;
        this.showModal();
    }

    openEventModal(event) {
        this.selectedEvent = event;
        document.getElementById('modalTitle').textContent = 'Edit Event';
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventStartTime').value = event.startTime;
        document.getElementById('eventEndTime').value = event.endTime;
        document.getElementById('eventRoom').value = event.room || '';
        document.getElementById('eventInstructor').value = event.instructor || '';
        document.querySelector(`input[name="color"][value="${event.color}"]`).checked = true;
        document.getElementById('deleteEventBtn').style.display = 'block';
        document.getElementById('deleteEventBtn').disabled = false;

        this.showModal();
    }

    showModal() {
        document.getElementById('eventModal').classList.add('show');
    }

    closeModal() {
        document.getElementById('eventModal').classList.remove('show');
        this.selectedEvent = null;
    }

    saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        const startTime = document.getElementById('eventStartTime').value;
        const endTime = document.getElementById('eventEndTime').value;
        const room = document.getElementById('eventRoom').value.trim();
        const instructor = document.getElementById('eventInstructor').value.trim();
        const color = document.querySelector('input[name="color"]:checked').value;

        if (!title || !startTime || !endTime) {
            alert('Please fill in all required fields');
            return;
        }

        if (startTime >= endTime) {
            alert('End time must be after start time');
            return;
        }

        if (this.selectedEvent) {
            // Update existing event
            this.selectedEvent.title = title;
            this.selectedEvent.startTime = startTime;
            this.selectedEvent.endTime = endTime;
            this.selectedEvent.room = room;
            this.selectedEvent.instructor = instructor;
            this.selectedEvent.color = color;
        } else {
            // Create new event
            const event = {
                id: Date.now(),
                date: this.selectedDate.toISOString().split('T')[0],
                title,
                startTime,
                endTime,
                room,
                instructor,
                color,
                view: this.currentView
            };
            this.events.push(event);
        }

        this.saveEvents();
        this.closeModal();
        this.render();
    }

    deleteEvent() {
        if (this.selectedEvent && confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== this.selectedEvent.id);
            this.saveEvents();
            this.closeModal();
            this.render();
        }
    }

    saveEvents() {
        localStorage.setItem('scheduleEvents', JSON.stringify(this.events));
    }

    loadEvents() {
        const stored = localStorage.getItem('scheduleEvents');
        return stored ? JSON.parse(stored) : [];
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScheduleManager();
});
