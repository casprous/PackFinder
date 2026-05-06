// static/js/forum.js

// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {
  fetchPosts();
});

function fetchPosts() {
  // Fetch data from newly created backend API endpoint
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

  // Clear out any hardcoded HTML posts inside the container
  postList.innerHTML = '';

  // Iterate through the JSON data and build the HTML for each post
  posts.forEach(post => {
    // Clone the template element from forum.html
    const clone = template.content.cloneNode(true);

    // Populate the user string
    clone.querySelector('.user').textContent = post.user;

    // Construct the content area dynamically
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

    const status = document.createElement('p');
    status.innerHTML = `<strong>Status:</strong> ${post.status}`;
    contentDiv.appendChild(status);

    // Append the newly populated post to the visible list
    postList.appendChild(clone);
  });
}