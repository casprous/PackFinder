document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(q) ||
      post.user.toLowerCase().includes(q)
    );
    renderPosts(filtered);
  });

  // info toggle
  const infoToggle = document.getElementById('forum-info-toggle');
  const infoContent = document.getElementById('forum-info-content');
  const infoChevron = document.getElementById('forum-info-chevron');

  infoToggle.addEventListener('click', () => {
    infoContent.classList.toggle('open');
    infoChevron.classList.toggle('open');
  });

});

let allPosts = [];

function fetchPosts() {
  fetch('/api/items')
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(posts => {
      allPosts = posts;
      renderPosts(posts);
      // Save fresh data to IndexedDB
      cachePosts(posts).catch(err => console.error('IDB Cache error:', err));
    })
    .catch(error => {
      console.warn('Network failed, attempting to load from IndexedDB...');
      // Fallback to IndexedDB
      getCachedPosts().then(cachedPosts => {
        if (cachedPosts && cachedPosts.length > 0) {
          allPosts = cachedPosts;
          renderPosts(cachedPosts);
        } else {
          document.getElementById('postList').innerHTML = '<p>You are offline and have no cached posts.</p>';
        }
      });
    });
}

function renderPosts(posts) {
  const postList = document.getElementById('postList');
  const template = document.getElementById('postTemplate');

  postList.innerHTML = '';

  if (posts.length === 0) {
    postList.innerHTML = '<p style="padding: 16px; color: #666;">No posts match your search.</p>';
    return;
  }

  posts.forEach(post => {
    const clone = template.content.cloneNode(true);

    clone.querySelector('.user').textContent = post.user;

    const timeSlot = clone.querySelector('.timestamp');
    if (post.timestamp && timeSlot) {
        const dateObj = new Date(post.timestamp);
        timeSlot.textContent = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (timeSlot) {
        timeSlot.style.display = 'none';
    }
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