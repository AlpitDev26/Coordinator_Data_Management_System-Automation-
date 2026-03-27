/* dashboard.js */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';

// Set user info in sidebar
const username = localStorage.getItem('username') || 'Admin';
const el = document.getElementById('sidebarUsername');
const welcomeEl = document.getElementById('welcomeName');
const av = document.getElementById('avatarInitial');
if (el) el.textContent = username;
if (welcomeEl) welcomeEl.textContent = username;
if (av) av.textContent = username.charAt(0).toUpperCase();

document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

const ATT_PALETTE = ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

async function loadDashboard() {
    try {
        const [students, events, teams, attendance] = await Promise.allSettled([
            API.request('/students'), API.request('/events'), API.request('/teams'), API.request('/attendance')
        ]);
        const s = students.status === 'fulfilled' ? students.value : [];
        const e = events.status === 'fulfilled' ? events.value : [];
        const t = teams.status === 'fulfilled' ? teams.value : [];
        const a = attendance.status === 'fulfilled' ? attendance.value : [];

        // Update stats
        document.getElementById('statStudents').textContent = s.length || '0';
        document.getElementById('statEvents').textContent = e.length || '0';
        document.getElementById('statTeams').textContent = t.length || '0';
        document.getElementById('statAttendance').textContent = a.length || '0';

        // Render sections
        renderRecentStudents(s.slice(0, 5));
        
        const upcoming = e.filter(ev => ev.eventDate && new Date(ev.eventDate) >= new Date());
        renderUpcomingEvents(upcoming.slice(0, 4));

        renderAttendanceChart(e.slice(0, 7), a);

    } catch (err) { console.error('Dashboard error:', err); }
}

function renderRecentStudents(students) {
    const body = document.getElementById('recentStudentsBody');
    if (!body) return;
    if (!students.length) { body.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;">No students found.</td></tr>'; return; }
    body.innerHTML = students.map((s, i) => `
        <tr>
            <td class="text-muted">${i + 1}</td>
            <td><strong>${s.fullName || '—'}</strong></td>
            <td class="text-muted">${s.email || '—'}</td>
            <td>${s.clubDept || '—'}</td>
            <td>${s.departmentRole || 'Member'}</td>
            <td><span class="badge badge-cyan">Active</span></td>
        </tr>`).join('');
}

function renderUpcomingEvents(events) {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    const colors = ['cyan', 'purple', 'pink', 'cyan'];
    if (!events.length) { container.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px;">No upcoming events</div>'; return; }
    container.innerHTML = events.map((ev, i) => `
        <div class="event-item">
            <div class="event-dot ${colors[i % colors.length]}"></div>
            <div style="flex-grow: 1;">
                <div class="event-name">${ev.title || '—'}</div>
                <div class="event-date">${ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : '—'} • ${ev.mode || 'TBD'}</div>
            </div>
            <div style="font-size: 9px; color: var(--pink); border-left: 1px solid rgba(255,255,255,0.05); padding-left: 8px;">
                ${ev.hostDept || '—'}
            </div>
        </div>`).join('');
}

function renderAttendanceChart(events, attendance) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (!ctx) return;
    const labels = events.length ? events.map(e => e.title || 'Event') : ['No Events'];
    const data = events.map(e => attendance.filter(a => a.eventId === e.id && a.status === 'PRESENT').length);

    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels,
            datasets: [{
                data: data,
                backgroundColor: ATT_PALETTE,
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.05)'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } } },
            plugins: { 
                legend: { position: 'bottom', labels: { usePointStyle: true, color: '#94a3b8', font: { size: 10 } } }
            }
        }
    });
}

loadDashboard();
