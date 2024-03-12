import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import History from './pages/History';
import Workout from './pages/Workout';
import Exercises from './pages/Exercises';
import Coach from './pages/Coach';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/workout" element={<Workout />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/coach" element={<Coach />} />
      </Routes>
    </Router>
  );
}

export default App;
