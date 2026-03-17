/* students.js */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });
const av = document.getElementById('avatarInitial');
if (av) av.textContent = (localStorage.getItem('username') || 'A').charAt(0).toUpperCase();

let allStudents = [];
let editingId = null;

async function loadStudents() {
    try {
        allStudents = await API.request('/students');
        renderTable(allStudents);
    } catch (e) {
        document.getElementById('studentsBody').innerHTML =
            '<tr><td colspan="7" style="text-align:center;color:var(--pink);padding:30px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:8px;"></i>Could not load students. Is the backend running?</td></tr>';
    }
}

function renderTable(students) {
    document.getElementById('totalCount').textContent = students.length;
    const body = document.getElementById('studentsBody');
    if (!students.length) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px;">No students found.</td></tr>'; return;
    }
    body.innerHTML = students.map((s, i) => `
        <tr>
            <td class="text-muted" style="font-size:12px;">${i + 1}</td>
            <td><strong>${s.fullName || '—'}</strong></td>
            <td><span class="badge badge-cyan">${s.rollNumber || '—'}</span></td>
            <td class="text-muted">${s.email || '—'}</td>
            <td>${s.department || '—'}</td>
            <td>${s.registrationYear || '—'}</td>
            <td style="display:flex;gap:6px;">
                <button class="btn btn-outline" style="padding:5px 10px;font-size:11px;" onclick="editStudent(${s.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" style="padding:5px 10px;font-size:11px;" onclick="deleteStudent(${s.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`).join('');
}

function filterStudents() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const dept = document.getElementById('deptFilter').value;
    let filtered = allStudents.filter(s => {
        const match = !q || (s.fullName || '').toLowerCase().includes(q) || (s.rollNumber || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q);
        const deptMatch = !dept || s.department === dept;
        return match && deptMatch;
    });
    renderTable(filtered);
}

function openModal(id = null) {
    editingId = id;
    document.getElementById('modalTitle').textContent = id ? 'EDIT STUDENT' : 'ADD STUDENT';
    document.getElementById('studentForm').reset();
    if (id) {
        const s = allStudents.find(x => x.id === id);
        if (s) { document.getElementById('fullName').value = s.fullName; document.getElementById('email').value = s.email; document.getElementById('rollNumber').value = s.rollNumber; document.getElementById('department').value = s.department; document.getElementById('registrationYear').value = s.registrationYear; document.getElementById('phoneNumber').value = s.phoneNumber; }
    }
    document.getElementById('studentModal').classList.add('active');
}
function closeModal() { document.getElementById('studentModal').classList.remove('active'); editingId = null; }

document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const rollNumber = document.getElementById('rollNumber').value.trim();
    const department = document.getElementById('department').value;
    const registrationYear = document.getElementById('registrationYear').value;

    // Validation
    if (!fullName || !email || !rollNumber || !department) {
        API.showToast('Please fill in all required fields.', 'error');
        return;
    }

    if (!email.includes('@')) {
        API.showToast('Please enter a valid email address.', 'error');
        return;
    }

    const payload = { 
        fullName, 
        email, 
        rollNumber, 
        department, 
        registrationYear: parseInt(registrationYear) || null, 
        phoneNumber: document.getElementById('phoneNumber').value.trim() 
    };

    try {
        const btn = document.getElementById('saveStudentBtn');
        btn.disabled = true;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        if (editingId) {
            await API.request('/students/' + editingId, { method: 'PUT', body: JSON.stringify(payload) });
            API.showToast('Student profile updated!', 'success');
        } else {
            await API.request('/students', { method: 'POST', body: JSON.stringify(payload) });
            API.showToast('Student added successfully!', 'success');
        }
        closeModal();
        loadStudents();
    } catch (err) {
        // Error toast is handled by API.request
    } finally {
        const btn = document.getElementById('saveStudentBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Student';
    }
});

async function editStudent(id) { openModal(id); }
async function deleteStudent(id) {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    try { 
        await API.request('/students/' + id, { method: 'DELETE' }); 
        API.showToast('Student deleted successfully!', 'success');
        loadStudents(); 
    }
    catch (e) {}
}

loadStudents();
