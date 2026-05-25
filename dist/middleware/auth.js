"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOnly = exports.adminOnly = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        let token;
        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
            return;
        }
        if (!process.env.JWT_SECRET) {
            res.status(500).json({
                success: false,
                error: 'Server configuration error'
            });
            return;
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            // Get user from token
            const user = await User_1.default.findById(decoded.id);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'No user found with this token'
                });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
            return;
        }
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error in authentication'
        });
    }
};
exports.protect = protect;
// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
            return;
        }
        const userRole = req.user.role || 'user';
        if (!roles.includes(userRole)) {
            res.status(403).json({
                success: false,
                error: 'Forbidden: insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
exports.adminOnly = (0, exports.authorize)('admin');
exports.userOnly = (0, exports.authorize)('user');
//# sourceMappingURL=auth.js.map