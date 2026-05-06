import { useNavigate } from 'react-router-dom';
import Login from './Login';

export default function LoginPage() {
  const navigate = useNavigate();

  return <Login onNavigate={(path) => navigate(path)} />;
}
