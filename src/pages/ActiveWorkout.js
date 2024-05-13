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

    const storeWorkoutData = () => {
      const workoutData = {
        localExerciseData,
        startTime,
        timer,
      };
      localStorage.setItem('activeWorkout', JSON.stringify(workoutData));
    };

    if (isActive) {
      interval = setInterval(() => {
        setTimer((timer) => timer + 1);
        storeWorkoutData(); // Store the workout data in localStorage
      }, 1000);
    } else {
      clearInterval(interval);
      localStorage.removeItem('activeWorkout'); // Remove the workout data from localStorage when the workout is not active
    }

    return () => {
      clearInterval(interval);
      localStorage.removeItem('activeWorkout');
    };
  }, [isActive, localExerciseData, startTime, timer]);

  useEffect(() => {
    const retrieveWorkoutData = () => {
      const storedWorkoutData = localStorage.getItem('activeWorkout');
      if (storedWorkoutData) {
        const { localExerciseData, startTime, timer } = JSON.parse(storedWorkoutData);
        setLocalExerciseData(localExerciseData);
        setStartTime(startTime);
        setTimer(timer);
        setIsActive(true);
      }
    };

    retrieveWorkoutData();
  }, []);

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
        sets: [{ weight: '', reps: '' }],
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

      // Remove the active workout data from localStorage
      localStorage.removeItem('activeWorkout');

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
    localStorage.removeItem('activeWorkout');
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
    <div className={`active-workout-page min-h-screen ${containerClass} flex flex-col`}>
      <div className="w-full flex justify-between p-4">
        <div className="timer-display">
          {timer >= 3600 && `${Math.floor(timer / 3600)}:`}
          {Math.floor((timer % 3600) / 60).toLocaleString(undefined, {minimumIntegerDigits: 2})}:
          {(timer % 60).toLocaleString(undefined, {minimumIntegerDigits: 2})}
        </div>
        <button
          className="py-2 px-4 bg-green-600 hover:bg-green-700 focus:outline-none rounded text-white"
          onClick={handleFinishWorkout}
        >
          FINISH
        </button>
      </div>
      {selectedExercises.length === 0 && (
        <button
          className="self-center py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
          onClick={openActiveWorkoutModal}
        >
          ADD EXERCISE
        </button>
      )}
      {selectedExercises.map((exercise, index) => (
        <ExerciseSet
          key={index}
          exercise={exercise}
          sets={localExerciseData.find((ex) => ex.Name === exercise.Name)?.sets || []}
          handleSetChange={(setIndex, field, value) => handleSetChange(setIndex, field, value, exercise)}
        />
      ))}
      {selectedExercises.length > 0 && (
        <>
          <button
            className="self-center py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white mt-4"
            onClick={openActiveWorkoutModal}
          >
            ADD MORE EXERCISES
          </button>
          <button
            className="self-center py-2 px-4 bg-red-600 hover:bg-red-700 focus:outline-none rounded text-white mt-4"
            onClick={handleCancelWorkout}
          >
            CANCEL WORKOUT
          </button>
        </>
      )}
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