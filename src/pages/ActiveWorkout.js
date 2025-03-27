import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActiveWorkoutModal from "../components/SearchExercisesModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";
import ExerciseSet from "../components/ExerciseSet";
import { db } from "../firebaseConfig";
import { collection, doc, setDoc, getDocs } from "firebase/firestore";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { usePersistedState } from "../components/PersistedStateProvider";
import TimerModal from "../components/TimerModal";

function ActiveWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { currentUser, loading } = useAuth(); // Get loading state from auth context
  const { state, setState, clearState } = usePersistedState();

  const selectedExercises = state.selectedExercises || [];
  const localExerciseData = state.localExerciseData || [];
  const { startTime, isActive, showActiveWorkoutModal, showCancelModal } = state;

  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTimeLeft = localStorage.getItem("timeLeft");
    return savedTimeLeft !== null ? JSON.parse(savedTimeLeft) : null;
  });

  // Auth checking effect - only redirect if we're sure the user isn't authenticated
  useEffect(() => {
    // Only check auth after loading is complete
    if (!loading) {
      // Check if there's an active workout
      const hasActiveWorkout = localStorage.getItem("isActive") === "true" || 
                               JSON.parse(localStorage.getItem("activeWorkout") || "{}").isActive === true;
      
      // Only redirect to login if no user AND no active workout
      if (!currentUser && !hasActiveWorkout) {
        navigate('/login');
      }
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    const savedStartTime = localStorage.getItem("startTime");
    const savedIsActive = localStorage.getItem("isActive");

    if (savedStartTime && savedIsActive === "true") {
      setState((prevState) => ({
        ...prevState,
        startTime: JSON.parse(savedStartTime),
        isActive: true,
      }));
    } else if (location.state?.startTimer) {
      const currentTime = Date.now();
      setState((prevState) => ({
        ...prevState,
        isActive: true,
        startTime: currentTime,
        selectedExercises: location.state.selectedExercises || [],
        localExerciseData: (location.state.selectedExercises || []).map((ex) => ({
          Name: ex.Name,
          Category: ex.Category,
          Muscle: ex.Muscle,
          sets: ex.sets || [{ weight: "", reps: "" }],
        })),
      }));
      localStorage.setItem("startTime", JSON.stringify(currentTime));
      localStorage.setItem("isActive", JSON.stringify(true));
    }
  }, [location.state, setState]);

  useEffect(() => {
    const updateTimer = () => {
      if (state.startTime && state.isActive) {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - state.startTime) / 1000);
        setState((prevState) => ({
          ...prevState,
          timer: elapsedTime,
        }));
      }
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Call immediately to set the correct time initially

    return () => clearInterval(interval);
  }, [state.startTime, state.isActive, setState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("timer", JSON.stringify(state.timer));
      localStorage.setItem("isActive", JSON.stringify(isActive));
      localStorage.setItem("startTime", JSON.stringify(state.startTime));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, state.timer, state.startTime]);

  const openActiveWorkoutModal = () => {
    setState((prevState) => ({
      ...prevState,
      showActiveWorkoutModal: true,
    }));
  };

  const closeActiveWorkoutModal = () => {
    setState((prevState) => ({
      ...prevState,
      showActiveWorkoutModal: false,
    }));
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      Category: exercise.Category,
      Muscle: exercise.Muscle,
      Name: exercise.Name,
      sets: [{ weight: "", reps: "" }],
    };
    setState((prevState) => ({
      ...prevState,
      selectedExercises: [...prevState.selectedExercises, exercise],
      localExerciseData: [...prevState.localExerciseData, newExercise],
      showActiveWorkoutModal: false,
    }));
  };

  const handleRemoveExercise = (exerciseName) => {
    setState((prevState) => ({
      ...prevState,
      selectedExercises: prevState.selectedExercises.filter((ex) => ex.Name !== exerciseName),
      localExerciseData: prevState.localExerciseData.filter((ex) => ex.Name !== exerciseName),
    }));
  };

  const handleCancelWorkout = () => {
    setState((prevState) => ({
      ...prevState,
      showCancelModal: true,
    }));
  };

  const handleFinishWorkout = async () => {
    try {
      if (!currentUser) {
        console.error("No user is logged in");
        return;
      }
      
      const userId = currentUser.uid;
      const workoutsCollectionRef = collection(db, "users", userId, "workouts");
      const querySnapshot = await getDocs(workoutsCollectionRef);
      const workoutCount = querySnapshot.size;
      const newWorkoutDocRef = doc(workoutsCollectionRef, `workout ${workoutCount + 1}`);
      const endTime = Date.now();
      const durationInMilliseconds = endTime - startTime;
      const durationInSeconds = Math.floor(durationInMilliseconds / 1000);
      const durationString = `${Math.floor(durationInSeconds / 3600).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${Math.floor(
        (durationInSeconds % 3600) / 60
      ).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${(durationInSeconds % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;

      const workoutData = {
        duration: durationString,
        exercises: localExerciseData.map((exercise) => ({
          Category: exercise.Category,
          Muscle: exercise.Muscle,
          Name: exercise.Name,
          sets: exercise.sets.filter((set) => set.weight !== "" || set.reps !== "").map((set, index) => ({
            setNumber: index + 1,
            weight: set.weight,
            reps: set.reps,
          })),
        })),
        timestamp: new Date().toISOString(),
      };

      await setDoc(newWorkoutDocRef, workoutData);

      clearState();
      localStorage.removeItem("timer");
      localStorage.removeItem("timeLeft");
      localStorage.removeItem("startTime");
      localStorage.removeItem("isActive");
      navigate("/finished-workout");
    } catch (error) {
      console.error("Error adding workout: ", error);
    }
  };

  const confirmCancelWorkout = () => {
    clearState();
    localStorage.removeItem("timer");
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("startTime");
    localStorage.removeItem("isActive");
    navigate("/");
  };

  const handleSetChange = (exerciseName, setIndex, field, value) => {
    setState((prevState) => {
      const newLocalExerciseData = [...prevState.localExerciseData];
      const exerciseIndex = newLocalExerciseData.findIndex((ex) => ex.Name === exerciseName);

      if (exerciseIndex === -1) {
        return prevState;
      }

      if (field === "new") {
        newLocalExerciseData[exerciseIndex].sets.push({ weight: "", reps: "" });
      } else if (field === "delete") {
        newLocalExerciseData[exerciseIndex].sets.splice(setIndex, 1);
      } else {
        newLocalExerciseData[exerciseIndex].sets[setIndex][field] = value;
      }

      return {
        ...prevState,
        localExerciseData: newLocalExerciseData,
      };
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;
  };

  return (
    <div className={`active-workout-page min-h-screen ${theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white"} flex flex-col pb-16`}>
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className={`w-full flex justify-between p-4 ${theme === "light" ? "bg-white" : "bg-gray-800"} shadow-md`}>
            <button
              className="timer-button py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full text-white transition duration-150 ease-in-out"
              onClick={() => setIsTimerModalOpen(true)}
            >
              {timeLeft !== null ? formatTime(timeLeft) : "TIMER"}
            </button>
            <div className={`timer-display text-center text-2xl pt-1 font-semibold ${theme === "light" ? "text-gray-800" : "text-white"}`}>
              {state.timer >= 3600 && `${Math.floor(state.timer / 3600)}:`}
              {Math.floor((state.timer % 3600) / 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:
              {(state.timer % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}
            </div>
            <button
              className="py-2 px-4 bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 rounded-full text-white transition duration-150 ease-in-out"
              onClick={handleFinishWorkout}
            >
              FINISH
            </button>
          </div>
          {selectedExercises.length === 0 && (
            <div className="flex flex-col items-center">
              <button
                className="self-center py-2 px-4 w-[45vw] bg-blue-600 hover:bg-blue-700 focus:outline-none rounded-full text-white mt-4"
                onClick={openActiveWorkoutModal}
              >
                ADD EXERCISE
              </button>
              <button
                className="self-center py-2 px-4 w-[45vw] bg-red-600 hover:bg-red-700 focus:outline-none rounded-full text-white mt-4"
                onClick={handleCancelWorkout}
              >
                CANCEL WORKOUT
              </button>
            </div>
          )}
          {selectedExercises.map((exercise, index) => (
            <ExerciseSet
              key={index}
              exercise={exercise}
              sets={localExerciseData.find((ex) => ex.Name === exercise.Name)?.sets || []}
              handleSetChange={handleSetChange}
              handleRemoveExercise={handleRemoveExercise}
              currentUser={currentUser}
            />
          ))}
          {selectedExercises.length > 0 && (
            <>
              <button
                className="self-center py-2 px-4 w-[45vw] bg-blue-600 hover:bg-blue-700 focus:outline-none rounded-full text-white mt-4"
                onClick={openActiveWorkoutModal}
              >
                ADD MORE EXERCISES
              </button>
              <button
                className="self-center py-2 px-4 w-[45vw] bg-red-600 hover:bg-red-700 focus:outline-none rounded-full text-white mt-4"
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
            <CancelModal
              onConfirm={confirmCancelWorkout}
              onClose={() =>
                setState((prevState) => ({
                  ...prevState,
                  showCancelModal: false,
                }))
              }
            />
          )}
          <MobileNavbar />
          <TimerModal
            isOpen={isTimerModalOpen}
            onClose={() => setIsTimerModalOpen(false)}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
          />
        </>
      )}
    </div>
  );
}

export default ActiveWorkout;