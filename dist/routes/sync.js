"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const WaterLog_1 = __importDefault(require("../models/WaterLog"));
const Settings_1 = __importDefault(require("../models/Settings"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.protect);
// @desc    Sync data from client
// @route   POST /api/sync
// @access  Private
router.post('/', [
    (0, express_validator_1.body)('waterLogs')
        .optional()
        .isArray()
        .withMessage('Water logs must be an array'),
    (0, express_validator_1.body)('waterLogs.*.amount')
        .optional()
        .isInt({ min: 1, max: 2000 })
        .withMessage('Amount must be between 1 and 2000ml'),
    (0, express_validator_1.body)('waterLogs.*.date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in YYYY-MM-DD format'),
    (0, express_validator_1.body)('waterLogs.*.timestamp')
        .optional()
        .isISO8601()
        .withMessage('Timestamp must be a valid ISO date'),
    (0, express_validator_1.body)('settings')
        .optional()
        .isObject()
        .withMessage('Settings must be an object'),
    (0, express_validator_1.body)('timestamp')
        .isISO8601()
        .withMessage('Sync timestamp must be a valid ISO date')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const userId = req.user._id;
        const { waterLogs, settings, timestamp } = req.body;
        const syncResults = {
            waterLogs: { created: 0, updated: 0, errors: 0 },
            settings: { updated: false, error: null }
        };
        // Sync water logs
        if (waterLogs && Array.isArray(waterLogs)) {
            for (const logData of waterLogs) {
                try {
                    // Check if log already exists (by timestamp to avoid duplicates)
                    const existingLog = await WaterLog_1.default.findOne({
                        user: userId,
                        timestamp: logData.timestamp
                    });
                    if (existingLog) {
                        // Update existing log
                        await WaterLog_1.default.findByIdAndUpdate(existingLog._id, logData);
                        syncResults.waterLogs.updated++;
                    }
                    else {
                        // Create new log
                        await WaterLog_1.default.create({
                            ...logData,
                            user: userId
                        });
                        syncResults.waterLogs.created++;
                    }
                }
                catch (error) {
                    console.error('Error syncing water log:', error);
                    syncResults.waterLogs.errors++;
                }
            }
        }
        // Sync settings
        if (settings) {
            try {
                await Settings_1.default.findOneAndUpdate({ user: userId }, settings, { upsert: true, new: true, runValidators: true });
                syncResults.settings.updated = true;
            }
            catch (error) {
                console.error('Error syncing settings:', error);
                syncResults.settings.error = 'Failed to update settings';
            }
        }
        // Get latest data to send back to client
        const latestLogs = await WaterLog_1.default.find({ user: userId })
            .sort({ timestamp: -1 })
            .limit(50);
        const latestSettings = await Settings_1.default.getUserSettings(userId.toString());
        res.json({
            success: true,
            data: {
                waterLogs: latestLogs,
                settings: latestSettings,
                syncResults,
                serverTimestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get data for client sync
// @route   GET /api/sync
// @access  Private
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user._id;
    const { since } = req.query;
    let query = { user: userId };
    // If since parameter is provided, only get data after that timestamp
    if (since) {
        query.timestamp = { $gt: new Date(since) };
    }
    const waterLogs = await WaterLog_1.default.find(query).sort({ timestamp: -1 });
    const settings = await Settings_1.default.getUserSettings(userId.toString());
    res.json({
        success: true,
        data: {
            waterLogs,
            settings,
            serverTimestamp: new Date().toISOString()
        }
    });
}));
exports.default = router;
//# sourceMappingURL=sync.js.map