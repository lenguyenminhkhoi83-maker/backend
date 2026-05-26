"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushService = exports.PushService = void 0;
const web_push_1 = __importDefault(require("web-push"));
const mongoose_1 = __importDefault(require("mongoose"));
const PushSubscription_1 = __importDefault(require("../models/PushSubscription"));
class PushService {
    constructor() {
        this.pushEnabled = false;
        try {
            const publicKey = process.env.VAPID_PUBLIC_KEY;
            const privateKey = process.env.VAPID_PRIVATE_KEY;
            const subject = process.env.VAPID_SUBJECT || 'mailto:admin@hydrotrack.com';
            if (!publicKey || !privateKey) {
                console.warn('VAPID keys are not configured. Push notifications are disabled.');
                return;
            }
            web_push_1.default.setVapidDetails(subject, publicKey, privateKey);
            this.pushEnabled = true;
            console.log('✅ Push notifications enabled');
        }
        catch (error) {
            console.warn('⚠️ Invalid VAPID keys. Push notifications disabled.');
            this.pushEnabled = false;
        }
    }
    async saveSubscription(subscription, userId) {
        const existing = await PushSubscription_1.default.findOne({ endpoint: subscription.endpoint });
        if (existing) {
            existing.keys = subscription.keys;
            existing.expirationTime = subscription.expirationTime || null;
            existing.user = new mongoose_1.default.Types.ObjectId(userId);
            return existing.save();
        }
        return PushSubscription_1.default.create({
            user: userId,
            endpoint: subscription.endpoint,
            keys: subscription.keys,
            expirationTime: subscription.expirationTime || null
        });
    }
    async removeSubscription(endpoint) {
        await PushSubscription_1.default.findOneAndDelete({ endpoint });
    }
    async sendNotificationToUser(userId, payload) {
        if (!this.pushEnabled) {
            console.warn('Push notifications are disabled because VAPID keys are missing.');
            return;
        }
        const subscriptions = await PushSubscription_1.default.find({ user: userId });
        const sendPromises = subscriptions.map((sub) => {
            const subscriptionPayload = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.keys.p256dh,
                    auth: sub.keys.auth
                }
            };
            return web_push_1.default.sendNotification(subscriptionPayload, JSON.stringify(payload)).catch((error) => {
                console.error('Push send error:', error);
                if (error.statusCode === 410 || error.statusCode === 404) {
                    return PushSubscription_1.default.findByIdAndDelete(sub._id).exec();
                }
            });
        });
        await Promise.all(sendPromises);
    }
}
exports.PushService = PushService;
exports.pushService = new PushService();
//# sourceMappingURL=pushService.js.map