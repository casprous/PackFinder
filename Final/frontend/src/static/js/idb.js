const DB_NAME = 'PackFinderDB';
const DB_VERSION = 1;

// Opens the database and creates the schema on first load
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Store for caching the forum feed
      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
      }
      // Store for queuing offline actions (like creating a post)
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'syncId', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// Caching API data
async function cachePosts(posts) {
  const db = await openDB();
  const tx = db.transaction('posts', 'readwrite');
  const store = tx.objectStore('posts');
  // Clear old cache and insert fresh data
  store.clear(); 
  posts.forEach(post => store.put(post));
  return tx.complete;
}

async function getCachedPosts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('posts', 'readonly');
    const store = tx.objectStore('posts');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Background SyncQueue
async function addToSyncQueue(endpoint, method, payloadObj) {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').put({
    endpoint,
    method,
    payload: payloadObj,
    timestamp: Date.now()
  });
  return tx.complete;
}

async function getSyncQueue() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction('syncQueue', 'readonly').objectStore('syncQueue').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromSyncQueue(syncId) {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  tx.objectStore('syncQueue').delete(syncId);
  return tx.complete;
}