document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-post-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather data from the form
      const newPost = {
        user: "@currentuser", // Hardcoded for now until full auth is built
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value
      };

      // Send POST request to API
      fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPost)
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
      })
      .then(data => {
        alert(data.message); // Show success message
        window.location.href = '/forum.html'; // Redirect back to forum feed
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to post item.');
      });
    });
  }
});