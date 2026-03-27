/* attendance.js */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

async function loadEvents() {
    try {
        const events = await API.request('/events');
        const filter = document.getElementById('eventFilter');
        const markEvent = document.getElementById('markEvent');
        events.forEach(e => {
            filter.appendChild(new Option(e.title, e.id));
            markEvent.appendChild(new Option(e.title, e.id));
        });
    } catch (e) { console.error(e); }
}

let allStudentsCount = 0;
async function loadStudents() {
    try {
        const students = await API.request('/students');
        allStudentsCount = students.length;
        const sel = document.getElementById('markStudent');
        students.forEach(s => sel.appendChild(new Option(s.fullName + ' (' + s.clubDept + ')', s.id)));
    } catch (e) { console.error(e); }
}

async function loadAttendance() {
    const eventId = document.getElementById('eventFilter').value;
    const body = document.getElementById('attendanceBody');

    if (!eventId) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:40px;">Select an event to view attendance.</td></tr>';
        document.getElementById('totalPresent').textContent = '—';
        document.getElementById('totalAbsent').textContent = '—';
        document.getElementById('attendanceRate').textContent = '—';
        return;
    }

    try {
        const records = await API.request('/attendance/event/' + eventId);
        const presentCount = records.filter(r => r.status === 'PRESENT').length;
        const lateCount = records.filter(r => r.status === 'LATE').length;
        const totalPresent = presentCount + lateCount;
        
        // Accurate stats relative to total club members
        const denominator = allStudentsCount || records.length || 1;
        const absentCount = denominator - totalPresent;

        document.getElementById('totalPresent').textContent = totalPresent;
        document.getElementById('totalAbsent').textContent = absentCount;
        document.getElementById('attendanceRate').textContent = Math.round((totalPresent / denominator) * 100) + '%';

        if (!records.length) {
            body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px;">No records for this event.</td></tr>';
            return;
        }

        body.innerHTML = records.map((r, i) => {
            let badgeClass = 'badge-green';
            if (r.status === 'ABSENT') badgeClass = 'badge-pink';
            else if (r.status === 'LATE') badgeClass = 'badge-purple';
            
            return `<tr>
                <td class="text-muted">${i + 1}</td>
                <td><strong>${r.studentName || '—'}</strong></td>
                <td class="text-cyan">${r.studentClubDept || '—'}</td>
                <td>${r.eventTitle || '—'}</td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td class="text-muted">${r.recordedAt ? new Date(r.recordedAt).toLocaleString() : '—'}</td>
                <td><button class="btn btn-danger" style="padding:5px 10px;font-size:10px;" onclick="deleteRecord(${r.id})"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        }).join('');
    } catch (e) {
        console.error(e);
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--pink);padding:30px;">Error loading data</td></tr>';
    }
}

function openMarkModal() { document.getElementById('markModal').classList.add('active'); }
function closeMarkModal() { document.getElementById('markModal').classList.remove('active'); }

document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const eventId = document.getElementById('markEvent').value;
    const studentId = document.getElementById('markStudent').value;
    const status = document.getElementById('markStatus').value;

    if (!eventId || !studentId || !status) {
        API.showToast('Please select all required fields.', 'error');
        return;
    }

    const payload = {
        eventId: parseInt(eventId),
        studentId: parseInt(studentId),
        status: status
    };

    try {
        await API.request('/attendance', { method: 'POST', body: JSON.stringify(payload) });
        API.showToast('Attendance recorded!', 'success');
        
        // Auto-select the event in the filter if it's currently empty or different
        const filter = document.getElementById('eventFilter');
        if (!filter.value || filter.value != payload.eventId) {
            filter.value = payload.eventId;
        }
        
        closeMarkModal();
        loadAttendance();
    } catch (err) {}
});

async function deleteRecord(id) {
    if (!confirm('Remove this attendance record?')) return;
    try {
        await API.request('/attendance/' + id, { method: 'DELETE' });
        API.showToast('Record removed.', 'success');
        loadAttendance();
    } catch (e) {}
}

loadEvents(); loadStudents();
