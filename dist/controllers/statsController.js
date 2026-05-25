"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getWeeklyStats = exports.getDailyStats = void 0;
const WaterLog_1 = __importDefault(require("../models/WaterLog"));
const Settings_1 = __importDefault(require("../models/Settings"));
const formatDate = (date) => date.toISOString().slice(0, 10);
const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate)
    };
};
const buildDailyStats = (stats, startDate, endDate) => {
    const result = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const statsByDate = new Map(stats.map((item) => [item.date, item]));
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const isoDate = formatDate(date);
        const stat = statsByDate.get(isoDate);
        result.push({
            date: isoDate,
            total: stat?.total || 0,
            count: stat?.count || 0
        });
    }
    return result;
};
const getDailyStats = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const today = formatDate(new Date());
        const total = await WaterLog_1.default.getDailyTotal(userId, today);
        const settings = await Settings_1.default.getUserSettings(userId);
        const dailyGoal = settings.dailyGoal;
        res.json({
            success: true,
            data: {
                date: today,
                total,
                dailyGoal,
                remaining: Math.max(dailyGoal - total, 0),
                progress: Math.min(Math.round((total / dailyGoal) * 100), 100)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDailyStats = getDailyStats;
const getWeeklyStats = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const days = parseInt(req.query.days || '7', 10);
        const { startDate, endDate } = getDateRange(days);
        const stats = await WaterLog_1.default.getWeeklyStats(userId, startDate, endDate);
        const settings = await Settings_1.default.getUserSettings(userId);
        res.json({
            success: true,
            data: {
                startDate,
                endDate,
                dailyGoal: settings.dailyGoal,
                days: buildDailyStats(stats, startDate, endDate)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWeeklyStats = getWeeklyStats;
exports.getStats = exports.getDailyStats;
//# sourceMappingURL=statsController.js.map