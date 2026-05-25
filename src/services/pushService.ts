import webpush from 'web-push';
import mongoose from 'mongoose';
import PushSubscription, { IPushSubscription } from '../models/PushSubscription';

export class PushService {
  private pushEnabled = false;

  constructor() {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject =
      process.env.VAPID_SUBJECT || 'mailto:admin@hydrotrack.com';

    if (!publicKey || !privateKey) {
      console.warn(
        'VAPID keys are not configured. Push notifications are disabled.'
      );
      return;
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    this.pushEnabled = true;

    console.log('✅ Push notifications enabled');
  } catch (error) {
    console.warn(
      '⚠️ Invalid VAPID keys. Push notifications disabled.'
    );

    this.pushEnabled = false;
  }
}

  async saveSubscription(subscription: any, userId: string): Promise<IPushSubscription> {
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint });
    if (existing) {
      existing.keys = subscription.keys;
      existing.expirationTime = subscription.expirationTime || null;
      existing.user = new mongoose.Types.ObjectId(userId);
      return existing.save();
    }

    return PushSubscription.create({
      user: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime || null
    });
  }

  async removeSubscription(endpoint: string): Promise<void> {
    await PushSubscription.findOneAndDelete({ endpoint });
  }

  async sendNotificationToUser(userId: string, payload: object): Promise<void> {
    if (!this.pushEnabled) {
      console.warn('Push notifications are disabled because VAPID keys are missing.');
      return;
    }

    const subscriptions = await PushSubscription.find({ user: userId });
    const sendPromises = subscriptions.map((sub: IPushSubscription) => {
      const subscriptionPayload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth
        }
      };

      return webpush.sendNotification(subscriptionPayload, JSON.stringify(payload)).catch((error) => {
        console.error('Push send error:', error);
        if (error.statusCode === 410 || error.statusCode === 404) {
          return PushSubscription.findByIdAndDelete(sub._id).exec();
        }
      });
    });
    await Promise.all(sendPromises);
  }
}

export const pushService = new PushService();
