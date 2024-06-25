import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHistory, faPlus, faDumbbell, faPerson } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { usePersistedState } from './PersistedStateProvider'; // Adjust the import path as needed

const MobileNavbar = () => {
  const navigate = useNavigate();
  const { state } = usePersistedState();
  const { isActive } = state;

  const handleWorkoutClick = () => {
    if (isActive) {
      navigate('/active-workout');
    } else {
      navigate('/workout');
    }
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-blue-500 text-white py-2 md:hidden">
      <div className="flex justify-between">
        <Link to="/" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faHome} size="lg" />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faHistory} size="lg" />
          <span className="text-xs">History</span>
        </Link>
        <button onClick={handleWorkoutClick} className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faPlus} size="lg" />
          <span className="text-xs">Workout</span>
        </button>
        <Link to="/exercises" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faDumbbell} size="lg" />
          <span className="text-xs">Exercises</span>
        </Link>
        <Link to="/coach" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faPerson} size="lg" />
          <span className="text-xs">Coach</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavbar;
