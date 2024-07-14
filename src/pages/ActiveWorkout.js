import React, { useEffect, useState, useCallback } from "react";
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
import { usePersistedState } from "../components/PersistedStateProvider";
import TimerModal from "../components/TimerModal";

function ActiveWorkout() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const location = useLocation();
  const { state, setState, clearState } = usePersistedState();
  const { selectedExercises, localExerciseData, startTime, timer, isActive, showActiveWorkoutModal, showCancelModal } = state;

  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTimeLeft = localStorage.getItem("timeLeft");
    return savedTimeLeft !== null ? JSON.parse(savedTimeLeft) : null;
  });

  const reinitializeState = useCallback(() => {
    const savedStartTime = localStorage.getItem("startTime");
    const savedIsActive = localStorage.getItem("isActive");
    const savedSelectedExercises = localStorage.getItem("selectedExercises");
    const savedLocalExerciseData = localStorage.getItem("localExerciseData");

    if (savedStartTime && savedIsActive === "true") {
      const currentTime = Date.now();
      const elapsedTime = Math.floor((currentTime - JSON.parse(savedStartTime)) / 1000);
      setState(prevState => ({
        ...prevState,
        timer: elapsedTime,
        startTime: JSON.parse(savedStartTime),
        isActive: true,
        selectedExercises: savedSelectedExercises ? JSON.parse(savedSelectedExercises) : [],
        localExerciseData: savedLocalExerciseData ? JSON.parse(savedLocalExerciseData) : [],
      }));
    }
  }, [setState]);

  useEffect(() => {
    reinitializeState();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        reinitializeState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [reinitializeState]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setState(prevState => {
          const newTimer = prevState.timer + 1;
          localStorage.setItem("timer", JSON.stringify(newTimer));
          localStorage.setItem("isActive", JSON.stringify(isActive));
          localStorage.setItem("startTime", JSON.stringify(prevState.startTime));
          return {
            ...prevState,
            timer: newTimer,
          };
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isActive, setState]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem("timer", JSON.stringify(state.timer));
      localStorage.setItem("isActive", JSON.stringify(isActive));
      localStorage.setItem("startTime", JSON.stringify(state.startTime));
      localStorage.setItem("selectedExercises", JSON.stringify(state.selectedExercises));
      localStorage.setItem("localExerciseData", JSON.stringify(state.localExerciseData));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isActive, state]);

  useEffect(() => {
    const savedStartTime = localStorage.getItem("startTime");
    if (location.state?.startTimer && !savedStartTime) {
      const currentTime = Date.now();
      setState(prevState => ({
        ...prevState,
        isActive: true,
        startTime: currentTime,
      }));
      localStorage.setItem("startTime", JSON.stringify(currentTime));
      localStorage.setItem("isActive", JSON.stringify(true));
    }
  }, [location, setState]);

  useEffect(() => {
    if (timeLeft !== null) {
      localStorage.setItem("timeLeft", JSON.stringify(timeLeft));
      if (timeLeft === 0) {
        localStorage.removeItem("timeLeft");
        setTimeLeft(null);
      }
    } else {
      localStorage.removeItem("timeLeft");
    }
  }, [timeLeft]);

  const openActiveWorkoutModal = () => {
    setState(prevState => ({
      ...prevState,
      showActiveWorkoutModal: true,
    }));
  };

  const closeActiveWorkoutModal = () => {
    setState(prevState => ({
      ...prevState,
      showActiveWorkoutModal: false,
    }));
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      Category: exercise.Category,
      Muscle: exercise.Muscle,
      Name: exercise.Name,
      sets: [{ weight: '', reps: '' }],
    };
    setState(prevState => ({
      ...prevState,
      selectedExercises: [...prevState.selectedExercises, exercise],
      localExerciseData: [...prevState.localExerciseData, newExercise],
      showActiveWorkoutModal: false,
    }));
  };

  const handleRemoveExercise = (exerciseName) => {
    setState(prevState => ({
      ...prevState,
      selectedExercises: prevState.selectedExercises.filter(ex => ex.Name !== exerciseName),
      localExerciseData: prevState.localExerciseData.filter(ex => ex.Name !== exerciseName),
    }));
  };

  const handleCancelWorkout = () => {
    setState(prevState => ({
      ...prevState,
      showCancelModal: true,
    }));
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
      const durationString = `${Math.floor(durationInSeconds / 3600).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${Math.floor(
        (durationInSeconds % 3600) / 60
      ).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:${(durationInSeconds % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}`;

      const workoutData = {
        duration: durationString,
        exercises: localExerciseData.map((exercise) => ({
          Category: exercise.Category,
          Muscle: exercise.Muscle,
          Name: exercise.Name,
          sets: exercise.sets.filter(set => set.weight !== '' || set.reps !== '')
            .map((set, index) => ({
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
    navigate("/");
  };

  const containerClass = theme === "light" ? "bg-white text-black" : "bg-gray-900 text-white";

  const handleSetChange = (exerciseName, setIndex, field, value) => {
    setState(prevState => {
      const newLocalExerciseData = [...prevState.localExerciseData];
      const exerciseIndex = newLocalExerciseData.findIndex(
        (ex) => ex.Name === exerciseName
      );

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
    <div className={`active-workout-page min-h-screen ${containerClass} flex flex-col pb-16`}>
      <div className={`w-full flex justify-between p-4 ${theme === 'light' ? 'bg-white' : 'bg-gray-800'} shadow-md`}>
        <button
          className="timer-button py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full text-white transition duration-150 ease-in-out"
          onClick={() => setIsTimerModalOpen(true)}
        >
          {timeLeft !== null ? formatTime(timeLeft) : "TIMER"}
        </button>
        <div className={`timer-display text-center text-2xl pt-1 font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
          {timer >= 3600 && `${Math.floor(timer / 3600)}:`}
          {Math.floor((timer % 3600) / 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:
          {(timer % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}
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
        <CancelModal onConfirm={confirmCancelWorkout} onClose={() => setState(prevState => ({
          ...prevState,
          showCancelModal: false,
        }))} />
      )}
      <MobileNavbar />
      <TimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
      />
    </div>
  );
}

export default ActiveWorkout;
