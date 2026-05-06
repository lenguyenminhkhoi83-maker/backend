import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PushNotificationSetup } from './PushNotificationSetup';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>HydroTrack</h1>
          <p>Your hydration tracking companion</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/push" element={<PushNotificationSetup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
