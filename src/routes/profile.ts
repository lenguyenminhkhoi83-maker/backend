import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const user = await User.findById(req.user!._id);

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
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('dailyGoal')
    .optional()
    .isInt({ min: 500, max: 5000 })
    .withMessage('Daily goal must be between 500 and 5000ml')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
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
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user!._id }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email is already taken'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

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
  } catch (error) {
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

    await User.findByIdAndDelete(req.user!._id);

    // Also delete related data (water logs, settings)
    // This would be handled by MongoDB's cascading deletes or manual cleanup

    res.json({
      success: true,
      data: {},
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;