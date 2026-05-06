// based on this tutorial: 
// https://blog.miguelgrinberg.com/post/how-to-add-a-quick-interactive-map-to-your-website

document.addEventListener('DOMContentLoaded', () => {
  // initializing the map centered on NCSU's main campus
  const map = L.map('map-container', {
    center: [35.7847, -78.6821],
    zoom: 15
  });

  // adding OpenStreetMap tile layer
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // fetching official campus desk locations and adding markers
  fetch('/api/locations/desks')
    .then(r => r.json())
    .then(desks => {
      desks.forEach(desk => {
        L.marker([desk.coordinates.lat, desk.coordinates.lng])
          .addTo(map)
          .bindPopup(`<strong>${desk.name}</strong><br>Official Lost & Found Desk`);
      });
    })
    .catch(err => console.error('Error loading desk locations:', err));

  // fetching lost/found item posts and add markers for those with coordinates
  fetch('/api/items')
    .then(r => r.json())
    .then(items => {
      items.forEach(item => {
        if (!item.coordinates) return;
        L.marker([item.coordinates.lat, item.coordinates.lng])
          .addTo(map)
          .bindPopup(`<strong>${item.title}</strong><br>Status: ${item.status}<br>${item.description}`);
      });
    })
    .catch(err => console.error('Error loading items:', err));
});