import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "../components/ThemeContext";

const ActiveWorkoutModal = ({
  show,
  title,
  onClose,
  shouldCloseOnOutsideClick = true,
  exercisesData,
  handleAddExercise,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  if (!show) {
    return null;
  }

  const handleOutsideClick = (e) => {
    if (shouldCloseOnOutsideClick && e.target.id === "modal-backdrop") {
      onClose();
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredExercises = exercisesData.Exercises.filter((exercise) =>
    exercise.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExerciseSelect = (exercise) => {
    handleAddExercise(exercise);
    onClose(); // Close the modal after selecting an exercise
  };

  const containerClass = theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white';
  const inputClass = theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-white';
  const itemClass = theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600';

  return ReactDOM.createPortal(
    <div
      id="modal-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleOutsideClick}
    >
      <div className={`rounded-md shadow-lg relative max-h-5/6 h-5/6 max-w-96 w-96 ${containerClass}`}>
        <div className="p-4 h-full overflow-y-auto">
          <h4 className="text-lg font-bold mb-4">{title}</h4>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={handleSearch}
              className={`rounded-md px-2 py-1 w-full ${inputClass}`}
            />
          </div>
          <ul className="space-y-2">
            {filteredExercises.map((exercise, index) => (
              <li
                key={index}
                onClick={() => handleExerciseSelect(exercise)}
                className={`cursor-pointer rounded-md p-4 transition-colors duration-200 ${itemClass}`}
              >
                {exercise.Name}
              </li>
            ))}
          </ul>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ×
        </button>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ActiveWorkoutModal;
