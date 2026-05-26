import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * REGISTER
 */
router.post(
  '/register',
  [
    body('name').isLength({ min: 2, max: 50 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array() });
      }

      const { name, email, password } = req.body || {};

      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          error: 'User already exists',
        });
      }

      const user = await User.create({ name, email, password });
      const token = user.generateAuthToken();

      return res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            dailyGoal: user.dailyGoal,
            createdAt: user.createdAt,
          },
          accessToken: token,
        },
      });
    } catch (err) {
      console.error('REGISTER ERROR:', err);
      next(err);
    }
  }
);

/**
 * LOGIN
 */
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array() });
      }

      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password required',
        });
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const match = await user.comparePassword(password);

      if (!match) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      const token = user.generateAuthToken();

      return res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            dailyGoal: user.dailyGoal,
            createdAt: user.createdAt,
          },
          accessToken: token,
        },
      });
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      next(err);
    }
  }
);

/**
 * GET ME
 */
router.get('/me', protect, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('ME ERROR:', err);
    next(err);
  }
});

/**
 * LOGOUT
 */
router.post('/logout', protect, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out',
  });
});

export default router;