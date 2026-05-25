import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Settings from '../models/Settings';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const settings = await Settings.getUserSettings(userId.toString());

  res.json({
    success: true,
    data: settings
  });
}));

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
router.put('/', [
  body('dailyGoal')
    .optional()
    .isInt({ min: 500, max: 5000 })
    .withMessage('Daily goal must be between 500 and 5000ml'),
  body('notifications.enabled')
    .optional()
    .isBoolean()
    .withMessage('Notifications enabled must be a boolean'),
  body('notifications.frequency')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Notification frequency must be between 15 and 480 minutes'),
  body('notifications.quietHours.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours start must be in HH:MM format'),
  body('notifications.quietHours.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours end must be in HH:MM format'),
  body('timezone')
    .optional()
    .isIn([
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
      'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
      'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
    ])
    .withMessage('Invalid timezone'),
  body('units')
    .optional()
    .isIn(['ml', 'oz'])
    .withMessage('Units must be either ml or oz')
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

    const userId = req.user!._id;
    const updates = req.body;

    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      updates,
      {
        new: true,
        runValidators: true,
        upsert: true // Create if doesn't exist
      }
    );

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update daily goal
// @route   PUT /api/settings/daily-goal
// @access  Private
router.put('/daily-goal', [
  body('dailyGoal')
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

    const userId = req.user!._id;
    const { dailyGoal } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      { dailyGoal },
      {
        new: true,
        runValidators: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update notification settings
// @route   PUT /api/settings/notifications
// @access  Private
router.put('/notifications', [
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean'),
  body('frequency')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Frequency must be between 15 and 480 minutes'),
  body('quietHours.start')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours start must be in HH:MM format'),
  body('quietHours.end')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Quiet hours end must be in HH:MM format')
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

    const userId = req.user!._id;
    const notificationUpdates = req.body;

    const settings = await Settings.findOneAndUpdate(
      { user: userId },
      { notifications: notificationUpdates },
      {
        new: true,
        runValidators: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
});

export default router;