import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import API from './api';
const Login = ({ onNavigate }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (loading)
            return;
        setError(null);
        setLoading(true);
        try {
            const res = await API.post('/auth/login', {
                email,
                password,
            });
            const token = res.data?.data?.token;
            if (!token) {
                throw new Error('Token not found in response');
            }
            localStorage.setItem('token', token);
            onNavigate('/dashboard');
        }
        catch (err) {
            setError(err?.response?.data?.error ||
                err?.message ||
                'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "login-card", children: [_jsx("h2", { children: "Login" }), _jsxs("form", { onSubmit: handleSubmit, style: { opacity: loading ? 0.7 : 1 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: email, disabled: loading, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx("input", { type: "password", value: password, disabled: loading, onChange: (e) => setPassword(e.target.value), required: true })] }), error && _jsx("p", { className: "error-message", children: error }), _jsx("button", { type: "submit", disabled: loading, children: loading ? "Logging in..." : "Login" })] })] }));
};
export default Login;
