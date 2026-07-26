import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

function App() {
  // Theme state
  const [theme, setTheme] = useState('theme-blue'); // Default Sporty Blue (no class needed or class theme-blue)

  useEffect(() => {
    // Apply theme class to body
    document.body.className = theme === 'theme-blue' ? '' : theme;
  }, [theme]);

  // For testing theme change temporarily:
  // You can set theme to 'theme-green' or 'theme-gold'

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard/*" element={<Dashboard setTheme={setTheme} />} />
    </Routes>
  );
}

export default App;
