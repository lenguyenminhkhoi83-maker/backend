import mongoose, { Document, Schema } from 'mongoose';

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

const PushSubscriptionSchema: Schema<IPushSubscription> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Push subscription must belong to a user']
  },
  endpoint: {
    type: String,
    required: [true, 'Subscription endpoint is required'],
    unique: true
  },
  keys: {
    p256dh: {
      type: String,
      required: [true, 'p256dh key is required']
    },
    auth: {
      type: String,
      required: [true, 'auth key is required']
    }
  },
  expirationTime: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

PushSubscriptionSchema.index({ user: 1 });
PushSubscriptionSchema.index({ endpoint: 1 });

export default mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
