"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Settings_1 = __importDefault(require("../models/Settings"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.protect);
// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user._id;
        const settings = await Settings_1.default.getUserSettings(userId.toString());
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', [
    (0, express_validator_1.body)('dailyGoal')
        .optional()
        .isInt({ min: 500, max: 5000 })
        .withMessage('Daily goal must be between 500 and 5000ml'),
    (0, express_validator_1.body)('notifications.enabled')
        .optional()
        .isBoolean()
        .withMessage('Notifications enabled must be a boolean'),
    (0, express_validator_1.body)('notifications.frequency')
        .optional()
        .isInt({ min: 15, max: 480 })
        .withMessage('Notification frequency must be between 15 and 480 minutes'),
    (0, express_validator_1.body)('notifications.quietHours.start')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Quiet hours start must be in HH:MM format'),
    (0, express_validator_1.body)('notifications.quietHours.end')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Quiet hours end must be in HH:MM format'),
    (0, express_validator_1.body)('timezone')
        .optional()
        .isIn([
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
        'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
        'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
    ])
        .withMessage('Invalid timezone'),
    (0, express_validator_1.body)('units')
        .optional()
        .isIn(['ml', 'oz'])
        .withMessage('Units must be either ml or oz')
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
        const updates = req.body;
        const settings = await Settings_1.default.findOneAndUpdate({ user: userId }, updates, {
            new: true,
            runValidators: true,
            upsert: true // Create if doesn't exist
        });
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update daily goal
// @route   PUT /api/settings/daily-goal
// @access  Private
router.put('/daily-goal', [
    (0, express_validator_1.body)('dailyGoal')
        .isInt({ min: 500, max: 5000 })
        .withMessage('Daily goal must be between 500 and 5000ml')
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
        const { dailyGoal } = req.body;
        const settings = await Settings_1.default.findOneAndUpdate({ user: userId }, { dailyGoal }, {
            new: true,
            runValidators: true,
            upsert: true
        });
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
router.put('/notifications', [
    (0, express_validator_1.body)('enabled')
        .optional()
        .isBoolean()
        .withMessage('Enabled must be a boolean'),
    (0, express_validator_1.body)('frequency')
        .optional()
        .isInt({ min: 15, max: 480 })
        .withMessage('Frequency must be between 15 and 480 minutes'),
    (0, express_validator_1.body)('quietHours.start')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Quiet hours start must be in HH:MM format'),
    (0, express_validator_1.body)('quietHours.end')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Quiet hours end must be in HH:MM format')
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
        const notificationUpdates = req.body;
        const settings = await Settings_1.default.findOneAndUpdate({ user: userId }, { notifications: notificationUpdates }, {
            new: true,
            runValidators: true,
            upsert: true
        });
        res.json({
            success: true,
            data: settings
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map