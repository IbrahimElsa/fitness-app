// src/components/MobileNavbar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, History, PlusCircle, Dumbbell, Pencil } from 'lucide-react';
import { usePersistedState } from './PersistedStateProvider';
import { useTheme } from './ThemeContext';

const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePersistedState();
  const { isActive: workoutActive } = state;
  const { theme, themeCss } = useTheme();

  const handleWorkoutClick = () => {
    if (workoutActive) {
      navigate('/active-workout');
    } else {
      navigate('/workout');
    }
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Pencil, label: 'Templates', path: '/templates' },
    { icon: PlusCircle, label: 'Workout', path: '/workout', onClick: handleWorkoutClick },
    { icon: Dumbbell, label: 'Exercises', path: '/exercises' },
    { icon: History, label: 'History', path: '/history' },
  ];

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${theme === 'light' ? themeCss.navbarLight : themeCss.navbarDark} md:hidden z-10`}>
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const active = isActivePath(item.path);
          const baseClasses = "flex flex-col items-center justify-center rounded-lg mx-1 w-full py-1";
          const activeClasses = active
            ? `${baseClasses} text-indigo-600 dark:text-indigo-400`
            : `${baseClasses} text-slate-500 dark:text-slate-400`;
            
          return item.onClick ? (
            <button
              key={item.path}
              onClick={item.onClick}
              className={activeClasses}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
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