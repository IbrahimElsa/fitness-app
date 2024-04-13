import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveWorkoutModal from "../components/ActiveWorkoutModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";
import ExerciseSet from "../components/ExerciseSet";
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { useTheme } from "../components/ThemeContext";
import { useWorkout } from "../components/WorkoutContext";
import { useAuth } from "../AuthContext";

function ActiveWorkout() {
  const { workoutExercises, startWorkout, finishWorkout, cancelWorkout, updateExerciseSets } = useWorkout();
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();

  const handleAddExercise = (exercise) => {
    const newExercise = { ...exercise, sets: [{ prevWeight: "", prevReps: "", weight: "", reps: "", completed: false }] };
    const updatedExercises = [...workoutExercises, newExercise];
    startWorkout(updatedExercises);
    setShowModal(false);
  };

  const handleFinishWorkout = async () => {
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }
  
    const userId = currentUser.uid;
    const workoutsCollectionRef = collection(db, `users/${userId}/workouts`);
  
    try {
      const workoutsSnapshot = await getDocs(workoutsCollectionRef);
      const workoutNumber = workoutsSnapshot.size + 1;
      const workoutDocName = `workout ${workoutNumber}`;
  
      const workoutData = {
        exercises: workoutExercises.map(exercise => {
          console.log("Exercise Data Check:", exercise); // Log the entire exercise data
          return {
            name: exercise.Name,
            sets: exercise.sets.map(set => {
              console.log("Set Data Check:", set); // Log each set data
              return {
                weight: set.weight || '0 lbs',  // Default weight if undefined
                reps: set.reps || '0',          // Default reps if undefined
                completed: set.completed !== undefined ? set.completed : false, // Ensure boolean value
                setNumber: set.setNumber,
              }
            }),
          }
        }),
        timestamp: new Date(),
      };
  
      console.log("Final Workout Data to save:", workoutData); // Log final data to be saved
      await setDoc(doc(workoutsCollectionRef, workoutDocName), workoutData);
      console.log("Workout saved successfully!");
      finishWorkout();
      navigate("/");
    } catch (error) {
      console.error("Error saving workout: ", error);
    }
  };
  
  
  

  const handleCancelWorkout = () => {
    cancelWorkout();
    setShowCancelModal(true);
  };

  const confirmCancelWorkout = () => {
    navigate("/");
  };

  const openModal = () => {
    setShowModal(true);
  };

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
                exerciseIndex={exerciseIndex}
                updateSets={updateExerciseSets}
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