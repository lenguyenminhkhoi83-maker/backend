import React, { useState } from 'react';
import axios from 'axios';
import API from './api';

type LoginProps = {
  onNavigate: (path: string) => void;
};

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem("token", res.data.data.token);
      onNavigate('/dashboard');

    } catch (err) {
      console.error(err);

      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.message);
      } else {
        setError('Login error');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2>Login</h2>

      <form onSubmit={handleSubmit} style={{ opacity: loading ? 0.7 : 1 }}>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  );
};

export default Login;