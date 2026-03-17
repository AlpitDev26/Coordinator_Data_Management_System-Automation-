/* ============================================================
   AUTH.JS — Login Page Logic
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (localStorage.getItem('jwt_token')) window.location.href = 'dashboard.html';

    // Password toggle
    document.getElementById('togglePass').addEventListener('click', function () {
        const inp = document.getElementById('password');
        const icon = document.getElementById('eyeIcon');
        if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fa-regular fa-eye-slash'; }
        else { inp.type = 'password'; icon.className = 'fa-regular fa-eye'; }
    });

    // Login form submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const alertBox = document.getElementById('alertBox');
        const btn = document.getElementById('loginBtn');
        const btnText = document.getElementById('btnText');
        const btnIcon = document.getElementById('btnIcon');
        const spinner = document.getElementById('loginSpinner');

        // Reset
        alertBox.classList.remove('show');

        // Loading state
        btn.classList.add('loading');
        btnIcon.classList.add('fa-hidden');
        btnText.textContent = 'AUTHENTICATING...';
        spinner.classList.add('active');

        try {
            const res = await API.request('/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            // Store token and user data
            localStorage.setItem('jwt_token', res.token || res);
            localStorage.setItem('username', res.username || username);
            localStorage.setItem('roles', JSON.stringify(res.roles || []));

            // Success animation
            btn.style.background = 'linear-gradient(90deg,#00ff88,#00cc66)';
            btnText.textContent = 'ACCESS GRANTED';
            spinner.classList.remove('active');
            btnIcon.className = 'fa-solid fa-check';
            btnIcon.classList.remove('fa-hidden');

            setTimeout(() => window.location.href = 'dashboard.html', 800);

        } catch (err) {
            btn.classList.remove('loading');
            spinner.classList.remove('active');
            btnIcon.className = 'fa-solid fa-right-to-bracket';
            btnIcon.classList.remove('fa-hidden');
            btnText.textContent = 'INITIALIZE ACCESS';
            btn.style.background = '';

            // Show error
            alertBox.classList.add('show');
            const alertMsg = document.getElementById('alertMsg');
            if (err.status === 401 || err.status === 403) alertMsg.textContent = 'Invalid username or password.';
            else if (err.data?.message) alertMsg.textContent = err.data.message;
            else alertMsg.textContent = 'Cannot connect to backend. Ensure the server is running on port 8080.';
        }
    });
});
