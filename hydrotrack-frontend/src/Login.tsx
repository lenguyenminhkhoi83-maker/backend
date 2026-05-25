import React, { useState } from 'react';
import API from './api';

type LoginProps = {
  onNavigate: (path: string) => void;
};

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const res = await API.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem(
  "token",
  res.data.data.token
);
      onNavigate('/dashboard');
    } catch (err: any) {
      console.error('LOGIN ERROR:', err);

      if (err.message === 'Failed to fetch') {
        setError('Cannot connect to backend. Is server running?');
      } else {
        setError(err.message || 'Login error');
      }
    }
  };

  return (
    <div className="login-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
