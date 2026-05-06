"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hydrotrack';
        const conn = await mongoose_1.default.connect(mongoURI, {
        // Modern Mongoose doesn't need these options, but keeping for compatibility
        });
        console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
        // Handle connection events
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
        else {
            console.warn('⚠️ Continuing in development mode without database connection');
        }
    }
};
exports.connectDB = connectDB;
exports.default = exports.connectDB;
//# sourceMappingURL=database.js.map