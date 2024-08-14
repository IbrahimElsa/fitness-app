import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, History, PlusCircle, Dumbbell, Pencil } from 'lucide-react';
import { usePersistedState } from './PersistedStateProvider';
import { useTheme } from './ThemeContext';

const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePersistedState();
  const { isActive } = state;
  const { theme, themeCss } = useTheme();

  const handleWorkoutClick = () => {
    if (isActive) {
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

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${theme === 'light' ? themeCss.navbarLight : themeCss.navbarDark} shadow-lg md:hidden`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          item.onClick ? (
            <button
              key={item.path}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center w-full h-full ${
                location.pathname === item.path
                  ? 'text-blue-500'
                  : 'text-gray-500'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full ${
                location.pathname === item.path
                  ? 'text-blue-500'
                  : 'text-gray-500'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
};

export default MobileNavbar;
