import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveWorkoutModal from "../components/ActiveWorkoutModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";
import ExerciseSet from "../components/ExerciseSet"; // Import the ExerciseSet component

function ActiveWorkout() {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      sets: [{ prevWeight: "", prevReps: "", weight: "", reps: "", completed: false }],
    };
    setWorkoutExercises((prevExercises) => [...prevExercises, newExercise]);
    setShowModal(false);
  };

  const handleFinishWorkout = () => {
    navigate("/");
  };

  const handleCancelWorkout = () => {
    setShowCancelModal(true);
  };

  const confirmCancelWorkout = () => {
    navigate("/");
  };

  const openModal = () => {
    setShowModal(true);
  };

  return (
    <div className="active-workout-page bg-gray-900 text-white min-h-screen">
      {/* Timer and workout note components should go here */}
      <div className="flex flex-col items-center pt-4 space-y-4">
        <button
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
          onClick={openModal}
        >
          ADD EXERCISE
        </button>
        <button
          className="py-2 px-4 bg-green-600 hover:bg-green-700 focus:outline-none rounded text-white"
          onClick={handleFinishWorkout}
        >
          FINISH
        </button>
        <button
          className="py-2 px-4 bg-red-600 hover:bg-red-700 focus:outline-none rounded text-white"
          onClick={handleCancelWorkout}
        >
          CANCEL WORKOUT
        </button>
      </div>
      {showModal && (
        <ActiveWorkoutModal
          show={showModal}
          onClose={() => setShowModal(false)}
          title="Add Exercise"
          className="z-50"
          exercisesData={exercisesData}
          handleAddExercise={handleAddExercise}
        >
          <div className="max-h-96 overflow-y-auto">
            <ul className="flex flex-col space-y-2">
              {exercisesData.Exercises.map((exercise, index) => (
                <li
                  key={index}
                  onClick={() => handleAddExercise(exercise)}
                  className="cursor-pointer bg-gray-200 text-gray-800 rounded-md p-4 hover:bg-gray-300 transition-colors duration-200"
                >
                  {exercise.Name}
                </li>
              ))}
            </ul>
          </div>
        </ActiveWorkoutModal>
      )}
      {/* List of added exercises */}
      <div className="exercises">
        {workoutExercises.map((exercise, exerciseIndex) => (
          <div key={exerciseIndex}>
            {exercise.sets.map((set, setIndex) => (
              <ExerciseSet
                key={`${exerciseIndex}-${setIndex}`}
                exerciseName={exercise.Name}
                prevWeight={set.prevWeight}
                prevReps={set.prevReps}
                setNumber={setIndex + 1}
              />
            ))}
          </div>
        ))}
      </div>
      {showCancelModal && (
        <CancelModal
          onConfirm={confirmCancelWorkout}
          onClose={() => setShowCancelModal(false)}
        />
      )}
      <MobileNavbar />
    </div>
  );
}

export default ActiveWorkout;