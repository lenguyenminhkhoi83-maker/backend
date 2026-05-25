import mongoose, { Document, Schema } from 'mongoose';

export interface IWaterLog extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  date: string; // YYYY-MM-DD format
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaterLogSchema: Schema<IWaterLog> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Water log must belong to a user']
  },
  amount: {
    type: Number,
    required: [true, 'Please add water amount'],
    min: [1, 'Amount must be at least 1ml'],
    max: [2000, 'Amount cannot exceed 2000ml per log']
  },
  date: {
    type: String,
    required: [true, 'Please add date'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
WaterLogSchema.index({ user: 1, date: 1 });
WaterLogSchema.index({ user: 1, date: -1 });
WaterLogSchema.index({ user: 1, timestamp: -1 });
WaterLogSchema.index({ date: 1 });

// Virtual for formatted time
WaterLogSchema.virtual('formattedTime').get(function() {
  return this.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
});

// Static method to get daily total
WaterLogSchema.statics.getDailyTotal = async function(
  userId: string,
  date: string
): Promise<number> {
  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: date
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Static method to get weekly stats
WaterLogSchema.statics.getWeeklyStats = async function(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; total: number; count: number }>> {
  return await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: '$date',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        date: '$_id',
        total: 1,
        count: 1,
        _id: 0
      }
    },
    {
      $sort: { date: 1 }
    }
  ]);
};

export interface IWaterLogModel extends mongoose.Model<IWaterLog> {
  getDailyTotal(userId: string, date: string): Promise<number>;
  getWeeklyStats(userId: string, startDate: string, endDate: string): Promise<Array<{ date: string; total: number; count: number }>>;
}

export default mongoose.model<IWaterLog, IWaterLogModel>('WaterLog', WaterLogSchema);