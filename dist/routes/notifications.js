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
// @desc    Trigger a hydration reminder push notification for the current user
// @route   POST /api/notifications/remind
// @access  Private
router.post('/remind', [
    (0, express_validator_1.body)('title').optional().isString().withMessage('Title must be a string'),
    (0, express_validator_1.body)('body').optional().isString().withMessage('Body must be a string'),
    (0, express_validator_1.body)('data').optional().isObject().withMessage('Data must be an object')
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
        const { title = '💧 Hydration Reminder', body: message = 'Time to drink water and stay refreshed!', data = {} } = req.body;
        await pushService_1.pushService.sendNotificationToUser(req.user._id.toString(), {
            title,
            body: message,
            data
        });
        res.json({
            success: true,
            message: 'Hydration reminder sent successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map