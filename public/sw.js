// Service Worker for background timer functionality
const CACHE_NAME = 'workout-timer-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Message event for timer communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TIMER_START') {
    startTimer(event.data.duration, event.data.timerId);
  } else if (event.data && event.data.type === 'TIMER_STOP') {
    stopTimer(event.data.timerId);
  } else if (event.data && event.data.type === 'TIMER_PAUSE') {
    pauseTimer(event.data.timerId);
  } else if (event.data && event.data.type === 'TIMER_RESUME') {
    resumeTimer(event.data.timerId);
  }
});

// Timer storage
const timers = new Map();

function startTimer(duration, timerId) {
  const startTime = Date.now();
  const endTime = startTime + (duration * 1000);

  timers.set(timerId, {
    startTime,
    endTime,
    duration,
    isActive: true,
    remainingTime: duration
  });

  // Check timer every second
  const interval = setInterval(() => {
    const timer = timers.get(timerId);
    if (!timer || !timer.isActive) {
      clearInterval(interval);
      return;
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((timer.endTime - now) / 1000));

    timer.remainingTime = remaining;

    // Update all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'TIMER_UPDATE',
          timerId,
          remainingTime: remaining,
          isComplete: remaining <= 0
        });
      });
    });

    // Timer completed
    if (remaining <= 0) {
      clearInterval(interval);
      timers.delete(timerId);

      // Show notification
      showNotification('Rest Timer Complete', 'Your rest period is over!');

      // Notify clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'TIMER_COMPLETE',
            timerId
          });
        });
      });
    }
  }, 1000);
}

function stopTimer(timerId) {
  timers.delete(timerId);
}

function pauseTimer(timerId) {
  const timer = timers.get(timerId);
  if (timer) {
    timer.isActive = false;
  }
}

function resumeTimer(timerId) {
  const timer = timers.get(timerId);
  if (timer) {
    timer.isActive = true;
    // Adjust end time based on remaining time
    timer.endTime = Date.now() + (timer.remainingTime * 1000);
  }
}

function showNotification(title, body) {
  if ('Notification' in self && self.Notification.permission === 'granted') {
    new self.Notification(title, {
      body,
      icon: '/app-icon.png',
      badge: '/app-icon.png',
      tag: 'workout-timer'
    });
  }
}

// Background sync for timer updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'timer-sync') {
    event.waitUntil(syncTimers());
  }
});

async function syncTimers() {
  // Sync timer states with clients
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'TIMER_SYNC',
      timers: Array.from(timers.entries())
    });
  });
}
