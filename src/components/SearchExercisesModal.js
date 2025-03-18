import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useTheme } from "./ThemeContext";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useAuth } from "../AuthContext";

const SearchExercisesModal = ({
  show,
  title,
  onClose,
  shouldCloseOnOutsideClick = true,
  exercisesData,
  handleAddExercise,
  modalZIndex = 50  // Default z-index value
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [customExerciseCategory, setCustomExerciseCategory] = useState("");
  const [customExerciseMuscle, setCustomExerciseMuscle] = useState("");
  const [userExercises, setUserExercises] = useState([]);

  useEffect(() => {
    const fetchUserExercises = async () => {
      try {
        const userId = currentUser.uid;
        const userExercisesCollectionRef = collection(db, "users", userId, "exercises");
        const querySnapshot = await getDocs(userExercisesCollectionRef);
        const exercises = querySnapshot.docs.map(doc => doc.data());
        setUserExercises(exercises);
      } catch (error) {
        console.error("Error fetching user exercises: ", error);
      }
    };

    fetchUserExercises();
  }, [currentUser]);

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

  const handleExerciseSelect = (exercise) => {
    handleAddExercise(exercise);
    onClose();
  };

  const handleAddCustomExercise = async () => {
    try {
      const newExercise = {
        Name: customExerciseName,
        Category: customExerciseCategory,
        Muscle: customExerciseMuscle
      };
      const userId = currentUser.uid;
      const userExercisesCollectionRef = collection(db, "users", userId, "exercises");

      await addDoc(userExercisesCollectionRef, newExercise);
      handleAddExercise(newExercise);
      onClose();
    } catch (error) {
      console.error("Error adding custom exercise: ", error);
    }
  };

  const containerClass = theme === 'light' ? 'bg-white text-gray-800' : 'bg-gray-800 text-white';
  const inputClass = theme === 'light' ? 'bg-gray-200 text-gray-800' : 'bg-gray-700 text-white';
  const itemClass = theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-gray-700 text-white hover:bg-gray-600';

  const allExercises = [...exercisesData.Exercises, ...userExercises];
  const filteredExercises = allExercises.filter((exercise) =>
    exercise.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = ["Barbell", "Dumbbell", "Smith Machine", "Machine", "Cable", "Bodyweight"];
  const muscles = ["Chest", "Back", "Legs", "Shoulders", "Triceps", "Biceps", "Abs"];

  return ReactDOM.createPortal(
    <div
      id="modal-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleOutsideClick}
      style={{ zIndex: modalZIndex }} // Apply the custom z-index
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
          {filteredExercises.length === 0 && (
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add custom exercise..."
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                className={`rounded-md px-2 py-1 w-full ${inputClass} mb-2`}
              />
              <select
                value={customExerciseCategory}
                onChange={(e) => setCustomExerciseCategory(e.target.value)}
                className={`rounded-md px-2 py-1 w-full ${inputClass} mb-2`}
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={customExerciseMuscle}
                onChange={(e) => setCustomExerciseMuscle(e.target.value)}
                className={`rounded-md px-2 py-1 w-full ${inputClass} mb-2`}
              >
                <option value="">Select Muscle Group</option>
                {muscles.map((muscle, index) => (
                  <option key={index} value={muscle}>{muscle}</option>
                ))}
              </select>
              <button
                className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white w-full"
                onClick={handleAddCustomExercise}
              >
                Add Custom Exercise
              </button>
            </div>
          )}
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

export default SearchExercisesModal;