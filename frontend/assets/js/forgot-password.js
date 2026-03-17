/* forgot-password.js */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('forgotForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const alertBox = document.getElementById('alertBox');
        const successBox = document.getElementById('successBox');
        const btn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('spinner');

        alertBox.classList.remove('show');
        successBox.classList.remove('show');

        btn.style.pointerEvents = 'none';
        btnText.textContent = 'SENDING...';
        spinner.classList.add('active');

        try {
            await API.request('/password/forgot', { method: 'POST', body: JSON.stringify({ email }) });
            successBox.classList.add('show');
            document.getElementById('successMsg').textContent = `OTP sent to ${email}. Check your inbox.`;
            btnText.textContent = 'RESEND OTP';
            // Store email for OTP page
            sessionStorage.setItem('resetEmail', email);
            setTimeout(() => window.location.href = 'verify-otp.html', 1800);
        } catch (err) {
            alertBox.classList.add('show');
            document.getElementById('alertMsg').textContent = err.data?.message || 'Email not found in system.';
        } finally {
            spinner.classList.remove('active');
            btn.style.pointerEvents = '';
        }
    });
});
