import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log(API_URL);
const Login = ({ onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        try {
            console.log(`${API_URL}/api/auth/login`);
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response) {
                throw new Error('No response from server');
            }
            const data = await response.json();
            console.log('Login response:', data);
            console.log('Login nested token:', data === null || data === void 0 ? void 0 : data.data.token);
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Login failed');
            }
            const token = data.token || (data === null || data === void 0 ? void 0 : data.data.token);
            localStorage.setItem('token', token);
            console.log('Login success:', data);
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
    return (_jsxs("div", { className: "login-card", children: [_jsx("h2", { children: "Login" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", placeholder: "Password", value: password, onChange: (e) => setPassword(e.target.value), required: true })] }), error && _jsx("p", { className: "error-message", children: error }), _jsx("button", { type: "submit", children: "Login" })] })] }));
};
export default Login;
