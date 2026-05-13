import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { requestNotificationPermission, subscribeUserToPush, unsubscribeUserFromPush, sendSubscriptionToServer, removeSubscriptionFromServer, sendPushTestNotification } from './push-client';
export const PushNotificationSetup = () => {
    const [status, setStatus] = useState('Idle');
    const [subscriptionEndpoint, setSubscriptionEndpoint] = useState(null);
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
        }
        catch (error) {
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
        }
        catch (error) {
            setStatus(`Unsubscribe failed: ${error}`);
        }
    };
    const handleSendTest = async () => {
        try {
            setStatus('Sending test notification...');
            const response = await sendPushTestNotification('HydroTrack Reminder', 'This is your test hydration reminder!');
            if (!response.ok) {
                throw new Error('Failed to send test notification');
            }
            setStatus('Test notification sent');
        }
        catch (error) {
            setStatus(`Test send failed: ${error}`);
        }
    };
    return (_jsxs("div", { className: "push-setup-card", children: [_jsx("h3", { children: "Push Notifications" }), _jsxs("p", { children: ["Status: ", status] }), _jsxs("div", { className: "push-actions", children: [_jsx("button", { onClick: handleSubscribe, children: "Subscribe" }), _jsx("button", { onClick: handleUnsubscribe, disabled: !subscriptionEndpoint, children: "Unsubscribe" }), _jsx("button", { onClick: handleSendTest, children: "Send Test Notification" })] }), subscriptionEndpoint && (_jsxs("div", { className: "subscription-info", children: [_jsx("strong", { children: "Endpoint:" }), _jsx("p", { children: subscriptionEndpoint })] }))] }));
};
