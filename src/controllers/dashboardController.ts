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

export const getDashboard = async (
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

    const recentLogs = await WaterLog.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(5);

    const { startDate, endDate } = getDateRange(7);
    const weeklyStats = await WaterLog.getWeeklyStats(userId, startDate, endDate);
    const days = buildDailyStats(weeklyStats, startDate, endDate);
    const weeklyAverage = days.length > 0
      ? Math.round(days.reduce((sum, day) => sum + day.total, 0) / days.length)
      : 0;

    // Calculate current streak: consecutive days up to today meeting the daily goal
    let streak = 0;
    const reversedDays = [...days].reverse();
    for (const day of reversedDays) {
      if (day.total >= dailyGoal) {
        streak++;
      } else {
        break;
      }
    }

    const progress = Math.min(Math.round((total / dailyGoal) * 100), 100);

    let hydrationStatus = 'Low';
    if (progress >= 100) {
      hydrationStatus = 'Excellent';
    } else if (progress >= 75) {
      hydrationStatus = 'Good';
    } else if (progress >= 50) {
      hydrationStatus = 'Moderate';
    }

    res.json({
      success: true,
      data: {
        date: today,
        total,
        dailyGoal,
        remaining: Math.max(dailyGoal - total, 0),
        progress: Math.min(
          Math.round((total / dailyGoal) * 100),
          100
        ),

        hydrationStatus,

        streak,

        weeklyAverage,

        recentLogs,

        weekly: {
          startDate,
          endDate,
          days: buildDailyStats(
            weeklyStats,
            startDate,
            endDate
          )
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
