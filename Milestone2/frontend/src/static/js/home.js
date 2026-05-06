// fetches data from the API to populate the sneakpeek sections on the Home page

document.addEventListener('DOMContentLoaded', () => {
  fetchForumSneakpeek();
  fetchMapSneakpeek();
});

// forum sneakpeek
function fetchForumSneakpeek() {
  const container = document.getElementById('forum-sneakpeek');
  if (!container) return;

  fetch('/api/items')
    .then(r => {
      if (!r.ok) throw new Error('Failed to fetch posts');
      return r.json();
    })
    .then(posts => {
      if (!posts.length) {
        container.innerHTML = '<p class="sneakpeek-empty">No posts yet. Be the first to post!</p>';
        return;
      }

      // showing the 3 most recent posts
      const recent = posts.slice(-3).reverse();
      container.innerHTML = '';

      recent.forEach(post => {
        const statusClass = (post.status || 'lost').toLowerCase().replace(' ', '-');
        const card = document.createElement('div');
        card.className = 'sneakpeek-card';
        card.innerHTML = `
          <div class="sneakpeek-card-header">
            <span class="sneakpeek-status status-${statusClass}">${post.status || 'lost'}</span>
            <span class="sneakpeek-user">${post.user || 'Anonymous'}</span>
          </div>
          <div class="sneakpeek-title">${post.title}</div>
          <div class="sneakpeek-location">📍 ${post.location || 'Unknown location'}</div>
        `;
        // clicking the card navigates to the forum
        card.addEventListener('click', () => { window.location.href = 'forum.html'; });
        container.appendChild(card);
      });
    })
    .catch(() => {
      container.innerHTML = '<p class="sneakpeek-empty">Could not load posts.</p>';
    });
}

// map sneakpeek
function fetchMapSneakpeek() {
  const container = document.getElementById('map-sneakpeek');
  if (!container) {
    return;
  }

  fetch('/api/locations/desks')
    .then(r => {
      if (!r.ok) throw new Error('Failed to fetch desks');
      return r.json();
    })
    .then(desks => {
      if (!desks.length) {
        container.innerHTML = '<p class="sneakpeek-empty">No desk locations available.</p>';
        return;
      }

      container.innerHTML = '';

      desks.forEach(desk => {
        const card = document.createElement('div');
        card.className = 'sneakpeek-card';
        card.innerHTML = `
          <div class="sneakpeek-card-header">
            <span class="sneakpeek-status status-desk">L&amp;F Desk</span>
          </div>
          <div class="sneakpeek-title">${desk.name}</div>
          <div class="sneakpeek-location">🗺️ ${desk.coordinates.lat.toFixed(4)}, ${desk.coordinates.lng.toFixed(4)}</div>
        `;
        // clicking navigates to the full map
        card.addEventListener('click', () => { window.location.href = 'map.html'; });
        container.appendChild(card);
      });

      const viewMore = document.createElement('a');
      viewMore.className = 'sneakpeek-view-more';
      viewMore.href = 'map.html';
      viewMore.textContent = 'Open interactive map →';
      container.appendChild(viewMore);
    })
    .catch(() => {
      container.innerHTML = '<p class="sneakpeek-empty">Could not load map data.</p>';
    });
}