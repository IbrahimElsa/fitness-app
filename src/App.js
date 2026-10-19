import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './components/ThemeContext';
import PersistedStateProvider from './components/PersistedStateProvider';
import RequireAuth from './components/RequireAuth';
import OfflineBanner from './components/OfflineBanner';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Home from './pages/Home';
import History from './pages/History';
import Workout from './pages/Workout';
import ActiveWorkout from './pages/ActiveWorkout';
import Exercises from './pages/Exercises';
import Templates from './pages/Templates';
import EditTemplate from './pages/EditTemplate';
import Profile from './pages/Profile';
import FinishedWorkout from './pages/FinishedWorkout';
import Statistics from './pages/Statistics';

// Pages that render their own signed-out state (Home, Workout, Statistics,
// Exercises, ActiveWorkout, FinishedWorkout) stay open; the rest need a user.
const guarded = (element) => <RequireAuth>{element}</RequireAuth>;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PersistedStateProvider>
          <Router>
            <OfflineBanner />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={guarded(<Profile />)} />
              <Route path="/history" element={guarded(<History />)} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/active-workout" element={<ActiveWorkout />} />
              <Route path="/finished-workout" element={<FinishedWorkout />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/templates" element={guarded(<Templates />)} />
              <Route path="/edit-template" element={guarded(<EditTemplate />)} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </Router>
        </PersistedStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
