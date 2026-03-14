/* events.js */
if (!localStorage.getItem('jwt_token')) window.location.href = 'index.html';
document.getElementById('logoutBtn').addEventListener('click', () => { localStorage.clear(); window.location.href = 'index.html'; });

let allEvents = [];
let editingId = null;

async function loadEvents() {
    try {
        allEvents = await API.request('/events');
        renderTable(allEvents);
    } catch (e) {
        document.getElementById('eventsBody').innerHTML =
            '<tr><td colspan="7" style="text-align:center;color:var(--pink);padding:30px;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:8px;"></i>Could not load events. Is the backend running?</td></tr>';
    }
}

function renderTable(events) {
    document.getElementById('totalCount').textContent = events.length;
    const body = document.getElementById('eventsBody');
    if (!events.length) { body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:30px;">No events found.</td></tr>'; return; }
    body.innerHTML = events.map((ev, i) => {
        const now = new Date();
        const d = ev.eventDate ? new Date(ev.eventDate) : null;
        const status = !d ? 'Unknown' : d > now ? 'Upcoming' : 'Completed';
        const badgeClass = status === 'Upcoming' ? 'badge-cyan' : 'badge-purple';
        return `<tr>
            <td class="text-muted">${i + 1}</td>
            <td><strong>${ev.title || '—'}</strong><br><small class="text-muted">${ev.description?.substring(0, 50) || ''}</small></td>
            <td><i class="fa-regular fa-calendar-days text-cyan"></i> ${d ? d.toLocaleDateString() : '—'}</td>
            <td class="text-muted">${ev.location || '—'}</td>
            <td class="text-pink"><i class="fa-solid fa-user-shield"></i> ${ev.createdBy || 'System'}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
            <td style="display:flex;gap:6px;">
                <button class="btn btn-outline" style="padding:5px 10px;font-size:11px;" onclick="editEvent(${ev.id})"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger" style="padding:5px 10px;font-size:11px;" onclick="deleteEvent(${ev.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function openModal(id = null) {
    editingId = id;
    document.getElementById('modalTitle').textContent = id ? 'EDIT EVENT' : 'SCHEDULE EVENT';
    document.getElementById('eventForm').reset();
    if (id) {
        const ev = allEvents.find(x => x.id === id);
        if (ev) { document.getElementById('title').value = ev.title; document.getElementById('description').value = ev.description; document.getElementById('eventDate').value = ev.eventDate?.slice(0, 16) || ''; document.getElementById('location').value = ev.location; }
    }
    document.getElementById('eventModal').classList.add('active');
}
function closeModal() { document.getElementById('eventModal').classList.remove('active'); editingId = null; }

document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const eventDate = document.getElementById('eventDate').value;
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();

    if (!title || !eventDate) {
        API.showToast('Title and Date are required.', 'error');
        return;
    }

    const payload = { title, description, eventDate, location };
    try {
        const btn = e.submitter;
        if (btn) btn.disabled = true;

        if (editingId) {
            await API.request('/events/' + editingId, { method: 'PUT', body: JSON.stringify(payload) });
            API.showToast('Event updated successfully!', 'success');
        } else {
            await API.request('/events', { method: 'POST', body: JSON.stringify(payload) });
            API.showToast('Event scheduled successfully!', 'success');
        }
        closeModal();
        loadEvents();
    } catch (err) {
    } finally {
        if (e.submitter) e.submitter.disabled = false;
    }
});

function editEvent(id) { openModal(id); }
async function deleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    try { 
        await API.request('/events/' + id, { method: 'DELETE' }); 
        API.showToast('Event deleted successfully!', 'success');
        loadEvents(); 
    }
    catch (e) {}
}

document.getElementById('searchInput').addEventListener('input', () => {
    const q = document.getElementById('searchInput').value.toLowerCase();
    renderTable(allEvents.filter(e => (e.title || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q)));
});

loadEvents();
