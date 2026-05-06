let menuToggle = document.querySelector('#menuToggle');
let mobileMenuBtn = document.querySelector('#mobile-menu-btn');
let drawer = document.querySelector('#drawer');

function toggleDrawer(e) {
  if (drawer) drawer.classList.toggle('open');
  e.stopPropagation();
}

if (menuToggle) menuToggle.addEventListener('click', toggleDrawer);
if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleDrawer);

// Safety check added here to prevent null reference errors on login.html
document.addEventListener('click', function(e){
  if (drawer && menuToggle && mobileMenuBtn) {
    if (!drawer.contains(e.target) && !menuToggle.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      drawer.classList.remove('open');
    }
  }
});

function updateOnlineStatus() {
  const existingBanner = document.getElementById('offline-banner');
  
  if (!navigator.onLine) {
    if (!existingBanner) {
      const banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px; margin-right:8px;">wifi_off</span> You are currently offline. Some features may be limited.';
      banner.style.cssText = 'position:fixed; top:0; left:0; width:100%; background-color:#333; color:white; text-align:center; padding:10px; z-index:9999; font-weight:bold; display:flex; justify-content:center; align-items:center;';
      document.body.prepend(banner);
    }
  } else {
    if (existingBanner) existingBanner.remove();
    flushSyncQueue();
  }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registered successfully.', reg))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

async function flushSyncQueue() {
  if (!navigator.onLine) return;
  // Safety check: ensure idb.js is loaded
  if (typeof getSyncQueue !== 'function') return; 
  
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const queue = await getSyncQueue();
    if (queue.length === 0) return;

    for (let item of queue) {
      const formData = new FormData();
      formData.append('title', item.payload.title);
      formData.append('description', item.payload.description);
      formData.append('location', item.payload.location);
      formData.append('status', item.payload.status);
      if (item.payload.lat) formData.append('lat', item.payload.lat);
      if (item.payload.lng) formData.append('lng', item.payload.lng);
      if (item.payload.imageFile) formData.append('image', item.payload.imageFile);

      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        await removeFromSyncQueue(item.syncId);
      }
    }
    
    if (window.location.pathname.includes('forum.html') && typeof fetchPosts === 'function') {
      fetchPosts();
    }
    
  } catch (err) {
    console.error('Error flushing sync queue:', err);
  }
}

async function checkNotifications() {
    const token = localStorage.getItem('token');
    if (!token || !navigator.onLine) return;

    try {
        const response = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            const badges = document.querySelectorAll('.notif-badge'); // Update desktop and mobile bells
            
            badges.forEach(badge => {
                if (data.unreadCount > 0) {
                    badge.textContent = data.unreadCount;
                    badge.style.display = 'block';
                } else {
                    badge.style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.error("Failed to fetch notifications");
    }
}

// Helper function required by the Web Push Protocol to encode the public key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
async function setupPushNotifications() {
    const token = localStorage.getItem('token');
    if (!token || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("Push not supported or not logged in.");
        return false;
    }
    

    try {
        // Explicitly ask iOS/Browser for permission 
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn("Notification permission denied by user.");
            return false; // Stop here if they hit "Block" or it fails
        }

        const registration = await navigator.serviceWorker.ready;
        
        // Check if already subscribed
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
            const publicVapidKey = "BBtPDxulAQj9VxkSX126NYtqE0G_UcPXbuCRclFE-7nHNBtGcTdBiAw0jlOAdQGIrhxWpg_Mhge-UZ4I-DoqEkk"; 
            
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send subscription to our backend
            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(subscription)
            });
            console.log("Push notifications successfully saved to DB!");
        }
        return true; // Success!
    } catch (error) {
        console.error("Failed to setup push notifications:", error);
        return false; // Failed!
    }
}

// Add this alongside your existing checkNotifications() call at the bottom of menu.js
window.addEventListener('load', () => {
    checkNotifications();
});

// Check on load
window.addEventListener('load', checkNotifications);