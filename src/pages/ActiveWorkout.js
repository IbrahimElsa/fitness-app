import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActiveWorkoutModal from "../components/ActiveWorkoutModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";
import ExerciseSet from "../components/ExerciseSet";
import { db } from "../firebaseConfig";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";

function ActiveWorkout() {
  const [showActiveWorkoutModal, setShowActiveWorkoutModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [localExerciseData, setLocalExerciseData] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedExercises, setSelectedExercises] = useState([]);
  const { currentUser } = useAuth();
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (location.state?.startTimer) {
      setIsActive(true);
      setStartTime(Date.now());
    }
  }, [location]);

  const openActiveWorkoutModal = () => {
    setShowActiveWorkoutModal(true);
  };

  const closeActiveWorkoutModal = () => {
    setShowActiveWorkoutModal(false);
  };

  const handleAddExercise = (exercise) => {
    setSelectedExercises([...selectedExercises, exercise]);
    setLocalExerciseData([
      ...localExerciseData,
      {
        Category: exercise.Category,
        Muscle: exercise.Muscle,
        Name: exercise.Name,
        sets: [{ weight: '', reps: '' }], // Initialize with an initial set object
      },
    ]);
    closeActiveWorkoutModal();
  };

  const handleCancelWorkout = () => {
    setShowCancelModal(true);
  };

  const handleFinishWorkout = async () => {
    try {
      const userId = currentUser.uid;
      const workoutsCollectionRef = collection(db, "users", userId, "workouts");
      const querySnapshot = await getDocs(workoutsCollectionRef);
      const workoutCount = querySnapshot.size;
      const newWorkoutDocRef = doc(workoutsCollectionRef, `workout ${workoutCount + 1}`);
      const endTime = Date.now();
      const durationInMilliseconds = endTime - startTime;
      const durationInSeconds = Math.floor(durationInMilliseconds / 1000);
      const durationString = `${Math.floor(durationInSeconds / 3600)}:${Math.floor(
        (durationInSeconds % 3600) / 60
      )}:${durationInSeconds % 60}`;

      const workoutData = {
        duration: durationString,
        exercises: localExerciseData.map((exercise) => ({
          Category: exercise.Category,
          Muscle: exercise.Muscle,
          Name: exercise.Name,
          sets: exercise.sets.map((set, index) => ({
            setNumber: index + 1,
            weight: set.weight,
            reps: set.reps,
          })),
        })),
        timestamp: new Date().toISOString(),
      };

      // Add the new workout document to Firestore
      await setDoc(newWorkoutDocRef, workoutData);

      // Reset the state after successful submission
      setSelectedExercises([]);
      setLocalExerciseData([]);
      setTimer(0);
      setIsActive(false);

      // Navigate to the desired route after finishing the workout
      navigate("/");
    } catch (error) {
      console.error("Error adding workout: ", error);
    }
  };

  const confirmCancelWorkout = () => {
    setIsActive(false);
    navigate("/");
  };

  const containerClass = theme === "light" ? "bg-white text-black" : "bg-gray-800 text-white";

  const handleSetChange = (setIndex, field, value, exercise) => {
    const newLocalExerciseData = [...localExerciseData];
    const exerciseIndex = newLocalExerciseData.findIndex(
      (ex) => ex.Name === exercise.Name
    );
  
    if (exerciseIndex === -1) {
      // Exercise not found, return without making changes
      return;
    }
  
    if (field === "new") {
      newLocalExerciseData[exerciseIndex].sets.push({ weight: "", reps: "" });
    } else {
      newLocalExerciseData[exerciseIndex].sets[setIndex][field] = value;
    }
  
    setLocalExerciseData(newLocalExerciseData);
  };

  return (
    <div className={`active-workout-page min-h-screen ${containerClass}`}>
      <div className="flex flex-col items-center pt-4 space-y-4">
        <div className="timer-display">
          Timer: {Math.floor(timer / 3600)} : {Math.floor((timer % 3600) / 60)} : {timer % 60}
        </div>
        <button
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
          onClick={openActiveWorkoutModal}
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
        {selectedExercises.map((exercise, index) => (
          <ExerciseSet
            key={index}
            exercise={exercise}
            sets={localExerciseData.find((ex) => ex.Name === exercise.Name)?.sets || []}
            handleSetChange={(setIndex, field, value) => handleSetChange(setIndex, field, value, exercise)}
          />
        ))}
      </div>
      {showActiveWorkoutModal && (
        <ActiveWorkoutModal
          show={showActiveWorkoutModal}
          onClose={closeActiveWorkoutModal}
          exercisesData={exercisesData}
          title="Add Exercise"
          handleAddExercise={handleAddExercise}
        />
      )}
      {showCancelModal && (
        <CancelModal onConfirm={confirmCancelWorkout} onClose={() => setShowCancelModal(false)} />
      )}
      <MobileNavbar />
    </div>
  );
}

export default ActiveWorkout;