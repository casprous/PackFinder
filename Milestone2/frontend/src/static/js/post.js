document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-post-form');
  let selectedLat = null;
  let selectedLng = null;

  // Initialize Leaflet Map for Pin Dropping
  const mapPreview = document.getElementById('post-map-preview');
  if (mapPreview) {
    const map = L.map('post-map-preview').setView([35.7847, -78.6821], 15);
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    let currentMarker = null;

    // Listen for clicks on the map to drop a pin
    map.on('click', function(e) {
      selectedLat = e.latlng.lat;
      selectedLng = e.latlng.lng;
      
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }
      currentMarker = L.marker(e.latlng).addTo(map);
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to create a post.");
        window.location.href = '/login.html';
        return;
      }

      // Use FormData instead of JSON to handle the file upload
      const formData = new FormData();
      formData.append('title', document.getElementById('title').value);
      formData.append('description', document.getElementById('description').value);
      formData.append('location', document.getElementById('location').value);
      formData.append('status', document.getElementById('status').value);
      
      // Append coordinates if the user dropped a pin
      if (selectedLat) formData.append('lat', selectedLat);
      if (selectedLng) formData.append('lng', selectedLng);

      // Attach the image file if one was selected
      const fileInput = document.getElementById('image-upload');
      if (fileInput.files.length > 0) {
        formData.append('image', fileInput.files[0]);
      }

      // Send POST request
      fetch('/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create post');
        return response.json();
      })
      .then(data => {
        alert(data.message); 
        window.location.href = '/forum.html'; 
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to post item.');
      });
    });
  }
});