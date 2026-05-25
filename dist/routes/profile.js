"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.protect);
// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.default.findById(req.user._id);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    res.json({
        success: true,
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            dailyGoal: user.dailyGoal,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
}));
// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('dailyGoal')
        .optional()
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
        const updates = req.body;
        // Check if email is being updated and if it's already taken
        if (updates.email) {
            const existingUser = await User_1.default.findOne({
                email: updates.email,
                _id: { $ne: req.user._id }
            });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already taken'
                });
            }
        }
        const user = await User_1.default.findByIdAndUpdate(req.user._id, updates, {
            new: true,
            runValidators: true
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                dailyGoal: user.dailyGoal,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
router.delete('/', async (req, res, next) => {
    try {
        // Note: In a real application, you might want to implement soft deletion
        // or require additional confirmation steps
        await User_1.default.findByIdAndDelete(req.user._id);
        // Also delete related data (water logs, settings)
        // This would be handled by MongoDB's cascading deletes or manual cleanup
        res.json({
            success: true,
            data: {},
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=profile.js.map