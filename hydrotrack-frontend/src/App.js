import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PushNotificationSetup } from './PushNotificationSetup';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import './App.css';
function App() {
    return (_jsx(BrowserRouter, { children: _jsxs("div", { className: "App", children: [_jsxs("header", { className: "App-header", children: [_jsx("h1", { children: "HydroTrack" }), _jsx("p", { children: "Your hydration tracking companion" })] }), _jsx("main", { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/push", element: _jsx(PushNotificationSetup, {}) })] }) })] }) }));
}
export default App;
