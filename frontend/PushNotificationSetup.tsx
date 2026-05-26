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
  const [status, setStatus] = useState<string>('Idle');
  const [endpoint, setEndpoint] = useState<string | null>(null);

  // ======================
  // SUBSCRIBE
  // ======================
  const handleSubscribe = async () => {
    try {
      setStatus('Requesting permission...');

      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        setStatus('Permission denied');
        return;
      }

      setStatus('Subscribing...');

      const subscription = await subscribeUserToPush();
      if (!subscription) throw new Error('No subscription created');

      setEndpoint(subscription.endpoint);

      setStatus('Saving to server...');

      const res = await sendSubscriptionToServer(subscription);
      if (!res?.ok) throw new Error('Server save failed');

      setStatus('Subscribed successfully');
    } catch (err: any) {
      console.error(err);
      setStatus(`Subscribe failed`);
    }
  };

  // ======================
  // UNSUBSCRIBE
  // ======================
  const handleUnsubscribe = async () => {
    try {
      setStatus('Unsubscribing...');

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setStatus('No subscription found');
        return;
      }

      await unsubscribeUserFromPush();
      await removeSubscriptionFromServer(subscription.endpoint);

      setEndpoint(null);
      setStatus('Unsubscribed');
    } catch (err) {
      console.error(err);
      setStatus('Unsubscribe failed');
    }
  };

  // ======================
  // TEST NOTIFICATION
  // ======================
  const handleTest = async () => {
    try {
      setStatus('Sending test...');

      const res = await sendPushTestNotification(
        '💧 HydroTrack',
        'Time to drink water!'
      );

      if (!res?.ok) throw new Error('Test failed');

      setStatus('Test sent');
    } catch (err) {
      console.error(err);
      setStatus('Test failed');
    }
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="push-setup-card">
      <h3>Push Notifications</h3>

      <p>Status: {status}</p>

      <div className="push-actions">
        <button onClick={handleSubscribe}>
          Subscribe
        </button>

        <button
          onClick={handleUnsubscribe}
          disabled={!endpoint}
        >
          Unsubscribe
        </button>

        <button onClick={handleTest}>
          Test Notification
        </button>
      </div>

      {endpoint && (
        <div className="subscription-info">
          <strong>Endpoint</strong>
          <p style={{ fontSize: 12, wordBreak: 'break-all' }}>
            {endpoint}
          </p>
        </div>
      )}
    </div>
  );
};