document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const loginBtn = form?.querySelector('button[type="submit"]');

  if (!form || !loginBtn) return;

  form.onsubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    loginBtn.disabled = true; // Disable button to prevent multiple submits
    loginBtn.textContent = 'กำลังเข้าสู่ระบบ...'; // Show loading text

    const username = form.username.value;
    const password = form.password.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }) // Send login data to API
      });

      if (res.ok) {
        window.location.href = 'dashboard.html'; // Redirect on success
      } else {
        alert('Invalid username or password');
        loginBtn.disabled = false; // Re-enable button
        loginBtn.textContent = 'Login';
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
      console.error(err);
      loginBtn.disabled = false; // Re-enable button
      loginBtn.textContent = 'Login';
    }
  };
});