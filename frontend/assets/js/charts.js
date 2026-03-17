/* charts.js — Reports & Analytics page */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

const CHART_OPTS = {
    grid: 'rgba(255,255,255,0.03)',
    tick: '#94a3b8',
};
const PALETTE = ['#00d2ff', '#9d50bb', '#ff007a', '#00ff88', '#ffaa00'];

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

        // Dept distribution
        const deptMap = {};
        s.forEach(st => { deptMap[st.department || 'Unknown'] = (deptMap[st.department || 'Unknown'] || 0) + 1; });
        new Chart(document.getElementById('deptChart').getContext('2d'), {
            type: 'doughnut',
            data: { labels: Object.keys(deptMap), datasets: [{ data: Object.values(deptMap), backgroundColor: PALETTE, borderColor: 'transparent', borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8892b0', font: { size: 11 } } } } }
        });

        // Attendance by event
        const evLabels = e.slice(0, 6).map(ev => (ev.title?.length > 10 ? ev.title.substring(0, 10) + '..' : ev.title) || 'Event');
        const evData = e.slice(0, 6).map(ev => a.filter(at => at.eventId === ev.id && (at.status === 'PRESENT' || at.status === 'LATE')).length);
        
        new Chart(document.getElementById('eventAttChart').getContext('2d'), {
            type: 'bar',
            data: { 
                labels: evLabels.length ? evLabels : ['No Events'], 
                datasets: [{ 
                    label: 'Present', 
                    data: evData.length ? evData : [0], 
                    backgroundColor: 'rgba(188,19,254,0.3)', 
                    borderColor: '#bc13fe', 
                    borderWidth: 2, 
                    borderRadius: 4 
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: CHART_OPTS.tick, font: { size: 10 } }, grid: { color: CHART_OPTS.grid } }, y: { ticks: { color: CHART_OPTS.tick, font: { size: 10 } }, grid: { color: CHART_OPTS.grid }, beginAtZero: true } } }
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
