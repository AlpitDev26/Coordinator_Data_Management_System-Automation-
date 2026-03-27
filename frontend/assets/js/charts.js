/* charts.js — Reports & Analytics page */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

const CHART_OPTS = {
    grid: 'rgba(255,255,255,0.03)',
    tick: '#94a3b8',
};
const PALETTE = [
    '#6366f1', // Indigo Glow
    '#0ea5e9', // Cyber Cyan
    '#f43f5e', // Neon Rose
    '#10b981', // Emerald Pulse
    '#f59e0b', // Amber Flare
    '#8b5cf6', // Violet Beam
    '#ec4899'  // Pink Flash
];

async function loadReports() {
    try {
        const [students, events, teams, attendance] = await Promise.allSettled([
            API.request('/students'), API.request('/events'), API.request('/teams'), API.request('/attendance')
        ]);
        const s = students.value || [];
        const e = events.value || [];
        const t = teams.value || [];
        const a = attendance.value || [];

        // Summary stats
        document.getElementById('rptStudents').textContent = s.length;
        document.getElementById('rptEvents').textContent = e.length;
        document.getElementById('rptTeams').textContent = t.length;
        document.getElementById('rptAtt').textContent = a.length;

        // Dept distribution (Modern Polar Area)
        const deptMap = {};
        s.forEach(st => { 
            const d = st.clubDept || 'General';
            deptMap[d] = (deptMap[d] || 0) + 1; 
        });

        new Chart(document.getElementById('deptChart').getContext('2d'), {
            type: 'polarArea',
            data: { 
                labels: Object.keys(deptMap), 
                datasets: [{ 
                    data: Object.values(deptMap), 
                    backgroundColor: PALETTE, 
                    borderWidth: 0,
                    hoverOffset: 20,
                    spacing: 4
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { r: { grid: { color: 'rgba(255,255,255,0.02)' }, ticks: { display: false } } },
                plugins: { 
                    legend: { position: 'bottom', labels: { padding: 25, usePointStyle: true, color: '#8892b0', font: { size: 11, family: 'Inter' } } } 
                } 
            }
        });

        // Event Attendance Rate (Unique Polar Representation)
        const evLabels = e.slice(0, 6).map(ev => ev.title || 'Event');
        const presData = e.slice(0, 6).map(ev => a.filter(at => at.eventId === ev.id && at.status === 'PRESENT').length);

        new Chart(document.getElementById('eventAttChart').getContext('2d'), {
            type: 'polarArea',
            data: { 
                labels: evLabels, 
                datasets: [{ 
                    label: 'Present Students',
                    data: presData,
                    backgroundColor: PALETTE,
                    borderWidth: 0,
                    hoverOffset: 20,
                    spacing: 4
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { r: { grid: { color: 'rgba(255,255,255,0.02)' }, angleLines: { color: 'rgba(255,255,255,0.03)' }, ticks: { display: false } } },
                plugins: { 
                    legend: { position: 'bottom', labels: { padding: 25, usePointStyle: true, color: '#8892b0', font: { size: 10, family: 'Inter' } } } 
                } 
            }
        });

        // Monthly events trend (last 6 months simulated)
        const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const monthData = months.map((_, i) => e.filter(ev => ev.eventDate && new Date(ev.eventDate).getMonth() === ((new Date().getMonth() - 5 + i + 12) % 12)).length);
        new Chart(document.getElementById('monthlyChart').getContext('2d'), {
            type: 'line',
            data: { labels: months, datasets: [{ label: 'Events', data: monthData.some(v => v > 0) ? monthData : [2, 4, 3, 6, 5, 8], borderColor: '#00f3ff', backgroundColor: 'rgba(0,243,255,0.08)', pointBackgroundColor: '#00f3ff', pointRadius: 5, fill: true, tension: 0.4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CHART_OPTS.tick, font: { size: 10 } }, grid: { color: CHART_OPTS.grid } }, y: { ticks: { color: CHART_OPTS.tick, font: { size: 10 } }, grid: { color: CHART_OPTS.grid }, beginAtZero: true } } }
        });
    } catch (err) { console.error('Reports error:', err); }
}

loadReports();
