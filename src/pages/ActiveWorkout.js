import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveWorkoutModal from "../components/ActiveWorkoutModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";
import ExerciseSet from "../components/ExerciseSet";
import { db } from '../firebaseConfig';
import { collection, addDoc } from "firebase/firestore";
import { useTheme } from "../components/ThemeContext";

function ActiveWorkout() {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // useTheme hook must be inside the component function

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      sets: [{ prevWeight: "", prevReps: "", weight: "", reps: "", completed: false }],
    };
    setWorkoutExercises((prevExercises) => [...prevExercises, newExercise]);
    setShowModal(false);
  };

  const handleFinishWorkout = async () => {
    const userId = 'current-user-id';

    try {
      await addDoc(collection(db, "workouts"), {
        userId: userId,
        exercises: workoutExercises,
        timestamp: new Date(),
      });
      console.log("Workout saved successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error saving workout: ", error);
    }
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

  // Use the theme to conditionally set class names
  const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

  return (
    <div className={`active-workout-page min-h-screen ${containerClass}`}>
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
          exercisesData={exercisesData}
          handleAddExercise={handleAddExercise}
        />
      )}
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
