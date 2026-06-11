import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ActiveWorkoutModal from "../components/SearchExercisesModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";
import ExerciseSet from "../components/ExerciseSet";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { usePersistedState } from "../components/PersistedStateProvider";
import TimerModal from "../components/TimerModal";

// Unique id per added exercise so duplicates of the same exercise don't share sets
const genInstanceId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

function ActiveWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { currentUser, loading } = useAuth(); // Get loading state from auth context
  const { state, setState, clearState } = usePersistedState();

  const selectedExercises = state.selectedExercises || [];
  const localExerciseData = state.localExerciseData || [];
  const { startTime, showActiveWorkoutModal, showCancelModal } = state;

  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    // Restore the rest timer from its persisted end time
    const savedEndTime = localStorage.getItem("timerEndTime");
    if (!savedEndTime) return null;
    const remaining = Math.ceil((parseInt(savedEndTime, 10) - Date.now()) / 1000);
    return remaining > 0 ? remaining : null;
  });
  // Elapsed workout time is derived from startTime, so it doesn't need persisting
  const [elapsed, setElapsed] = useState(0);
  const [prevSetsByName, setPrevSetsByName] = useState({});

  // Auth checking effect - only redirect if we're sure the user isn't authenticated
  useEffect(() => {
    // Only redirect to login if no user AND no active workout
    if (!loading && !currentUser && !state.isActive) {
      navigate('/login');
    }
  }, [currentUser, loading, state.isActive, navigate]);

  useEffect(() => {
    if (location.state?.startTimer && !state.isActive) {
      setState((prevState) => {
        if (prevState.isActive) return prevState;
        const exercises = (location.state.selectedExercises || []).map((ex) => ({
          ...ex,
          instanceId: genInstanceId(),
        }));
        return {
          ...prevState,
          isActive: true,
          startTime: Date.now(),
          selectedExercises: exercises,
          localExerciseData: exercises.map((ex) => ({
            instanceId: ex.instanceId,
            Name: ex.Name,
            Category: ex.Category,
            Muscle: ex.Muscle,
            sets: ex.sets || [{ weight: "", reps: "" }],
          })),
        };
      });
    }
  }, [location.state, state.isActive, setState]);

  // Workouts persisted before instance ids existed need them backfilled
  useEffect(() => {
    if (state.isActive && state.selectedExercises?.some((ex) => !ex.instanceId)) {
      setState((prevState) => {
        const withIds = prevState.selectedExercises.map((ex) => ({
          ...ex,
          instanceId: ex.instanceId || genInstanceId(),
        }));
        return {
          ...prevState,
          selectedExercises: withIds,
          localExerciseData: prevState.localExerciseData.map((ex, i) => ({
            ...ex,
            instanceId: withIds[i]?.instanceId || genInstanceId(),
          })),
        };
      });
    }
  }, [state.isActive, state.selectedExercises, setState]);

  useEffect(() => {
    if (!state.startTime || !state.isActive) return;

    const updateTimer = () => {
      setElapsed(Math.floor((Date.now() - state.startTime) / 1000));
    };

    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Call immediately to set the correct time initially

    return () => clearInterval(interval);
  }, [state.startTime, state.isActive]);

  // Fetch recent workouts once and build a previous-sets lookup for all exercises
  useEffect(() => {
    if (!currentUser) return;

    const fetchPrevSets = async () => {
      try {
        const workoutsCollectionRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsCollectionRef, orderBy("timestamp", "desc"), limit(20));
        const querySnapshot = await getDocs(q);

        const prevSets = {};
        querySnapshot.docs.forEach((docSnapshot) => {
          (docSnapshot.data().exercises || []).forEach((ex) => {
            if (!prevSets[ex.Name] && ex.sets?.length > 0) {
              prevSets[ex.Name] = ex.sets;
            }
          });
        });
        setPrevSetsByName(prevSets);
      } catch (error) {
        console.error("Error fetching previous workout data: ", error);
      }
    };

    fetchPrevSets();
  }, [currentUser]);

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
    const instanceId = genInstanceId();
    const newExercise = {
      instanceId,
      Category: exercise.Category,
      Muscle: exercise.Muscle,
      Name: exercise.Name,
      sets: [{ weight: "", reps: "" }],
    };
    setState((prevState) => ({
      ...prevState,
      selectedExercises: [...prevState.selectedExercises, { ...exercise, instanceId }],
      localExerciseData: [...prevState.localExerciseData, newExercise],
      showActiveWorkoutModal: false,
    }));
  };

  const handleRemoveExercise = (instanceId) => {
    setState((prevState) => ({
      ...prevState,
      selectedExercises: prevState.selectedExercises.filter((ex) => ex.instanceId !== instanceId),
      localExerciseData: prevState.localExerciseData.filter((ex) => ex.instanceId !== instanceId),
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

      await addDoc(workoutsCollectionRef, workoutData);

      clearState();
      localStorage.removeItem("timerEndTime");
      navigate("/finished-workout", { state: { workout: workoutData } });
    } catch (error) {
      console.error("Error adding workout: ", error);
    }
  };

  const confirmCancelWorkout = () => {
    clearState();
    localStorage.removeItem("timerEndTime");
    navigate("/");
  };

  const handleSetChange = (instanceId, setIndex, field, value) => {
    setState((prevState) => {
      const newLocalExerciseData = prevState.localExerciseData.map((ex) => {
        if (ex.instanceId !== instanceId) return ex;

        if (field === "new") {
          return { ...ex, sets: [...ex.sets, { weight: "", reps: "" }] };
        } else if (field === "delete") {
          return { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) };
        }
        return {
          ...ex,
          sets: ex.sets.map((set, i) => (i === setIndex ? { ...set, [field]: value } : set)),
        };
      });

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
              {elapsed >= 3600 && `${Math.floor(elapsed / 3600)}:`}
              {Math.floor((elapsed % 3600) / 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}:
              {(elapsed % 60).toLocaleString(undefined, { minimumIntegerDigits: 2 })}
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
          {selectedExercises.map((exercise) => (
            <ExerciseSet
              key={exercise.instanceId}
              exercise={exercise}
              sets={localExerciseData.find((ex) => ex.instanceId === exercise.instanceId)?.sets || []}
              prevSets={prevSetsByName[exercise.Name] || []}
              handleSetChange={handleSetChange}
              handleRemoveExercise={handleRemoveExercise}
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