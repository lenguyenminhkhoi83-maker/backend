import React, { useEffect, useState } from 'react';
import { authHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [goal, setGoal] = useState(2000);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        logout();
        return;
      }

      const res = await fetch(`${API_URL}/api/water-logs`, {
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

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchLogs();
    fetchGoal();
  }, []);

  const addWater = async (amount: number) => {
    const token = localStorage.getItem('token');

    const res = await fetch(`${API_URL}/api/water-logs`, {
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

        <div className="w-full bg-gray-200 h-3 rounded mt-2">
          <div
            className="bg-blue-500 h-3 rounded"
            style={{ width: `${progress}%` }}
          />
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
