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
const NotificationSettingsSchema = new mongoose_1.Schema({
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
const SettingsSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
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
// Static method to get user settings with defaults
SettingsSchema.statics.getUserSettings = async function (userId) {
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
exports.default = mongoose_1.default.model('Settings', SettingsSchema);
//# sourceMappingURL=Settings.js.map