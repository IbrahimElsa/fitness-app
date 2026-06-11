import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, History, PlusCircle, Pencil, BarChart2, Dumbbell } from "lucide-react";
import { usePersistedState } from "./PersistedStateProvider";
import { useTheme } from "./ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = usePersistedState();
  const { isActive: workoutActive } = state;
  const { theme, themeCss } = useTheme();

  const handleWorkoutClick = () => {
    navigate(workoutActive ? "/active-workout" : "/workout");
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Pencil, label: "Templates", path: "/templates" },
    { icon: PlusCircle, label: "Workout", path: "/workout", onClick: handleWorkoutClick },
    { icon: BarChart2, label: "Stats", path: "/statistics" },
    { icon: History, label: "History", path: "/history" },
  ];

  const isActivePath = (path) => {
    if (path === "/workout" && location.pathname === "/active-workout") {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <nav className={`hidden md:block ${theme === "light" ? themeCss.navbarLight : themeCss.navbarDark}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <Dumbbell size={20} className="text-indigo-600 dark:text-indigo-400" />
            <span>Gym Tracker</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActivePath(item.path);
              const classes = `flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`;
              const showWorkoutIndicator = item.path === "/workout" && workoutActive;

              const inner = (
                <>
                  <div className="relative">
                    <item.icon size={16} />
                    {showWorkoutIndicator && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-800"></div>
                    )}
                  </div>
                  <span>{item.label}</span>
                </>
              );

              return item.onClick ? (
                <button key={item.path} onClick={item.onClick} className={classes}>
                  {inner}
                </button>
              ) : (
                <Link key={item.path} to={item.path} className={classes}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
