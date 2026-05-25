"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const WaterLog_1 = __importDefault(require("../models/WaterLog"));
const auth_1 = require("../middleware/auth");
const statsController_1 = require("../controllers/statsController");
const router = express_1.default.Router();
const getWaterLogById = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
            return;
        }
        const waterLog = await WaterLog_1.default.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (!waterLog) {
            res.status(404).json({
                success: false,
                error: 'Water log not found'
            });
            return;
        }
        res.json({
            success: true,
            data: waterLog
        });
    }
    catch (error) {
        next(error);
    }
};
// All routes require authentication
router.use(auth_1.protect);
// @desc    Get water log statistics
// @route   GET /api/water-logs/stats
// @access  Private
router.get('/stats', auth_1.protect, statsController_1.getDailyStats);
// @desc    Get weekly statistics
// @route   GET /api/water-logs/stats/weekly
// @access  Private
router.get('/stats/weekly', auth_1.protect, statsController_1.getWeeklyStats);
// @desc    Get water logs for a user
// @route   GET /api/water-logs
// @access  Private
router.get('/', [
    (0, express_validator_1.query)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in YYYY-MM-DD format'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be at least 1')
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
        const { date, limit = 50, page = 1 } = req.query;
        // Build query
        const query = { user: userId };
        if (date) {
            query.date = date;
        }
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Get logs
        const logs = await WaterLog_1.default.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        // Get total count for pagination
        const total = await WaterLog_1.default.countDocuments(query);
        res.json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Add new water log
// @route   POST /api/water-logs
// @access  Private
router.post('/', [
    (0, express_validator_1.body)('amount')
        .isInt({ min: 1, max: 2000 })
        .withMessage('Amount must be between 1 and 2000ml'),
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in YYYY-MM-DD format'),
    (0, express_validator_1.body)('timestamp')
        .optional()
        .isISO8601()
        .withMessage('Timestamp must be a valid ISO date')
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
        const { amount, date = new Date().toISOString().split('T')[0], timestamp } = req.body;
        console.log(req.body);
        const userId = req.user._id;
        // Create water log
        const waterLog = await WaterLog_1.default.create({
            user: userId,
            amount,
            date,
            timestamp: timestamp || new Date()
        });
        res.status(201).json({
            success: true,
            data: waterLog
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get single water log
// @route   GET /api/water-logs/:id
// @access  Private
router.get('/:id', [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid water log ID')
], auth_1.protect, getWaterLogById);
// @desc    Update water log
// @route   PUT /api/water-logs/:id
// @access  Private
router.put('/:id', [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid water log ID'),
    (0, express_validator_1.body)('amount')
        .optional()
        .isInt({ min: 1, max: 2000 })
        .withMessage('Amount must be between 1 and 2000ml'),
    (0, express_validator_1.body)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in YYYY-MM-DD format'),
    (0, express_validator_1.body)('timestamp')
        .optional()
        .isISO8601()
        .withMessage('Timestamp must be a valid ISO date')
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
        const updates = req.body;
        const waterLog = await WaterLog_1.default.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true, runValidators: true });
        if (!waterLog) {
            return res.status(404).json({
                success: false,
                error: 'Water log not found'
            });
        }
        res.json({
            success: true,
            data: waterLog
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Delete water log
// @route   DELETE /api/water-logs/:id
// @access  Private
router.delete('/:id', [
    (0, express_validator_1.param)('id')
        .isMongoId()
        .withMessage('Invalid water log ID')
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
        const waterLog = await WaterLog_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!waterLog) {
            return res.status(404).json({
                success: false,
                error: 'Water log not found'
            });
        }
        res.json({
            success: true,
            data: {},
            message: 'Water log deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=waterLogs.js.map