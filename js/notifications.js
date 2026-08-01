// Simple In-App Notification System
// No external dependencies - works standalone

// Simple badge update using localStorage
function updateBadgeDisplay(count) {
  const badges = document.querySelectorAll('.notification-badge');
  badges.forEach(badge => {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
  localStorage.setItem('notificationBadge', count.toString());
}

function getUnreadCount() {
  return parseInt(localStorage.getItem('notificationBadge') || '0');
}

function initNotificationSystem() {
  const count = getUnreadCount();
  updateBadgeDisplay(count);
  console.log('Notification system initialized');
}

// Create notification center UI
function createNotificationCenter() {
  const existing = document.getElementById('notification-center');
  if (existing) existing.remove();
  
  const container = document.createElement('div');
  container.id = 'notification-center';
  container.className = 'notification-center';
  container.innerHTML = `
    <div class="notification-overlay"></div>
    <div class="notification-panel">
      <div class="notification-header">
        <h3>Notifications</h3>
        <div class="notification-header-actions">
          <button class="mark-all-read" title="Mark all as read">
            <i class="ri-check-double-line"></i>
          </button>
          <button class="close-notification-center">
            <i class="ri-close-line"></i>
          </button>
        </div>
      </div>
      <div class="notification-list">
        <div class="notification-empty">
          <i class="ri-notification-off-line"></i>
          <p>No new notifications</p>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(container);
  
  container.querySelector('.notification-overlay').onclick = () => closeNotificationCenter(container);
  container.querySelector('.close-notification-center').onclick = () => closeNotificationCenter(container);
  container.querySelector('.mark-all-read').onclick = () => {
    updateBadgeDisplay(0);
    localStorage.setItem('notificationBadge', '0');
  };
  
  setTimeout(() => container.classList.add('show'), 10);
}

function closeNotificationCenter(container) {
  container.classList.remove('show');
  setTimeout(() => container.remove(), 300);
}

function openNotificationCenter() {
  createNotificationCenter();
}

function incrementBadge() {
  const current = getUnreadCount();
  updateBadgeDisplay(current + 1);
}

// Export functions
window.initNotificationSystem = initNotificationSystem;
window.openNotificationCenter = openNotificationCenter;
window.updateBadgeDisplay = updateBadgeDisplay;
window.getUnreadCount = getUnreadCount;
window.incrementBadge = incrementBadge;
