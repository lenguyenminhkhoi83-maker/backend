import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { authHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState(2000);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        logout();
        return;
      }

      const res = await fetch(`${API_URL}/api/v1/water-logs`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      const logsData = data?.data || [];

      setLogs(logsData);

      const today = new Date().toDateString();

      const todayLogs = logsData.filter(
        (log: any) =>
          new Date(log.createdAt || log.timestamp).toDateString() === today
      );

      const sum = todayLogs.reduce(
        (acc: number, log: any) => acc + (log.amount || 0),
        0
      );

      setTotal(sum);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const fetchGoal = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        logout();
        return;
      }

      const res = await fetch(`${API_URL}/api/settings`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setGoal(data?.data?.dailyGoal || 2000);
    } catch (error) {
      console.error('Failed to fetch goal:', error);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        logout();
        return;
      }

      const res = await fetch(`${API_URL}/api/v1/water-logs/stats/weekly`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setWeeklyData(data?.data?.days || []);
    } catch (error) {
      console.error('Failed to fetch weekly stats:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchLogs();
    fetchGoal();
    fetchWeeklyStats();
  }, []);

  const addWater = async (amount: number) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/api/v1/water-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    console.log(data);

    if (!res.ok) {
      console.error(data);
      return;
    }

    fetchLogs();
  };

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const progress = Math.min((total / goal) * 100, 100);

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">💧 Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      <div className="bg-blue-100 p-4 rounded-xl mb-4">
        <p>Today's intake</p>
        <h2 className="text-3xl font-bold">
          {total} / {goal} ml
        </h2>

        <div className="mt-4">
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-sm text-gray-700 mt-2">
            {Math.round(progress)}% of your daily goal
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[250, 500, 750].map((amt) => (
          <button
            key={amt}
            onClick={() => addWater(amt)}
            className="bg-blue-500 text-white py-2 rounded"
          >
            +{amt}ml
          </button>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
        <h3 className="font-semibold mb-3">Weekly Intake</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={weeklyData}
            margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Recent Logs</h3>

        {logs.slice(0, 5).map((log, i) => (
          <div key={i} className="border p-2 rounded mb-2">
            {log.amount} ml • {new Date(log.createdAt || log.timestamp).toLocaleTimeString()}
          </div>
        ))}
      </div>
    </div>
  );
}
