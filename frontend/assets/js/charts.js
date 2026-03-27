/* charts.js — Reports & Analytics page */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

const CHART_OPTS = {
    grid: 'rgba(255,255,255,0.03)',
    tick: '#94a3b8',
};
const PALETTE = [
    '#6366f1', // Indigo
    '#0ea5e9', // Sky Blue
    '#f43f5e', // Rose
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899'  // Pink
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

        // Dept distribution (Club Dept)
        const deptMap = {};
        s.forEach(st => { 
            const d = st.clubDept || 'General';
            deptMap[d] = (deptMap[d] || 0) + 1; 
        });

        new Chart(document.getElementById('deptChart').getContext('2d'), {
            type: 'doughnut',
            data: { 
                labels: Object.keys(deptMap), 
                datasets: [{ 
                    data: Object.values(deptMap), 
                    backgroundColor: PALETTE, 
                    hoverOffset: 25,
                    borderRadius: 8,
                    spacing: 4,
                    borderWidth: 0 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                cutout: '75%',
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            padding: 25,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            color: '#94a3b8', 
                            font: { size: 11, family: 'Inter, sans-serif' } 
                        } 
                    } 
                } 
            }
        });

        // Attendance by event
        const evLabels = e.slice(0, 6).map(ev => (ev.title?.length > 10 ? ev.title.substring(0, 10) + '..' : ev.title) || 'Event');
        const evData = e.slice(0, 6).map(ev => a.filter(at => at.eventId === ev.id && (at.status === 'PRESENT' || at.status === 'LATE')).length);

        const ctxAtt = document.getElementById('eventAttChart').getContext('2d');
        const gP = ctxAtt.createLinearGradient(0, 0, 0, 400); gP.addColorStop(0, '#10b981'); gP.addColorStop(1, 'rgba(16,185,129,0.1)');
        const gL = ctxAtt.createLinearGradient(0, 0, 0, 400); gL.addColorStop(0, '#f59e0b'); gL.addColorStop(1, 'rgba(245,158,11,0.1)');
        const gA = ctxAtt.createLinearGradient(0, 0, 0, 400); gA.addColorStop(0, '#f43f5e'); gA.addColorStop(1, 'rgba(244,63,94,0.1)');

        const presData = e.slice(0, 6).map(ev => a.filter(at => at.eventId === ev.id && at.status === 'PRESENT').length);
        const latData  = e.slice(0, 6).map(ev => a.filter(at => at.eventId === ev.id && at.status === 'LATE').length);
        const absData  = e.slice(0, 6).map(ev => a.filter(at => at.eventId === ev.id && at.status === 'ABSENT').length);

        new Chart(ctxAtt, {
            type: 'bar',
            data: { 
                labels: evLabels.length ? evLabels : ['No Events'], 
                datasets: [
                    { label: 'Present', data: presData, backgroundColor: gP, borderColor: '#10b981', borderWidth: 1, borderRadius: 10, hoverBackgroundColor: '#10b981' },
                    { label: 'Late', data: latData, backgroundColor: gL, borderColor: '#f59e0b', borderWidth: 1, borderRadius: 10, hoverBackgroundColor: '#f59e0b' },
                    { label: 'Absent', data: absData, backgroundColor: gA, borderColor: '#f43f5e', borderWidth: 1, borderRadius: 10, hoverBackgroundColor: '#f43f5e' }
                ] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                animation: { duration: 1500, easing: 'easeOutElastic' },
                plugins: { 
                    legend: { display: true, position: 'bottom', labels: { color: '#64748b', font: { size: 10, family: 'Inter' }, usePointStyle: true, padding: 15 } } 
                }, 
                scales: { 
                    x: { stacked: true, ticks: { color: CHART_OPTS.tick, font: { size: 10, family: 'Inter' } }, grid: { display: false } }, 
                    y: { stacked: true, ticks: { color: CHART_OPTS.tick, font: { size: 10, family: 'Inter' } }, grid: { color: CHART_OPTS.grid, drawBorder: false }, beginAtZero: true } 
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
