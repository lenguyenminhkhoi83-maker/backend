const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported by this browser.');
  }

  return await navigator.serviceWorker.register('/service-worker.js');
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported by this browser.');
  }

  return await Notification.requestPermission();
};

export const subscribeUserToPush = async (): Promise<PushSubscription> => {
  const registration = await getServiceWorkerRegistration();
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
    )
  });

  return subscription;
};

export const unsubscribeUserFromPush = async (): Promise<boolean> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();
    return true;
  }

  return false;
};

export const sendSubscriptionToServer = async (
  subscription: PushSubscription
): Promise<Response> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return await fetch(`${apiUrl}/api/push/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({ subscription })
  });
};

export const removeSubscriptionFromServer = async (endpoint: string): Promise<Response> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return await fetch(`${apiUrl}/api/push/unsubscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({ endpoint })
  });
};

export const sendPushTestNotification = async (title: string, body: string): Promise<Response> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return await fetch(`${apiUrl}/api/push/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`
    },
    body: JSON.stringify({ title, body })
  });
};