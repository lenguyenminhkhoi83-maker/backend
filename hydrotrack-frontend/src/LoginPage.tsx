import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return <Login onNavigate={navigate} />;
}