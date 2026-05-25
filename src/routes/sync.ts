import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import WaterLog from '../models/WaterLog';
import Settings from '../models/Settings';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @desc    Sync data from client
// @route   POST /api/sync
// @access  Private
router.post('/', [
  body('waterLogs')
    .optional()
    .isArray()
    .withMessage('Water logs must be an array'),
  body('waterLogs.*.amount')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('Amount must be between 1 and 2000ml'),
  body('waterLogs.*.date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('waterLogs.*.timestamp')
    .optional()
    .isISO8601()
    .withMessage('Timestamp must be a valid ISO date'),
  body('settings')
    .optional()
    .isObject()
    .withMessage('Settings must be an object'),
  body('timestamp')
    .isISO8601()
    .withMessage('Sync timestamp must be a valid ISO date')
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
    const { waterLogs, settings, timestamp } = req.body;

    const syncResults = {
      waterLogs: { created: 0, updated: 0, errors: 0 },
      settings: { updated: false, error: null as string | null }
    };

    // Sync water logs
    if (waterLogs && Array.isArray(waterLogs)) {
      for (const logData of waterLogs) {
        try {
          // Check if log already exists (by timestamp to avoid duplicates)
          const existingLog = await WaterLog.findOne({
            user: userId,
            timestamp: logData.timestamp
          });

          if (existingLog) {
            // Update existing log
            await WaterLog.findByIdAndUpdate(existingLog._id, logData);
            syncResults.waterLogs.updated++;
          } else {
            // Create new log
            await WaterLog.create({
              ...logData,
              user: userId
            });
            syncResults.waterLogs.created++;
          }
        } catch (error) {
          console.error('Error syncing water log:', error);
          syncResults.waterLogs.errors++;
        }
      }
    }

    // Sync settings
    if (settings) {
      try {
        await Settings.findOneAndUpdate(
          { user: userId },
          settings,
          { upsert: true, new: true, runValidators: true }
        );
        syncResults.settings.updated = true;
      } catch (error) {
        console.error('Error syncing settings:', error);
        syncResults.settings.error = 'Failed to update settings';
      }
    }

    // Get latest data to send back to client
    const latestLogs = await WaterLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(50);

    const latestSettings = await Settings.getUserSettings(userId.toString());

    res.json({
      success: true,
      data: {
        waterLogs: latestLogs,
        settings: latestSettings,
        syncResults,
        serverTimestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get data for client sync
// @route   GET /api/sync
// @access  Private
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { since } = req.query;

  let query: any = { user: userId };

  // If since parameter is provided, only get data after that timestamp
  if (since) {
    query.timestamp = { $gt: new Date(since as string) };
  }

  const waterLogs = await WaterLog.find(query).sort({ timestamp: -1 });
  const settings = await Settings.getUserSettings(userId.toString());

  res.json({
    success: true,
    data: {
      waterLogs,
      settings,
      serverTimestamp: new Date().toISOString()
    }
  });
}));

export default router;