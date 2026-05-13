import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import WaterLog from '../models/WaterLog';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Get water logs for a user
// @route   GET /api/water-logs
// @access  Private
router.get('/', [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be at least 1')
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
    const { date, limit = 50, page = 1 } = req.query;

    // Build query
    const query: any = { user: userId };
    if (date) {
      query.date = date;
    }

    // Calculate pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get logs
    const logs = await WaterLog.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit as string))
      .skip(skip);

    // Get total count for pagination
    const total = await WaterLog.countDocuments(query);

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Add new water log
// @route   POST /api/water-logs
// @access  Private
router.post('/', [
  body('amount')
    .isInt({ min: 1, max: 2000 })
    .withMessage('Amount must be between 1 and 2000ml'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO date')
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

    const { amount, date = new Date().toISOString().split('T')[0], timestamp } = req.body;
    console.log(req.body);
    const userId = req.user!._id;

    // Create water log
    const waterLog = await WaterLog.create({
      user: userId,
      amount,
      date,
      timestamp: timestamp || new Date()
    });

    res.status(201).json({
      success: true,
      data: waterLog
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get weekly statistics
// @route   GET /api/water-logs/weekly/stats
// @access  Private
router.get('/weekly/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!._id;

    // Get date 6 days ago to get 7 days of data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const weeklyStats = await WaterLog.getWeeklyStats(userId.toString(), startDateStr, endDateStr);

    // Fill in missing dates with zero values
    const filledStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const existingStat = weeklyStats.find((stat: any) => stat.date === dateStr);
      filledStats.push({
        date: dateStr,
        total: existingStat ? existingStat.total : 0,
        count: existingStat ? existingStat.count : 0
      });
    }

    res.json({
      success: true,
      data: filledStats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single water log
// @route   GET /api/water-logs/:id
// @access  Private
router.get('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid water log ID')
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

    const waterLog = await WaterLog.findOne({
      _id: req.params.id,
      user: req.user!._id
    });

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
  } catch (error) {
    next(error);
  }
});

// @desc    Update water log
// @route   PUT /api/water-logs/:id
// @access  Private
router.put('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid water log ID'),
  body('amount')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('Amount must be between 1 and 2000ml'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO date')
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

    const waterLog = await WaterLog.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      updates,
      { new: true, runValidators: true }
    );

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
  } catch (error) {
    next(error);
  }
});

// @desc    Delete water log
// @route   DELETE /api/water-logs/:id
// @access  Private
router.delete('/:id', [
  param('id')
    .isMongoId()
    .withMessage('Invalid water log ID')
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

    const waterLog = await WaterLog.findOneAndDelete({
      _id: req.params.id,
      user: req.user!._id
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
  } catch (error) {
    next(error);
  }
});

export default router;
