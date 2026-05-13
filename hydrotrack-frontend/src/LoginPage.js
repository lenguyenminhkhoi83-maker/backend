import { jsx as _jsx } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import Login from './Login';
export default function LoginPage() {
    const navigate = useNavigate();
    return _jsx(Login, { onNavigate: (path) => navigate(path) });
}
