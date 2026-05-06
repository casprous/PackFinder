document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  // UI Toggle Elements
  const loginWrapper = document.getElementById('login-wrapper');
  const registerWrapper = document.getElementById('register-wrapper');
  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');

  // Form Toggle Logic
  if (showRegisterBtn && showLoginBtn) {
    showRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginWrapper.style.display = 'none';
      registerWrapper.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      registerWrapper.style.display = 'none';
      loginWrapper.style.display = 'block';
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault(); 
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('token', data.token); 
          alert(data.message);
          // Changed redirect from forum.html to home.html
          window.location.href = "/home.html";
        } else {
          alert(data.error); 
        }
      })
      .catch(error => console.error('Error logging in:', error));
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('reg-username').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;

      fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
        } else {
          alert(data.message + " You can now log in.");
          registerForm.reset();
          // Automatically flip back to the login view after registering
          registerWrapper.style.display = 'none';
          loginWrapper.style.display = 'block';
        }
      });
    });
  }
});