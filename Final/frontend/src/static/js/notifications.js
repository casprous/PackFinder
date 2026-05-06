document.addEventListener('DOMContentLoaded', () => {
    fetchNotifications();
});

document.getElementById('enable-push-btn')?.addEventListener('click', async () => {
    const success = await setupPushNotifications();
    
    if (success) {
        alert("Push notifications enabled!");
        document.getElementById('enable-push-btn').style.display = 'none'; // Hide it after subscribing
    } else {
        alert("Failed to enable notifications. Please ensure you clicked 'Allow' and check your device settings.");
    }
});

function fetchNotifications() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to load notifications');
        return res.json();
    })
    .then(data => {
        renderNotifications(data.notifications);
    })
    .catch(err => {
        console.error(err);
        document.getElementById('notifications-list').innerHTML = 
            '<p class="empty-state">Failed to load notifications. Please try again later.</p>';
    });
}

function renderNotifications(notifications) {
    const listContainer = document.getElementById('notifications-list');
    listContainer.innerHTML = '';

    if (notifications.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">You have no notifications yet.</p>';
        return;
    }

    notifications.forEach(notif => {
        const card = document.createElement('div');
        // Add 'notif-unread' class if the notification hasn't been clicked yet
        card.className = `notif-card ${!notif.notif_is_read ? 'notif-unread' : ''}`;
        
        // Pick an icon based on the type of notification
        const iconName = notif.notif_type === 'reply' ? 'chat_bubble' : 'update';
        
        // Format the timestamp nicely
        const dateObj = new Date(notif.notif_created_at);
        const timeString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        card.innerHTML = `
            <span class="material-symbols-outlined notif-icon">${iconName}</span>
            <div class="notif-content">
                <p style="margin: 0; font-weight: ${!notif.notif_is_read ? 'bold' : 'normal'};">${notif.notif_message}</p>
                <div class="notif-time">${timeString}</div>
            </div>
        `;

        // Click handler to mark as read and redirect
        card.addEventListener('click', () => {
            if (!notif.notif_is_read) {
                markAsRead(notif.notif_id, notif.notif_item_id);
            } else {
                // If already read, just navigate to the forum
                window.location.href = `/forum.html?item=${notif.notif_item_id}`;
            }
        });

        listContainer.appendChild(card);
    });
}

function markAsRead(notifId, itemId) {
    const token = localStorage.getItem('token');
    fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => {
        // Redirect to forum after successful update
        window.location.href = `/forum.html?item=${itemId}`;
    })
    .catch(err => console.error("Error marking notification as read", err));
}