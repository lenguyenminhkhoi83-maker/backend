import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth';
import { pushService } from '../services/pushService';

const router = express.Router();

router.use(protect);

// @desc    Register push subscription
// @route   POST /api/push/subscribe
// @access  Private
router.post('/subscribe', [
  body('subscription').notEmpty().withMessage('Subscription payload is required')
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

    const { subscription } = req.body;
    const saved = await pushService.saveSubscription(subscription, req.user!._id.toString());

    res.status(201).json({
      success: true,
      data: saved
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Unregister push subscription
// @route   POST /api/push/unsubscribe
// @access  Private
router.post('/unsubscribe', [
  body('endpoint').notEmpty().withMessage('Endpoint is required')
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

    await pushService.removeSubscription(req.body.endpoint);

    res.json({
      success: true,
      message: 'Subscription removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Send a push notification to current user
// @route   POST /api/push/send
// @access  Private
router.post('/send', [
  body('title').notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Body is required')
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

    const { title, body: message, data } = req.body;
    await pushService.sendNotificationToUser(req.user!._id.toString(), {
      title,
      body: message,
      data: data || {}
    });

    res.json({
      success: true,
      message: 'Notification sent'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
