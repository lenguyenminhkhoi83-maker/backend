import mongoose, { Document } from 'mongoose';
export interface IPushSubscription extends Document {
    user: mongoose.Types.ObjectId;
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    expirationTime?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPushSubscription, {}, {}, {}, mongoose.Document<unknown, {}, IPushSubscription> & IPushSubscription & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=PushSubscription.d.ts.map