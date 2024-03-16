import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHistory, faPlus, faDumbbell, faPerson } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const MobileNavbar = () => {
  const { currentUser } = useAuth();

  return (
    <div className="fixed bottom-0 inset-x-0 bg-blue-500 text-white py-2 md:hidden">
      <div className="flex justify-between">
        <Link to="/" className="flex flex-col items-center w-full"> {/* Use Link with to="/" */}
          <FontAwesomeIcon icon={faHome} size="lg" />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/history" className="flex flex-col items-center w-full"> {/* Use Link with to="/history" */}
          <FontAwesomeIcon icon={faHistory} size="lg" />
          <span className="text-xs">History</span>
        </Link>
        <Link to="/workout" className="flex flex-col items-center w-full"> {/* Use Link with to="/workout" */}
          <FontAwesomeIcon icon={faPlus} size="lg" />
          <span className="text-xs">Workout</span>
        </Link>
        <Link to="/exercises" className="flex flex-col items-center w-full"> {/* Use Link with to="/exercises" */}
          <FontAwesomeIcon icon={faDumbbell} size="lg" />
          <span className="text-xs">Exercises</span>
        </Link>
        <Link to="/coach" className="flex flex-col items-center w-full"> {/* Use Link with to="/coach" */}
          <FontAwesomeIcon icon={faPerson} size="lg" />
          <span className="text-xs">Coach</span>
        </Link>
        
      </div>
    </div>
  );
};

export default MobileNavbar;
