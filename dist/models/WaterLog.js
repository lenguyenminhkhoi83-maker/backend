"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const WaterLogSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
WaterLogSchema.virtual('formattedTime').get(function () {
    return this.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
});
// Static method to get daily total
WaterLogSchema.statics.getDailyTotal = async function (userId, date) {
    const result = await this.aggregate([
        {
            $match: {
                user: new mongoose_1.default.Types.ObjectId(userId),
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
WaterLogSchema.statics.getWeeklyStats = async function (userId, startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                user: new mongoose_1.default.Types.ObjectId(userId),
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
exports.default = mongoose_1.default.model('WaterLog', WaterLogSchema);
//# sourceMappingURL=WaterLog.js.map