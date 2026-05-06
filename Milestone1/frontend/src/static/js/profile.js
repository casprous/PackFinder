document.addEventListener('DOMContentLoaded', () => {
  fetchUserProfile();
});

function fetchUserProfile() {
  fetch('/api/users/profile')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    })
    .then(user => {
      // Update the username on the page
      const usernameDisplay = document.getElementById('username-display');
      if (usernameDisplay) {
        usernameDisplay.textContent = `Username: ${user.username}`;
      }
    })
    .catch(error => console.error('Error:', error));
}