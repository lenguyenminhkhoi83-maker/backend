import { Request, Response, NextFunction } from 'express';
import WaterLog from '../models/WaterLog';
import Settings from '../models/Settings';

const formatDate = (date: Date): string => date.toISOString().slice(0, 10);

const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - (days - 1));

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

const buildDailyStats = (
  stats: Array<{ date: string; total: number; count: number }>,
  startDate: string,
  endDate: string
): Array<{ date: string; total: number; count: number }> => {
  const result: Array<{ date: string; total: number; count: number }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const statsByDate = new Map(stats.map((item) => [item.date, item]));

  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const isoDate = formatDate(date);
    const stat = statsByDate.get(isoDate);

    result.push({
      date: isoDate,
      total: stat?.total || 0,
      count: stat?.count || 0
    });
  }

  return result;
};

export const getDailyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const today = formatDate(new Date());

    const total = await WaterLog.getDailyTotal(userId, today);
    const settings = await Settings.getUserSettings(userId);
    const dailyGoal = settings.dailyGoal;

    res.json({
      success: true,
      data: {
        date: today,
        total,
        dailyGoal,
        remaining: Math.max(dailyGoal - total, 0),
        progress: Math.min(Math.round((total / dailyGoal) * 100), 100)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const days = parseInt((req.query.days as string) || '7', 10);
    const { startDate, endDate } = getDateRange(days);

    const stats = await WaterLog.getWeeklyStats(userId, startDate, endDate);
    const settings = await Settings.getUserSettings(userId);

    res.json({
      success: true,
      data: {
        startDate,
        endDate,
        dailyGoal: settings.dailyGoal,
        days: buildDailyStats(stats, startDate, endDate)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = getDailyStats;
