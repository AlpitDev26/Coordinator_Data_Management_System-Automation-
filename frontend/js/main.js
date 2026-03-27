const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Verification
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);

    // 2. Populate User Profile
    document.getElementById('user-display-name').textContent = user.username;
    document.getElementById('user-display-role').textContent = user.roles.join(', ');
    document.getElementById('user-avatar').textContent = user.username.substring(0, 2).toUpperCase();

    // 3. Setup Navigation
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Update Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Load Module
            const moduleName = link.getAttribute('data-module');
            loadModule(moduleName);
        });
    });

    // 4. Logout Logic
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // Load initial module
    loadModule('overview');
});

// Utility for Authenticated Fetches
async function authFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if the response actually has JSON content before parsing
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return response.text();
}

function showLoading(container, moduleName) {
    container.innerHTML = `<div class="glass-card" style="padding: 40px; text-align: center;">
        <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
        <p style="margin-top: 1rem; color: var(--text-muted);">Loading ${moduleName} data...</p>
    </div>`;
}

function showError(container, message) {
    container.innerHTML = `<div class="glass-card" style="padding: 40px; text-align: center;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--accent);"></i>
        <p style="margin-top: 1rem; color: var(--accent);">${message}</p>
    </div>`;
}

async function loadModule(name) {
    const container = document.getElementById('module-container');
    showLoading(container, name);

    try {
        switch (name) {
            case 'overview':
                await renderOverview(container);
                break;
            case 'students':
                await renderStudents(container);
                break;
            case 'teams':
                await renderTeams(container);
                break;
            case 'events':
                await renderEvents(container);
                break;
            case 'attendance':
                await renderAttendance(container);
                break;
            default:
                container.innerHTML = `<h2>${name.charAt(0).toUpperCase() + name.slice(1)} Module</h2><p>Coming soon...</p>`;
        }
    } catch (error) {
        console.error(`Error loading module ${name}:`, error);
        showError(container, `Failed to load ${name} module. ${error.message}`);
    }
}

// --- OVERVIEW MODULE ---
async function renderOverview(container) {
    let stats = { students: 0, teams: 0, events: 0 };
    try {
        stats = await authFetch('/dashboard/stats');
    } catch (e) {
        console.warn('Could not fetch dashboard stats, using defaults', e);
    }

    container.innerHTML = `
        <h2 style="margin-bottom: 24px;">System Overview</h2>
        <div class="grid-dashboard">
            <div class="stat-card glass-card">
                <div class="stat-icon"><i class="fas fa-user-graduate"></i></div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Total Students</span>
                    <h3>${stats.students || 0}</h3>
                </div>
            </div>
            <div class="stat-card glass-card">
                <div class="stat-icon"><i class="fas fa-users"></i></div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Active Teams</span>
                    <h3>${stats.teams || 0}</h3>
                </div>
            </div>
            <div class="stat-card glass-card">
                <div class="stat-icon"><i class="fas fa-calendar-check"></i></div>
                <div>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">Total Events</span>
                    <h3>${stats.events || 0}</h3>
                </div>
            </div>
        </div>
    `;
}

// --- STUDENT MODULE ---
async function renderStudents(container) {
    const students = await authFetch('/students');

    let rows = students.length === 0
        ? `<tr><td colspan="5" style="padding: 20px; text-align: center;">No students found.</td></tr>`
        : students.map(s => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 16px;">${s.fullName || 'N/A'}</td>
                <td style="padding: 16px;">${s.rollNumber || 'N/A'}</td>
                <td style="padding: 16px;">${s.department || 'N/A'}</td>
                <td style="padding: 16px;">${s.email || 'N/A'}</td>
                <td style="padding: 16px;"><span class="glass" style="padding: 4px 12px; color: #10b981;">Enrolled</span></td>
            </tr>
        `).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2>Student Management</h2>
            <button class="btn btn-primary" onclick="alert('Feature coming soon!')"><i class="fas fa-plus"></i> Add Student</button>
        </div>
        <div class="glass-card" style="padding: 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--glass-border);">
                    <tr>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Name</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Roll Number</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Department</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Email</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// --- TEAM MODULE ---
async function renderTeams(container) {
    const teams = await authFetch('/teams');

    let cards = teams.length === 0
        ? `<p style="color: var(--text-muted);">No teams created yet.</p>`
        : teams.map(t => `
            <div class="glass-card" style="padding: 20px;">
                <h3 style="margin-bottom: 10px; color: var(--primary);">${t.name}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 15px;">${t.description || 'No description provided.'}</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span><i class="fas fa-calendar-alt"></i> Created: ${new Date(t.createdAt).toLocaleDateString()}</span>
                    <span><i class="fas fa-users"></i> Members: ${t.members ? t.members.length : 0}</span>
                </div>
            </div>
        `).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2>Team Management</h2>
            <button class="btn btn-primary" onclick="alert('Feature coming soon!')"><i class="fas fa-plus"></i> Create Team</button>
        </div>
        <div class="grid-dashboard">
            ${cards}
        </div>
    `;
}

// --- EVENT MODULE ---
async function renderEvents(container) {
    const events = await authFetch('/events');

    let rows = events.length === 0
        ? `<tr><td colspan="5" style="padding: 20px; text-align: center;">No events scheduled.</td></tr>`
        : events.map(e => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 16px; font-weight: bold;">${e.title}</td>
                <td style="padding: 16px;">${new Date(e.eventDate).toLocaleString()}</td>
                <td style="padding: 16px;">${e.location || 'TBA'}</td>
                <td style="padding: 16px;">${e.description ? e.description.substring(0, 30) + '...' : 'N/A'}</td>
                <td style="padding: 16px;"><button class="btn" style="background: rgba(255,255,255,0.1); padding: 5px 10px; font-size:0.8rem;" onclick="alert('Details coming soon')">View</button></td>
            </tr>
        `).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h2>Event Management</h2>
            <button class="btn btn-primary" onclick="alert('Feature coming soon!')"><i class="fas fa-calendar-plus"></i> Schedule Event</button>
        </div>
        <div class="glass-card" style="padding: 0; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--glass-border);">
                    <tr>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Title</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Date & Time</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Location</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Description</th>
                        <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// --- ATTENDANCE MODULE ---
async function renderAttendance(container) {
    // For simplicity, just fetch events first to select one, then show a placeholder for attendance
    const events = await authFetch('/events');

    let options = events.map(e => `<option value="${e.id}">${e.title} (${new Date(e.eventDate).toLocaleDateString()})</option>`).join('');

    container.innerHTML = `
        <h2 style="margin-bottom: 24px;">Attendance Management</h2>
        
        <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
            <div class="input-group" style="margin-bottom: 0;">
                <label for="event-select">Select Event to view/mark Attendance</label>
                <select id="event-select" style="width: 100%; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--glass-border); border-radius: var(--radius); color: white; outline: none; margin-top: 8px;">
                    <option value="">-- Choose an Event --</option>
                    ${options}
                </select>
            </div>
            <button class="btn btn-primary" style="margin-top: 16px;" onclick="loadAttendanceRecords()">Load Records</button>
        </div>
        
        <div id="attendance-records-container"></div>
    `;
}

// Expose globally for the onclick handler
window.loadAttendanceRecords = async function () {
    const select = document.getElementById('event-select');
    const eventId = select.value;
    const recordsContainer = document.getElementById('attendance-records-container');

    if (!eventId) {
        alert("Please select an event.");
        return;
    }

    showLoading(recordsContainer, 'attendance records');

    try {
        const records = await authFetch(`/attendance/event/${eventId}`);

        let rows = records.length === 0
            ? `<tr><td colspan="4" style="padding: 20px; text-align: center;">No attendance records found for this event.</td></tr>`
            : records.map(r => `
                <tr style="border-bottom: 1px solid var(--glass-border);">
                    <td style="padding: 16px;">${r.student ? r.student.rollNumber : 'Unknown'}</td>
                    <td style="padding: 16px;">${r.student && r.student.user ? r.student.user.fullName : 'Unknown'}</td>
                    <td style="padding: 16px;">
                        <span class="glass" style="padding: 4px 12px; color: ${r.isPresent ? '#10b981' : '#f43f5e'};">
                            ${r.isPresent ? 'Present' : 'Absent'}
                        </span>
                    </td>
                    <td style="padding: 16px;">${new Date(r.recordedAt).toLocaleString()}</td>
                </tr>
            `).join('');

        recordsContainer.innerHTML = `
            <div class="glass-card" style="padding: 0; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--glass-border);">
                        <tr>
                            <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Roll Number</th>
                            <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Student Name</th>
                            <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Status</th>
                            <th style="padding: 16px; font-weight: 500; color: var(--text-muted);">Recorded At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error("Error loading attendance:", error);
        recordsContainer.innerHTML = `<p style="color: var(--accent);">Failed to load records. ${error.message}</p>`;
    }
};
