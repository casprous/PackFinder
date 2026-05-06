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

// Global Offline/Online Event Listeners

function updateOnlineStatus() {
  const existingBanner = document.getElementById('offline-banner');
  
  if (!navigator.onLine) {
    if (!existingBanner) {
      const banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; margin-right:8px;">wifi_off</span> You are currently offline. Some features may be limited.';
      banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background-color:#333; color:white; text-align:center; padding:10px; z-index:9999; font-weight:bold; display:flex; justify-content:center; align-items:center;';
      document.body.prepend(banner);
    }
  } else {
    if (existingBanner) {
      existingBanner.remove();
    }
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Check once on load just in case they loaded the app while already offline
updateOnlineStatus();

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered successfully.', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

