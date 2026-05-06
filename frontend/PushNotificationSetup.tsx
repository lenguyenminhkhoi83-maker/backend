import React, { useState } from 'react';
import {
  requestNotificationPermission,
  subscribeUserToPush,
  unsubscribeUserFromPush,
  sendSubscriptionToServer,
  removeSubscriptionFromServer,
  sendPushTestNotification
} from './push-client';

export const PushNotificationSetup: React.FC = () => {
  const [status, setStatus] = useState('Idle');
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setStatus('Requesting permission...');
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        setStatus('Notification permission denied');
        return;
      }

      setStatus('Registering service worker...');
      const subscription = await subscribeUserToPush();
      setSubscriptionEndpoint(subscription.endpoint);

      setStatus('Saving subscription to server...');
      const response = await sendSubscriptionToServer(subscription);
      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setStatus('Subscribed to push notifications');
    } catch (error) {
      setStatus(`Subscription failed: ${error}`);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setStatus('Unsubscribing...');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setStatus('No active subscription found');
        return;
      }

      await unsubscribeUserFromPush();
      await removeSubscriptionFromServer(subscription.endpoint);
      setSubscriptionEndpoint(null);
      setStatus('Unsubscribed from push notifications');
    } catch (error) {
      setStatus(`Unsubscribe failed: ${error}`);
    }
  };

  const handleSendTest = async () => {
    try {
      setStatus('Sending test notification...');
      const response = await sendPushTestNotification(
        'HydroTrack Reminder',
        'This is your test hydration reminder!'
      );
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      setStatus('Test notification sent');
    } catch (error) {
      setStatus(`Test send failed: ${error}`);
    }
  };

  return (
    <div className="push-setup-card">
      <h3>Push Notifications</h3>
      <p>Status: {status}</p>
      <div className="push-actions">
        <button onClick={handleSubscribe}>Subscribe</button>
        <button onClick={handleUnsubscribe} disabled={!subscriptionEndpoint}>Unsubscribe</button>
        <button onClick={handleSendTest}>Send Test Notification</button>
      </div>
      {subscriptionEndpoint && (
        <div className="subscription-info">
          <strong>Endpoint:</strong>
          <p>{subscriptionEndpoint}</p>
        </div>
      )}
    </div>
  );
};
