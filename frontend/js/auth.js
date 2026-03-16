const API_URL = 'http://localhost:8080/api/auth';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const alertBox = document.getElementById('alert');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');

    // Reset state
    alertBox.style.display = 'none';
    btnText.style.display = 'none';
    spinner.style.display = 'block';

    try {
        const response = await fetch(`${API_URL}/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store JWT and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                username: data.username,
                email: data.email,
                roles: data.roles
            }));

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        alertBox.textContent = error.message;
        alertBox.style.display = 'block';
    } finally {
        btnText.style.display = 'block';
        spinner.style.display = 'none';
    }
});

// Check if already logged in
if (localStorage.getItem('token') && window.location.pathname.endsWith('index.html')) {
    window.location.href = 'dashboard.html';
}
