self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : { title: 'HydroTrack', body: 'Stay hydrated!' };

  const options = {
    body: payload.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data || {},
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});
