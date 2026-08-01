// Simple FCM Service - No external dependencies
// Uses browser Notification API

let notificationPrefs = {
  pushEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  previewEnabled: true
};

async function initFCMService() {
  try {
    // Try to use browser notifications
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        console.log('Notifications enabled');
        return true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  } catch (e) {
    console.warn('FCM init failed:', e);
    return false;
  }
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

function showNotification(notification, data) {
  if (!notificationPrefs.pushEnabled) return;
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  const options = {
    body: notification.body || '',
    icon: notification.icon || 'images/notification-icon.png',
    badge: 'images/badge-icon.png',
    tag: data?.messageId || 'default'
  };
  
  if (notificationPrefs.vibrationEnabled && navigator.vibrate) {
    options.vibrate = [200, 100, 200];
  }
  
  if (notificationPrefs.soundEnabled) {
    options.sound = 'default';
  }
  
  try {
    const notif = new Notification(notification.title || 'New Message', options);
    notif.onclick = () => {
      window.focus();
      if (data?.contactId) {
        window.location.href = 'chatting.html?contactId=' + data.contactId;
      } else {
        window.location.href = 'chats.html';
      }
      notif.close();
    };
  } catch (e) {
    console.warn('Could not show notification:', e);
  }
  
  if (notificationPrefs.soundEnabled) {
    try {
      const audio = new Audio('sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  }
  
  if (notificationPrefs.vibrationEnabled && navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

function updateNotificationPrefs(prefs) {
  notificationPrefs = { ...notificationPrefs, ...prefs };
  localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs));
}

function loadNotificationPrefs() {
  try {
    const saved = localStorage.getItem('notificationPrefs');
    if (saved) notificationPrefs = { ...notificationPrefs, ...JSON.parse(saved) };
  } catch (e) {}
  return notificationPrefs;
}

function getNotificationPrefs() {
  return notificationPrefs;
}

function setCurrentUser(user) {
  loadNotificationPrefs();
}

function getBadgeCount() {
  return parseInt(localStorage.getItem('notificationBadge') || '0');
}

function setBadgeCount(count) {
  localStorage.setItem('notificationBadge', count.toString());
  if (navigator.setAppBadge) navigator.setAppBadge(count);
}

function clearBadge() {
  setBadgeCount(0);
  if (navigator.clearAppBadge) navigator.clearAppBadge();
}

function incrementBadge() {
  const current = getBadgeCount();
  setBadgeCount(current + 1);
}

// Export to window
window.initFCMService = initFCMService;
window.requestNotificationPermission = requestNotificationPermission;
window.showNotification = showNotification;
window.updateNotificationPrefs = updateNotificationPrefs;
window.loadNotificationPrefs = loadNotificationPrefs;
window.getNotificationPrefs = getNotificationPrefs;
window.setCurrentUser = setCurrentUser;
window.getBadgeCount = getBadgeCount;
window.setBadgeCount = setBadgeCount;
window.clearBadge = clearBadge;
window.incrementBadge = incrementBadge;
