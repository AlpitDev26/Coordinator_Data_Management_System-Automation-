/* otp.js */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-tab between OTP inputs
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((inp, idx) => {
        inp.addEventListener('input', () => {
            if (inp.value && idx < otpInputs.length - 1) otpInputs[idx + 1].focus();
        });
        inp.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !inp.value && idx > 0) otpInputs[idx - 1].focus();
        });
    });

    document.getElementById('otpForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const otp = Array.from(otpInputs).map(i => i.value).join('');
        const email = sessionStorage.getItem('resetEmail') || '';
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const alertBox = document.getElementById('alertBox');
        const btn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const spinner = document.getElementById('spinner');

        alertBox.classList.remove('show');

        if (otp.length < 6) { alertBox.classList.add('show'); document.getElementById('alertMsg').textContent = 'Please enter the full 6-digit OTP.'; return; }
        if (newPassword !== confirmPassword) { alertBox.classList.add('show'); document.getElementById('alertMsg').textContent = 'Passwords do not match.'; return; }
        if (newPassword.length < 8) { alertBox.classList.add('show'); document.getElementById('alertMsg').textContent = 'Password must be at least 8 characters.'; return; }

        btn.style.pointerEvents = 'none';
        btnText.textContent = 'VERIFYING...';
        spinner.classList.add('active');

        try {
            await API.request('/password/reset', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) });
            btn.style.background = 'linear-gradient(90deg,#00ff88,#00cc66)';
            btnText.textContent = 'PASSWORD RESET!';
            spinner.classList.remove('active');
            sessionStorage.removeItem('resetEmail');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } catch (err) {
            alertBox.classList.add('show');
            document.getElementById('alertMsg').textContent = err.data?.message || 'Invalid or expired OTP.';
            spinner.classList.remove('active');
            btnText.textContent = 'RESET PASSWORD';
            btn.style.pointerEvents = '';
        }
    });
});
