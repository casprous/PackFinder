document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent standard HTML form submission
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message); // "Login successful"
        window.location.href = "forum.html";
      })
      .catch(error => console.error('Error logging in:', error));
    });
  }
});