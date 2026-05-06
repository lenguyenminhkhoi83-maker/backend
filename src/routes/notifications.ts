import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import { pushService } from '../services/pushService';

const router = express.Router();

router.use(protect);

// @desc    Trigger a hydration reminder push notification for the current user
// @route   POST /api/notifications/remind
// @access  Private
router.post('/remind', [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('body').optional().isString().withMessage('Body must be a string'),
  body('data').optional().isObject().withMessage('Data must be an object')
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title = '💧 Hydration Reminder', body: message = 'Time to drink water and stay refreshed!', data = {} } = req.body;

    await pushService.sendNotificationToUser(req.user!._id.toString(), {
      title,
      body: message,
      data
    });

    res.json({
      success: true,
      message: 'Hydration reminder sent successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
