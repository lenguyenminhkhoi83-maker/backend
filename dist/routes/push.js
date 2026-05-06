"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const pushService_1 = require("../services/pushService");
const router = express_1.default.Router();
router.use(auth_1.protect);
// @desc    Register push subscription
// @route   POST /api/push/subscribe
// @access  Private
router.post('/subscribe', [
    (0, express_validator_1.body)('subscription').notEmpty().withMessage('Subscription payload is required')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { subscription } = req.body;
        const saved = await pushService_1.pushService.saveSubscription(subscription, req.user._id.toString());
        res.status(201).json({
            success: true,
            data: saved
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Unregister push subscription
// @route   POST /api/push/unsubscribe
// @access  Private
router.post('/unsubscribe', [
    (0, express_validator_1.body)('endpoint').notEmpty().withMessage('Endpoint is required')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        await pushService_1.pushService.removeSubscription(req.body.endpoint);
        res.json({
            success: true,
            message: 'Subscription removed successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Send a push notification to current user
// @route   POST /api/push/send
// @access  Private
router.post('/send', [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('body').notEmpty().withMessage('Body is required')
], async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { title, body: message, data } = req.body;
        await pushService_1.pushService.sendNotificationToUser(req.user._id.toString(), {
            title,
            body: message,
            data: data || {}
        });
        res.json({
            success: true,
            message: 'Notification sent'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=push.js.map