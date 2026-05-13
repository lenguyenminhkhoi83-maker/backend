import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export default function Dashboard() {
    const [logs, setLogs] = useState([]);
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
            const todayLogs = logsData.filter((log) => new Date(log.createdAt || log.timestamp).toDateString() === today);
            const sum = todayLogs.reduce((acc, log) => acc + (log.amount || 0), 0);
            setTotal(sum);
        }
        catch (error) {
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
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
        }
        catch (error) {
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
    const addWater = async (amount) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                logout();
                return;
            }
            const res = await fetch(`${API_URL}/api/water-logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ amount }),
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            fetchLogs();
        }
        catch (error) {
            console.error('Failed to add water log:', error);
        }
    };
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };
    const progress = Math.min((total / goal) * 100, 100);
    return (_jsxs("div", { className: "p-6 max-w-md mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uD83D\uDCA7 Dashboard" }), _jsx("button", { onClick: logout, className: "bg-red-500 text-white py-2 px-4 rounded", children: "Logout" })] }), _jsxs("div", { className: "bg-blue-100 p-4 rounded-xl mb-4", children: [_jsx("p", { children: "Today's intake" }), _jsxs("h2", { className: "text-3xl font-bold", children: [total, " / ", goal, " ml"] }), _jsx("div", { className: "w-full bg-gray-200 h-3 rounded mt-2", children: _jsx("div", { className: "bg-blue-500 h-3 rounded", style: { width: `${progress}%` } }) })] }), _jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [250, 500, 750].map((amt) => (_jsxs("button", { onClick: () => addWater(amt), className: "bg-blue-500 text-white py-2 rounded", children: ["+", amt, "ml"] }, amt))) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Recent Logs" }), logs.slice(0, 5).map((log, i) => (_jsxs("div", { className: "border p-2 rounded mb-2", children: [log.amount, " ml \u2022 ", new Date(log.createdAt || log.timestamp).toLocaleTimeString()] }, i)))] })] }));
}
