import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from './api';
import { isLoggedIn } from './auth';
export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [logs, setLogs] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [total, setTotal] = useState(0);
    const [goal, setGoal] = useState(2000);
    // ======================
    // HELPERS
    // ======================
    const getDate = (d) => new Date(d).toISOString().split('T')[0];
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
            const res = await API.get('/api/v1/water-logs');
            const fetchedLogs = res.data?.data || [];
            setLogs(fetchedLogs);
            const today = new Date().toISOString().split('T')[0];
            const totalToday = fetchedLogs
                .filter((l) => getDate(l.date || l.createdAt) === today)
                .reduce((sum, l) => sum + (l.amount || 0), 0);
            setTotal(totalToday);
        }
        catch (err) {
            console.error('fetchLogs error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    // ======================
    // FETCH GOAL
    // ======================
    const fetchGoal = async () => {
        try {
            const res = await API.get('/api/settings');
            setGoal(res.data?.data?.dailyGoal || 2000);
        }
        catch (err) {
            console.error('fetchGoal error:', err);
        }
    };
    // ======================
    // FETCH WEEKLY
    // ======================
    const fetchWeeklyStats = async () => {
        try {
            const res = await API.get('/api/v1/water-logs/stats/weekly');
            setWeeklyData(Array.isArray(res.data?.data?.days)
                ? res.data.data.days
                : []);
        }
        catch (err) {
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
    const addWater = async (amount) => {
        setAdding(true);
        try {
            await API.post('/api/v1/water-logs', { amount });
            await fetchLogs();
        }
        catch (err) {
            console.error('addWater error:', err);
        }
        finally {
            setAdding(false);
        }
    };
    // ======================
    // UI STATE
    // ======================
    const progress = Math.min((total / goal) * 100, 100);
    if (loading) {
        return (_jsx("div", { className: "p-6 text-center", children: _jsx("p", { children: "Loading dashboard..." }) }));
    }
    // ======================
    // UI
    // ======================
    return (_jsxs("div", { className: "p-6 max-w-md mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "\uD83D\uDCA7 Dashboard" }), _jsx("button", { onClick: logout, className: "bg-red-500 text-white py-2 px-4 rounded", children: "Logout" })] }), _jsxs("div", { className: "bg-blue-100 p-4 rounded-xl mb-4", children: [_jsx("p", { children: "Today's intake" }), _jsxs("h2", { className: "text-3xl font-bold", children: [total, " / ", goal, " ml"] }), _jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "w-full bg-gray-200 h-4 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-blue-500 h-full rounded-full transition-all duration-300", style: { width: `${progress}%` } }) }), _jsxs("p", { className: "text-sm text-gray-700 mt-2", children: [Math.round(progress), "% of your daily goal"] })] })] }), _jsx("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [250, 500, 750].map((amt) => (_jsxs("button", { onClick: () => addWater(amt), disabled: adding, className: "bg-blue-500 text-white py-2 rounded disabled:opacity-50", children: ["+", amt, "ml"] }, amt))) }), _jsxs("div", { className: "bg-white p-4 rounded-xl mb-4 shadow-sm", children: [_jsx("h3", { className: "font-semibold mb-3", children: "Weekly Intake" }), _jsx(ResponsiveContainer, { width: "100%", height: 260, children: _jsxs(LineChart, { data: weeklyData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "total", stroke: "#2563eb", strokeWidth: 2 })] }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Recent Logs" }), logs.length === 0 && (_jsx("p", { className: "text-gray-500", children: "No logs yet" })), logs.slice(0, 5).map((log, i) => (_jsxs("div", { className: "border p-2 rounded mb-2", children: [log.amount, " ml \u2022", ' ', new Date(log.createdAt || log.timestamp).toLocaleTimeString()] }, i)))] })] }));
}
