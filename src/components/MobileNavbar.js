import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHistory, faPlus, faDumbbell, faPerson } from '@fortawesome/free-solid-svg-icons';

const MobileNavbar = () => {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-blue-500 text-white py-2 md:hidden">
      <div className="flex justify-between">
        <a href="#" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faHome} size="lg" />
          <span className="text-xs">Home</span>
        </a>
        <a href="#" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faHistory} size="lg" />
          <span className="text-xs">History</span>
        </a>
        <a href="#" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faPlus} size="lg" />
          <span className="text-xs">Workout</span>
        </a>
        <a href="#" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faDumbbell} size="lg" />
          <span className="text-xs">Exercises</span>
        </a>
        <a href="#" className="flex flex-col items-center w-full">
          <FontAwesomeIcon icon={faPerson} size="lg" />
          <span className="text-xs">Coach</span>
        </a>
      </div>
    </div>
  );
};

export default MobileNavbar;
