document.addEventListener('DOMContentLoaded', () => {
  fetchUserProfile();

  // Edit Username Logic
  const editUserBtn = document.getElementById('edit-username-btn');
  if (editUserBtn) {
    editUserBtn.addEventListener('click', () => {
      const newUsername = prompt("Enter your new username:");
      if (!newUsername) return;

      const token = localStorage.getItem('token');
      fetch('/api/users/profile/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newUsername })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) return alert(data.error);
        localStorage.setItem('token', data.token); // Save the fresh token
        alert(data.message);
        fetchUserProfile(); // Refresh the display
      });
    });
  }

  // Reset Password Logic
  const resetPassBtn = document.getElementById('reset-password-btn');
  if (resetPassBtn) {
    resetPassBtn.addEventListener('click', () => {
      const newPassword = prompt("Enter your new password:");
      if (!newPassword) return;

      const token = localStorage.getItem('token');
      fetch('/api/users/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ newPassword })
      })
      .then(res => res.json())
      .then(data => alert(data.error ? data.error : data.message));
    });
  }

  // View Posts Logic
  const viewPostsBtn = document.getElementById('view-posts-btn');
  if (viewPostsBtn) {
    viewPostsBtn.addEventListener('click', () => {
      const token = localStorage.getItem('token');
      // Decode JWT to get username
      const username = document.getElementById('username-display').textContent.replace('Username: ', '');
      
      fetch(`/api/items?user=${username}`)
      .then(res => res.json())
      .then(posts => {
        const area = document.getElementById('user-posts-area');
        area.innerHTML = `<h3>Found ${posts.length} Posts:</h3>`;
        posts.forEach(p => {
          area.innerHTML += `<div style="background: white; padding: 10px; margin-bottom: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <strong>${p.title}</strong><br>
            Status: ${p.status}
          </div>`;
        });
      });
    });
  }
  
  
  // Handle Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Tell the backend we are logging out
      fetch('/api/users/logout', { method: 'POST' })
        .then(() => {
          // Destroy the token in the browser
          localStorage.removeItem('token');
          alert('You have been successfully logged out.');
          window.location.href = '/login.html';
        })
        .catch(err => console.error('Logout error:', err));
    });
  }
});

function fetchUserProfile() {
  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  fetch('/api/users/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        localStorage.removeItem('token');
        alert("Session expired or user data reset. Please log in again.");
        window.location.href = "/login.html";
        throw new Error('Unauthorized or invalid user');
      }
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    })
    .then(user => {
      const usernameDisplay = document.getElementById('username-display');
      if (usernameDisplay) {
        usernameDisplay.textContent = `Username: ${user.username}`;
      }
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
      const usernameDisplay = document.getElementById('username-display');
      if (usernameDisplay) {
        usernameDisplay.textContent = "Error loading profile.";
      }
    });
}