import mongoose, { Document } from 'mongoose';
export interface IWaterLog extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    date: string;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IWaterLogModel extends mongoose.Model<IWaterLog> {
    getDailyTotal(userId: string, date: string): Promise<number>;
    getWeeklyStats(userId: string, startDate: string, endDate: string): Promise<Array<{
        date: string;
        total: number;
        count: number;
    }>>;
}
declare const _default: IWaterLogModel;
export default _default;
//# sourceMappingURL=WaterLog.d.ts.map