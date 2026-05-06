// based on these tutorials: 
// https://blog.miguelgrinberg.com/post/how-to-add-a-quick-interactive-map-to-your-website
// https://leafletjs.com/examples/custom-icons/
// https://stackoverflow.com/questions/57767359/how-to-load-an-svg-icon-in-leaflet

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

  // color coded markers
  function makeSvgIcon(fillColor, shape = 'circle') {
    const isSquare = shape === 'square';
    const svg = isSquare
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
           <rect x="4" y="4" width="20" height="20" rx="4" ry="4"
                 fill="${fillColor}" stroke="#fff" stroke-width="2"
                 filter="drop-shadow(0 1px 3px rgba(0,0,0,0.4))"/>
         </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
           <path d="M14 0 C6.27 0 0 6.27 0 14 C0 24.5 14 36 14 36 C14 36 28 24.5 28 14 C28 6.27 21.73 0 14 0 Z"
                 fill="${fillColor}" stroke="#fff" stroke-width="2"
                 filter="drop-shadow(0 1px 3px rgba(0,0,0,0.4))"/>
           <circle cx="14" cy="14" r="5" fill="rgba(255,255,255,0.55)"/>
         </svg>`;
 
    return L.divIcon({
      html: svg,
      className: '',
      iconSize: isSquare ? [28, 28]  : [28, 36],
      iconAnchor: isSquare ? [14, 14]  : [14, 36],
      popupAnchor: [0, isSquare ? -16 : -38]
    });
  }
 
  const STATUS_ICONS = {
    'Lost': makeSvgIcon('#CC0000'),
    'Found': makeSvgIcon('#2e7d32'),
    'Turned In': makeSvgIcon('#1565c0'),
    'desk': makeSvgIcon('#e65100', 'square')
  };
 
  function iconForStatus(status) {
    return STATUS_ICONS[status] || makeSvgIcon('#757575');
  }

  const allMarkers = [];
  let activeMarker = null;

  function activateMarker(entry) {
    if (activeMarker && activeMarker._pulseCircle) {
      map.removeLayer(activeMarker._pulseCircle);
      activeMarker._pulseCircle = null;
    }
 
    const latlng = entry.marker.getLatLng();

    const pulse = L.circleMarker(latlng, {
      radius: 18,
      color: '#FFD700',
      weight: 3,
      fillColor: '#FFD700',
      fillOpacity: 0.2,
      className: 'marker-pulse'
    }).addTo(map);
 
    entry.marker._pulseCircle = pulse;
    activeMarker = entry.marker;
    activeMarker._pulseCircle = pulse;
 
    map.flyTo(latlng, 18, { duration: 0.8 });
    entry.marker.openPopup();
  }


  // fetching official campus desk locations and adding markers
  fetch('/api/locations/desks')
    .then(r => r.json())
    .then(desks => {
      desks.forEach(desk => {
        const marker = L.marker(
          [desk.coordinates.lat, desk.coordinates.lng],
          { icon: iconForStatus('desk') }
        )
          .addTo(map)
          .bindPopup(
            `<strong>${desk.name}</strong><br>
             <span style="color:#e65100;">&#9632; Official L&amp;F Desk</span>`
          );

        allMarkers.push({
          marker,
          label: desk.name,
          type: 'desk',
          status: 'desk'
        });
      });
    })
    .catch(err => console.error('Error loading desk locations:', err));

  // fetching lost/found item posts and add markers for those with coordinates
  fetch('/api/items')
    .then(r => r.json())
    .then(items => {
      items.forEach(item => {
        if (!item.coordinates) return;

        const statusColor = {
          'Lost':      '#CC0000',
          'Found':     '#2e7d32',
          'Turned In': '#1565c0'
        }[item.status] || '#757575';

        // Format the timestamp if it exists
        let timeString = '';
        if (item.timestamp) {
            const dateObj = new Date(item.timestamp);
            timeString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        // CORRECTED: Single marker declaration with a conditional timestamp injection
        const marker = L.marker(
          [item.coordinates.lat, item.coordinates.lng],
          { icon: iconForStatus(item.status) }
        )
          .addTo(map)
          .bindPopup(
            `<strong>${item.title}</strong><br>
             <span style="color:${statusColor};font-weight:600;">${item.status}</span><br>
             <em>${item.location || ''}</em><br>
             ${timeString ? `<small style="color: #888;">${timeString}</small><br>` : ''}
             <small>${item.description || ''}</small>`
          );
      
        allMarkers.push({
          marker,
          label: item.title,
          sublabel: `${item.status} · ${item.location || ''}`,
          type: 'item',
          status: item.status,
          itemId: item.id
        });
      });
    })
    .catch(err => console.error('Error loading items:', err));


  // search bar
  const searchInput = document.getElementById('search-input');
  const searchRow = searchInput.closest('.search-row') || searchInput.parentElement;
 
  // dropdown container
  const dropdown = document.createElement('div');
  dropdown.id = 'search-dropdown';
 
  const searchContainer = searchInput.parentElement;
  searchContainer.style.position = 'relative';
  searchContainer.appendChild(dropdown);
 
  function renderDropdown(query) {
    const q = query.trim().toLowerCase();
    dropdown.innerHTML = '';
 
    if (!q) {
      dropdown.style.display = 'none';
      return;
    }
 
    const matches = allMarkers.filter(e =>
      e.label.toLowerCase().includes(q) ||
      (e.sublabel && e.sublabel.toLowerCase().includes(q))
    );
 
    if (!matches.length) {
      dropdown.style.display = 'none';
      return;
    }

    const dotColor = {
      'Lost':      '#CC0000',
      'Found':     '#2e7d32',
      'Turned In': '#1565c0',
      'desk':      '#e65100'
    };
 
    matches.forEach(entry => {
      const item = document.createElement('div');
      item.className = 'search-dropdown-item';
 
      const color = dotColor[entry.status] || '#999';
      const shape = entry.type === 'desk' ? 'border-radius:3px;' : 'border-radius:50%;';
 
      item.innerHTML = `
        <span style="
          width:11px; height:11px; flex-shrink:0;
          background:${color}; ${shape}
          border:2px solid #fff;
          box-shadow:0 1px 3px rgba(0,0,0,0.3);
          display:inline-block;">
        </span>
        <span>
          <strong>${entry.label}</strong>
          ${entry.sublabel ? `<br><small style="color:#777">${entry.sublabel}</small>` : ''}
        </span>
      `;
 
      item.addEventListener('click', () => {
        searchInput.value = entry.label;
        dropdown.style.display = 'none';
        activateMarker(entry);
      });
 
      dropdown.appendChild(item);
    });
 
    dropdown.style.display = 'block';
  }
 
  searchInput.addEventListener('input', e => renderDropdown(e.target.value));
 
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dropdown.style.display = 'none';
      searchInput.blur();
    }
    if (e.key === 'Enter') {
      const first = dropdown.querySelector('div');
      if (first) first.click();
    }
  });
 
  // close dropdown when clicking outside the search area
  document.addEventListener('click', e => {
    if (!searchContainer.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
});