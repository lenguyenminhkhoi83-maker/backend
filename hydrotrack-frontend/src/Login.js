import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import API from './api';
const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        try {
            const res = await API.post('/auth/login', {
                email,
                password,
            });
            localStorage.setItem("token", res.data.data.token);
            onNavigate('/dashboard');
        }
        catch (err) {
            console.error('LOGIN ERROR:', err);
            if (err.message === 'Failed to fetch') {
                setError('Cannot connect to backend. Is server running?');
            }
            else {
                setError(err.message || 'Login error');
            }
        }
    };
    return (_jsxs("div", { className: "login-card", children: [_jsx("h2", { children: "Login" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", placeholder: "user@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), error && _jsx("p", { className: "error-message", children: error }), _jsx("button", { type: "submit", children: "Login" })] })] }));
};
export default Login;
