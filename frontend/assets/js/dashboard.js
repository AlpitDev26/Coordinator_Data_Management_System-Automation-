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

async function loadDashboard() {
    try {
        // Load all stats in parallel
        const [students, events, teams, attendance] = await Promise.allSettled([
            API.request('/students'),
            API.request('/events'),
            API.request('/teams'),
            API.request('/attendance')
        ]);

        const s = students.status === 'fulfilled' ? students.value : [];
        const e = events.status === 'fulfilled' ? events.value : [];
        const t = teams.status === 'fulfilled' ? teams.value : [];
        const a = attendance.status === 'fulfilled' ? attendance.value : [];

        // Update stat cards
        document.getElementById('statStudents').textContent = s.length || '0';
        document.getElementById('statEvents').textContent = e.length || '0';
        document.getElementById('statTeams').textContent = t.length || '0';
        document.getElementById('statAttendance').textContent = a.length || '0';

        // Recent students table - mapping registrationYear correctly
        renderRecentStudents(s.slice(0, 5));

        // Upcoming events (filter only future dates)
        const upcoming = e.filter(ev => ev.eventDate && new Date(ev.eventDate) >= new Date());
        renderUpcomingEvents(upcoming.slice(0, 4));

        // Chart
        renderAttendanceChart(e.slice(0, 7), a);

    } catch (err) { console.error('Dashboard error:', err); }
}

function renderRecentStudents(students) {
    const body = document.getElementById('recentStudentsBody');
    if (!students.length) { body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:30px;">No students found.</td></tr>'; return; }
    body.innerHTML = students.map((s, i) => `
        <tr>
            <td class="text-muted">${i + 1}</td>
            <td><strong>${s.fullName || s.username || '—'}</strong></td>
            <td class="text-muted">${s.email || '—'}</td>
            <td>${s.department || '—'}</td>
            <td>${s.departmentRole || '—'}</td>
            <td><span class="badge badge-cyan">Active</span></td>
        </tr>`).join('');
}

function renderUpcomingEvents(events) {
    const container = document.getElementById('upcomingEvents');
    const colors = ['cyan', 'purple', 'pink', 'cyan'];
    if (!events.length) { container.innerHTML = '<div style="text-align:center;color:var(--text3);font-size:13px;padding:20px;">No upcoming events</div>'; return; }
    container.innerHTML = events.map((ev, i) => `
        <div class="event-item">
            <div class="event-dot ${colors[i % colors.length]}"></div>
            <div style="flex-grow: 1;">
                <div class="event-name">${ev.title || '—'}</div>
                <div class="event-date">${ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : '—'} • ${ev.mode || ev.event_mode || 'TBD'}</div>
            </div>
            <div style="font-size: 9px; color: var(--pink); border-left: 1px solid rgba(255,255,255,0.05); padding-left: 8px;">
                ${ev.hostDept || ev.host_dept || '—'}
            </div>
        </div>`).join('');
}

function renderAttendanceChart(events, attendance) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    const labels = events.length ? events.map(e => (e.title?.length > 16 ? e.title.substring(0, 16) + '...' : e.title) || 'Event') : ['No Events'];
    const data = events.map(e => attendance.filter(a => a.eventId === e.id && (a.status === 'PRESENT' || a.status === 'LATE')).length);

    const presentData = events.map(e => attendance.filter(a => a.eventId === e.id && a.status === 'PRESENT').length);
    const lateData    = events.map(e => attendance.filter(a => a.eventId === e.id && a.status === 'LATE').length);
    const absentData  = events.map(e => attendance.filter(a => a.eventId === e.id && a.status === 'ABSENT').length);

    const gPres = ctx.createLinearGradient(0, 0, 0, 400); 
    gPres.addColorStop(0, '#10b981'); gPres.addColorStop(1, 'rgba(16, 185, 129, 0.2)');

    const gLate = ctx.createLinearGradient(0, 0, 0, 400); 
    gLate.addColorStop(0, '#f59e0b'); gLate.addColorStop(1, 'rgba(245, 158, 11, 0.2)');

    const gAbs = ctx.createLinearGradient(0, 0, 0, 400); 
    gAbs.addColorStop(0, '#f43f5e'); gAbs.addColorStop(1, 'rgba(244, 63, 94, 0.2)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Present',
                    data: presentData,
                    backgroundColor: gPres,
                    borderColor: '#10b981',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: '#10b981'
                },
                {
                    label: 'Late',
                    data: lateData,
                    backgroundColor: gLate,
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: '#f59e0b'
                },
                {
                    label: 'Absent',
                    data: absentData,
                    backgroundColor: gAbs,
                    borderColor: '#f43f5e',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: '#f43f5e'
                }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            animation: { duration: 1500, easing: 'easeOutElastic' },
            plugins: { 
                legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', font: { size: 10, family: 'Inter' }, usePointStyle: true, padding: 15 } },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleFont: { size: 12, family: 'Inter' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 4
                }
            },
            scales: {
                x: { stacked: true, ticks: { color: '#64748b', font: { size: 10, family: 'Inter' } }, grid: { display: false } },
                y: { stacked: true, ticks: { color: '#64748b', font: { size: 10, family: 'Inter' } }, grid: { color: 'rgba(255,255,255,0.02)', drawBorder: false }, beginAtZero: true }
            }
        }
    });
}

loadDashboard();
