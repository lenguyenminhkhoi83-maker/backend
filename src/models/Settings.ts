import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationSettings {
  enabled: boolean;
  frequency: number; // minutes
  quietHours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface ISettings extends Document {
  user: mongoose.Types.ObjectId;
  dailyGoal: number;
  notifications: INotificationSettings;
  timezone: string;
  units: 'ml' | 'oz';
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingsSchema = new Schema({
  enabled: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: Number,
    default: 60,
    min: [15, 'Frequency must be at least 15 minutes'],
    max: [480, 'Frequency cannot exceed 8 hours']
  },
  quietHours: {
    start: {
      type: String,
      default: '22:00',
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    end: {
      type: String,
      default: '08:00',
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    }
  }
}, { _id: false });

const SettingsSchema: Schema<ISettings> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Settings must belong to a user'],
    unique: true
  },
  dailyGoal: {
    type: Number,
    default: 2000,
    min: [500, 'Daily goal must be at least 500ml'],
    max: [5000, 'Daily goal cannot exceed 5000ml']
  },
  notifications: {
    type: NotificationSettingsSchema,
    default: () => ({})
  },
  timezone: {
    type: String,
    default: 'UTC',
    enum: {
      values: [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
        'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
        'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
      ],
      message: 'Invalid timezone'
    }
  },
  units: {
    type: String,
    enum: ['ml', 'oz'],
    default: 'ml'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
SettingsSchema.index({ user: 1 });

export interface ISettingsModel extends mongoose.Model<ISettings> {
  getUserSettings(userId: string): Promise<ISettings>;
}

// Static method to get user settings with defaults
SettingsSchema.statics.getUserSettings = async function(userId: string): Promise<ISettings> {
  let settings = await this.findOne({ user: userId });

  if (!settings) {
    settings = await this.create({
      user: userId,
      dailyGoal: 2000,
      notifications: {
        enabled: true,
        frequency: 60,
        quietHours: { start: '22:00', end: '08:00' }
      },
      timezone: 'UTC',
      units: 'ml'
    });
  }

  return settings;
};

export default mongoose.model<ISettings, ISettingsModel>('Settings', SettingsSchema);