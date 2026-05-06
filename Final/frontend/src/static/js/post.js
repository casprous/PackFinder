/**
 * Compresses an image file using the HTML5 Canvas API.
 * @param {File} file - The original image file from the input.
 * @param {number} maxWidth - The maximum allowed width (maintains aspect ratio).
 * @param {number} quality - JPEG compression quality (0.0 to 1.0).
 * @returns {Promise<File>} - A promise that resolves with the compressed File object.
 */
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions keeping aspect ratio
                if (width > maxWidth) {
                    height = Math.round(height * (maxWidth / width));
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    
                    // Create a new File object with a .jpg extension
                    const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                    const compressedFile = new File([blob], newFileName, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

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
    // Note: The submit listener is now 'async' to allow for awaiting the compression
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const token = localStorage.getItem('token');
      if (!token) {
        alert("You must be logged in to create a post.");
        window.location.href = '/login.html';
        return;
      }

      let finalImageFile = null;
      const fileInput = document.getElementById('image-upload');

      // If the user selected an image, compress it before proceeding
      if (fileInput.files.length > 0) {
          const originalFile = fileInput.files[0];
          if (!originalFile.type.match(/image\/(jpeg|png|webp)/)) {
              alert("Unsupported image format. Please select a standard JPG or PNG photo.");
              return; // Halt submission
          }
          
          try {
              // Wait for the compression to finish (resize to 800px wide, 70% quality)
              finalImageFile = await compressImage(originalFile, 800, 0.7);
              console.log(`Compressed from ${(originalFile.size/1024/1024).toFixed(2)}MB to ${(finalImageFile.size/1024).toFixed(2)}KB`);
          } catch (error) {
              console.error("Image compression failed", error);
              alert("Failed to process the image. Please try a different photo.");
              return; // Halt the submission if compression completely fails
          }
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

      // Attach the COMPRESSED image file if one exists
      if (finalImageFile) {
        formData.append('image', finalImageFile);
      }

      // Send POST request
      fetch('/api/items', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
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
        if (!navigator.onLine || error.message === 'Failed to fetch') {
          
          // If offline, package the data to save in IndexedDB
          const offlinePayload = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            status: document.getElementById('status').value,
            lat: selectedLat,
            lng: selectedLng
          };
          
          // Save the compressed image file to IndexedDB
          if (finalImageFile) {
            offlinePayload.imageFile = finalImageFile;
          }

          // Add to queue and redirect
          addToSyncQueue('/api/items', 'POST', offlinePayload)
            .then(() => {
              alert('Network unavailable. Your post has been saved locally and will upload automatically when connection is restored.');
              window.location.href = '/forum.html';
            });

        } else {
          // If it reaches here, the server responded, but with a 400/500 error (e.g., expired token)
          console.error("Server Error:", error);
          alert('Failed to post item due to a server error. You may need to log in again.');
        }
      });
    });
  }
});