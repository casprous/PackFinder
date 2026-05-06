document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
});

function fetchPosts() {
  fetch('/api/items')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(posts => {
      renderPosts(posts);
    })
    .catch(error => {
      console.error('Error fetching posts:', error);
      const postList = document.getElementById('postList');
      postList.innerHTML = '<p>Error loading posts. Please try again later.</p>';
    });
}

function renderPosts(posts) {
  const postList = document.getElementById('postList');
  const template = document.getElementById('postTemplate');

  postList.innerHTML = '';

  posts.forEach(post => {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.user').textContent = post.user;

    const contentDiv = clone.querySelector('.content');
    
    const title = document.createElement('h3');
    title.textContent = post.title;
    contentDiv.appendChild(title);

    const description = document.createElement('p');
    description.textContent = post.description;
    contentDiv.appendChild(description);

    const location = document.createElement('p');
    location.innerHTML = `<strong>Location:</strong> ${post.location}`;
    contentDiv.appendChild(location);

    // Image Display
    const imgEl = clone.querySelector('.post-image');
    if (imgEl && post.image) {
      imgEl.src = `/api/uploads/${post.image}`;
      imgEl.style.display = 'block';
    }

    // Status Display and Update Controls
    const statusContainer = document.createElement('div');
    statusContainer.style.marginTop = '10px';
    statusContainer.style.padding = '10px';
    statusContainer.style.backgroundColor = '#f5f5f5';
    statusContainer.style.borderRadius = '4px';

    const statusText = document.createElement('p');
    statusText.innerHTML = `<strong>Current Status:</strong> <span class="status-badge" style="font-weight:bold; color:#990000;">${post.status}</span>`;
    statusText.style.marginBottom = '8px';
    statusContainer.appendChild(statusText);

    // Form to change the status
    const statusForm = document.createElement('form');
    statusForm.style.display = 'flex';
    statusForm.style.gap = '10px';
    statusForm.innerHTML = `
      <select class="status-select" style="padding: 4px; border-radius: 4px; border: 1px solid #ccc;">
        <option value="Lost" ${post.status === 'Lost' ? 'selected' : ''}>Lost</option>
        <option value="Found" ${post.status === 'Found' ? 'selected' : ''}>Found</option>
        <option value="Turned In" ${post.status === 'Turned In' ? 'selected' : ''}>Turned In</option>
      </select>
      <button type="submit" style="padding: 4px 10px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">Update Status</button>
    `;

    statusForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to update status.");
        return;
      }

      const newStatus = e.target.querySelector('.status-select').value;

      fetch(`/api/items/${post.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) alert(data.error);
        else fetchPosts(); // Refresh the feed to show new status
      });
    });

    statusContainer.appendChild(statusForm);
    contentDiv.appendChild(statusContainer);

    // Replies Display
    const repliesContainer = clone.querySelector('.replies-container');
    if (post.replies && post.replies.length > 0) {
      post.replies.forEach(reply => {
        const replyEl = document.createElement('div');
        replyEl.style.marginBottom = '8px';
        replyEl.style.fontSize = '0.9rem';
        replyEl.innerHTML = `<strong>${reply.user}</strong>: ${reply.text}`;
        if (repliesContainer) repliesContainer.appendChild(replyEl);
      });
    }

    // New Reply Submission
    const replyForm = clone.querySelector('.reply-form');
    if (replyForm) {
      replyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = e.target.querySelector('.reply-input').value;
        const token = localStorage.getItem('token');

        if (!token) {
          alert("You must be logged in to reply.");
          return;
        }

        fetch(`/api/items/${post.id}/replies`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text })
        })
        .then(res => res.json())
        .then(data => {
          if (data.error) alert(data.error);
          else fetchPosts(); 
        });
      });
    }

    postList.appendChild(clone);
  });
}