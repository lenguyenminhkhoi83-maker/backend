import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { isLoggedIn } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [logs, setLogs] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState(2000);

  // ======================
  // HELPERS
  // ======================
  const formatDate = (d: any) =>
    new Date(d).toISOString().split('T')[0];

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // ======================
  // FETCH LOGS
  // ======================
  const fetchLogs = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return logout();

      const res = await fetch(`${API_URL}/api/v1/water-logs`, {
        headers: authHeaders(),
      });

      if (res.status === 401) return logout();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const fetchedLogs = data?.data || [];

      setLogs(fetchedLogs);

      const today = formatDate(new Date());

      const totalToday = fetchedLogs
        .filter((l: any) => formatDate(l.date || l.createdAt) === today)
        .reduce((sum: number, l: any) => sum + (l.amount || 0), 0);

      setTotal(totalToday);
    } catch (err) {
      console.error('fetchLogs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // FETCH GOAL
  // ======================
  const fetchGoal = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setGoal(data?.data?.dailyGoal || 2000);
    } catch (err) {
      console.error('fetchGoal error:', err);
    }
  };

  // ======================
  // FETCH WEEKLY
  // ======================
  const fetchWeeklyStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/water-logs/stats/weekly`, {
        headers: authHeaders(),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setWeeklyData(
        Array.isArray(data?.data?.days)
          ? data.data.days
          : []
      );
    } catch (err) {
      console.error('fetchWeeklyStats error:', err);
    }
  };

  // ======================
  // INIT
  // ======================
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const load = async () => {
      await Promise.all([
        fetchLogs(),
        fetchGoal(),
        fetchWeeklyStats()
      ]);
    };

    load();
  }, [navigate]);

  // ======================
  // ADD WATER
  // ======================
  const addWater = async (amount: number) => {
    setAdding(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) return logout();

      const res = await fetch(`${API_URL}/api/v1/water-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) throw new Error();

      await fetchLogs();
    } catch (err) {
      console.error('addWater error:', err);
    } finally {
      setAdding(false);
    }
  };

  // ======================
  // UI STATE
  // ======================
  const progress = Math.min((total / goal) * 100, 100);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ======================
  // UI
  // ======================
  return (
    <div className="p-6 max-w-md mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">💧 Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* PROGRESS */}
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
            />
          </div>

          <p className="text-sm text-gray-700 mt-2">
            {Math.round(progress)}% of your daily goal
          </p>
        </div>
      </div>

      {/* ADD WATER */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[250, 500, 750].map((amt) => (
          <button
            key={amt}
            onClick={() => addWater(amt)}
            disabled={adding}
            className="bg-blue-500 text-white py-2 rounded disabled:opacity-50"
          >
            +{amt}ml
          </button>
        ))}
      </div>

      {/* WEEKLY CHART */}
      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm">
        <h3 className="font-semibold mb-3">Weekly Intake</h3>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* LOGS */}
      <div>
        <h3 className="font-semibold mb-2">Recent Logs</h3>

        {logs.length === 0 && (
          <p className="text-gray-500">No logs yet</p>
        )}

        {logs.slice(0, 5).map((log, i) => (
          <div key={i} className="border p-2 rounded mb-2">
            {log.amount} ml •{' '}
            {new Date(
              log.createdAt || log.timestamp
            ).toLocaleTimeString()}
          </div>
        ))}
      </div>
    </div>
  );
}