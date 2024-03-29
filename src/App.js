import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import Home from './pages/Home';
import History from './pages/History';
import Workout from './pages/Workout';
import ActiveWorkout from './pages/ActiveWorkout';
import Exercises from './pages/Exercises';
import Coach from './pages/Coach';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/active-workout" element={<ActiveWorkout />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/coach" element={<Coach />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
