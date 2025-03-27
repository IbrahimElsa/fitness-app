// src/components/MobileNavbar.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, History, PlusCircle, Pencil, BarChart2 } from 'lucide-react';
import { usePersistedState } from './PersistedStateProvider';
import { useTheme } from './ThemeContext';
import { useAuth } from '../AuthContext';

const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePersistedState();
  const { isActive: workoutActive } = state;
  const { theme, themeCss } = useTheme();
  const { loading } = useAuth();
  const [localWorkoutActive, setLocalWorkoutActive] = useState(workoutActive);

  // Check localStorage for active workout in case persisted state not updated yet
  useEffect(() => {
    const checkActiveWorkout = () => {
      const savedIsActive = localStorage.getItem("isActive");
      const activeWorkoutData = localStorage.getItem("activeWorkout");
      
      const isActiveFromLocalStorage = 
        savedIsActive === "true" || 
        (activeWorkoutData && JSON.parse(activeWorkoutData).isActive);
      
      setLocalWorkoutActive(workoutActive || isActiveFromLocalStorage);
    };

    checkActiveWorkout();
  }, [workoutActive]);

  const handleWorkoutClick = () => {
    // Double-check localStorage as well
    const savedIsActive = localStorage.getItem("isActive");
    const activeWorkoutData = localStorage.getItem("activeWorkout");
    
    const isActiveFromLocalStorage = 
      savedIsActive === "true" || 
      (activeWorkoutData && JSON.parse(activeWorkoutData).isActive);
    
    if (workoutActive || isActiveFromLocalStorage) {
      navigate('/active-workout');
    } else {
      navigate('/workout');
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Pencil, label: 'Templates', path: '/templates' },
    { icon: PlusCircle, label: 'Workout', path: '/workout', onClick: handleWorkoutClick },
    { icon: BarChart2, label: 'Stats', path: '/statistics' },
    { icon: History, label: 'History', path: '/history' },
  ];

  // Don't render navbar while auth is loading
  if (loading) return null;

  const isActivePath = (path) => {
    // Special case for active workout
    if (path === '/workout' && location.pathname === '/active-workout') {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${theme === 'light' ? themeCss.navbarLight : themeCss.navbarDark} md:hidden z-10`}>
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const active = isActivePath(item.path);
          const baseClasses = "flex flex-col items-center justify-center rounded-lg mx-1 w-full py-1";
          const activeClasses = active
            ? `${baseClasses} text-indigo-600 dark:text-indigo-400`
            : `${baseClasses} text-slate-500 dark:text-slate-400`;
            
          // Show visual indicator if there's an active workout
          const showWorkoutIndicator = item.path === '/workout' && localWorkoutActive;
            
          return item.onClick ? (
            <button
              key={item.path}
              onClick={item.onClick}
              className={activeClasses}
            >
              <div className="relative">
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {showWorkoutIndicator && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-slate-800"></div>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {active && <div className="w-1/2 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-1" />}
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={activeClasses}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
              {active && <div className="w-1/2 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-1" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;