import mongoose, { Document } from 'mongoose';
export interface INotificationSettings {
    enabled: boolean;
    frequency: number;
    quietHours: {
        start: string;
        end: string;
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
export interface ISettingsModel extends mongoose.Model<ISettings> {
    getUserSettings(userId: string): Promise<ISettings>;
}
declare const _default: ISettingsModel;
export default _default;
//# sourceMappingURL=Settings.d.ts.map