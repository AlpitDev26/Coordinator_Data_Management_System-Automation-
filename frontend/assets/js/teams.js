/* teams.js */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';

// Set user info
const username = localStorage.getItem('username') || 'Admin';
const sidebarName = document.getElementById('sidebarUsername');
const avatar = document.getElementById('avatarInitial');
if (sidebarName) sidebarName.textContent = username;
if (avatar) avatar.textContent = username.charAt(0).toUpperCase();

document.getElementById('logoutBtn').addEventListener('click', () => { 
    localStorage.clear(); 
    window.location.href = 'index.html'; 
});

let allTeams = [];
let allStudents = [];
let editingId = null;

async function init() {
    await Promise.all([loadTeams(), loadStudents()]);
}

async function loadTeams() {
    try {
        allTeams = await API.request('/teams');
        renderTable(allTeams);
    } catch (e) {
        document.getElementById('teamsBody').innerHTML =
            '<tr><td colspan="5" style="text-align:center;color:var(--pink);padding:30px;">Could not load teams.</td></tr>';
    }
}

async function loadStudents() {
    try {
        allStudents = await API.request('/students');
        renderStudentCheckboxes();
    } catch (e) { console.error('Failed to load students'); }
}

function renderTable(teams) {
    document.getElementById('totalCount').textContent = teams.length;
    const body = document.getElementById('teamsBody');
    if (!teams.length) {
        body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:40px;">No teams found.</td></tr>';
        return;
    }
    body.innerHTML = teams.map((t, i) => `
        <tr class="glass-hover">
            <td class="text-muted">${i + 1}</td>
            <td><strong>${t.name}</strong></td>
            <td class="text-muted" style="max-width:300px;">${t.description || '—'}</td>
            <td>
                <span class="badge badge-purple">
                    <i class="fa-solid fa-user-group" style="margin-right:5px; font-size:10px;"></i>
                    ${t.members ? t.members.length : 0} Members
                </span>
            </td>
            <td style="display:flex;gap:8px;">
                <button class="btn btn-outline" style="padding:6px 12px; font-size:11px;" onclick="editTeam(${t.id})">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-danger" style="padding:6px 12px; font-size:11px; color: #fff;" onclick="deleteTeam(${t.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>`).join('');
}

function renderStudentCheckboxes(currentTeamMemberIds = []) {
    const container = document.getElementById('studentCheckboxes');
    if (!allStudents.length) {
        container.innerHTML = '<div style="font-size:12px;color:var(--text3); text-align:center; padding:10px;">No students registered yet</div>';
        return;
    }

    // Get all student IDs already in OTHER teams
    const allBusyIds = [];
    allTeams.forEach(t => {
        if (editingId && t.id === editingId) return; // Skip current team
        if (t.members) {
            t.members.forEach(m => allBusyIds.push(m.id));
        }
    });

    container.innerHTML = allStudents.map(s => {
        const isInOtherTeam = allBusyIds.includes(s.id);
        const isCurrentlyInTeam = currentTeamMemberIds.includes(s.id);

        if (isInOtherTeam) return ''; // Hide students already in other teams

        return `
            <label style="display:flex; align-items:center; gap:12px; margin-bottom:10px; cursor:pointer; font-size:13px; padding:8px; border-radius:4px; transition: background 0.2s;" class="student-label-hover">
                <input type="checkbox" name="members" value="${s.id}" ${isCurrentlyInTeam ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--cyan);">
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:500;">${s.fullName}</span>
                    <span style="font-size:11px; color:var(--text3);">${s.clubDept} • ${s.department}</span>
                </div>
            </label>
        `;
    }).join('');
    
    if (!container.innerHTML.trim()) {
        container.innerHTML = '<div style="font-size:12px;color:var(--text3); text-align:center; padding:10px;">No available students</div>';
    }
}

function openModal(id = null) {
    editingId = id;
    document.getElementById('modalTitle').textContent = id ? 'EDIT TEAM' : 'CREATE TEAM';
    document.getElementById('teamForm').reset();
    
    let currentMemberIds = [];
    if (id) {
        const t = allTeams.find(x => x.id === id);
        if (t) {
            document.getElementById('teamName').value = t.name;
            document.getElementById('description').value = t.description || '';
            currentMemberIds = t.members ? t.members.map(m => m.id) : [];
        }
    }

    renderStudentCheckboxes(currentMemberIds);
    document.getElementById('teamModal').classList.add('active');
}

function closeModal() {
    document.getElementById('teamModal').classList.remove('active');
    editingId = null;
}

document.getElementById('teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('teamName').value.trim();
    if (!name) return;

    const selectedMembers = Array.from(document.querySelectorAll('input[name="members"]:checked')).map(c => parseInt(c.value));

    const payload = {
        name,
        description: document.getElementById('description').value.trim(),
        memberIds: selectedMembers
    };

    try {
        const btn = document.getElementById('saveTeamBtn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        if (editingId) {
            await API.request('/teams/' + editingId, { method: 'PUT', body: JSON.stringify(payload) });
            API.showToast('Team updated successfully!', 'success');
        } else {
            await API.request('/teams', { method: 'POST', body: JSON.stringify(payload) });
            API.showToast('Team created!', 'success');
        }

        closeModal();
        loadTeams();
    } catch (err) {
    } finally {
        const btn = document.getElementById('saveTeamBtn');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Team';
    }
});

async function deleteTeam(id) {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
        await API.request('/teams/' + id, { method: 'DELETE' });
        API.showToast('Team disbanded.', 'success');
        loadTeams();
    } catch (e) {
    }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allTeams.filter(t => 
        t.name.toLowerCase().includes(term) || 
        (t.description && t.description.toLowerCase().includes(term))
    );
    renderTable(filtered);
});

function editTeam(id) {
    openModal(id);
}

init();
