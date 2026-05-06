"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
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
        const { name, email, password } = req.body;
        // Check if user exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }
        // Create user
        const user = await User_1.default.create({
            name,
            email,
            password
        });
        // Generate token
        const token = user.generateAuthToken();
        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    dailyGoal: user.dailyGoal,
                    createdAt: user.createdAt
                },
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
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
        const { email, password } = req.body;
        // Check for user
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Generate token
        const token = user.generateAuthToken();
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    dailyGoal: user.dailyGoal,
                    createdAt: user.createdAt
                },
                token
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth_1.protect, async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id);
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        next(error);
    }
});
// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', auth_1.protect, (req, res) => {
    res.json({
        success: true,
        data: {},
        message: 'User logged out successfully'
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map