/* ============================================================
   API.JS — Core fetch wrapper with automatic JWT injection
   ============================================================ */
const API_BASE = 'http://localhost:8080/api';

const API = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('jwt_token');
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

            // Token expired or invalid — redirect to login
            if (res.status === 401 || res.status === 403) {
                if (!window.location.pathname.includes('index.html') &&
                    !window.location.pathname.includes('forgot') &&
                    !window.location.pathname.includes('otp')) {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            }

            const contentType = res.headers.get('content-type') || '';
            const data = contentType.includes('application/json') ? await res.json() : await res.text();

            if (!res.ok) throw { status: res.status, data };
            return data;
        } catch (err) {
            console.error(`[API] Error on ${endpoint}:`, err);
            const msg = err.data?.message || err.data || 'Connection Error';
            this.showToast(msg, 'error');
            throw err;
        }
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle');
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
