import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
      console.log('Login nested token:', data?.data?.token);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      const token = data.token || data.data?.token;
      localStorage.setItem('token', token);
      console.log('Login success:', data);
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
            placeholder="you@example.com"
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
