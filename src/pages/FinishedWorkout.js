import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";

const FinishedWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  // The just-finished workout is passed via navigation state; fetching is only a fallback
  const [workoutData, setWorkoutData] = useState(location.state?.workout || null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (workoutData) return;
    if (!currentUser) {
      setNotFound(true);
      return;
    }

    const fetchWorkoutData = async () => {
      try {
        const workoutsCollectionRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsCollectionRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setWorkoutData(querySnapshot.docs[0].data());
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error fetching workout data: ", error);
        setNotFound(true);
      }
    };

    fetchWorkoutData();
  }, [currentUser, workoutData]);

  if (!workoutData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        {notFound ? (
          <>
            <p>No finished workout to show.</p>
            <button
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
              onClick={() => navigate("/")}
            >
              HOME
            </button>
          </>
        ) : (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        )}
      </div>
    );
  }

  const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';
  const summaryClass = theme === 'light' ? 'bg-gray-300 text-gray-800' : 'bg-gray-700 text-white';

  return (
    <div className={`finished-workout-page min-h-screen ${containerClass} flex flex-col pb-16`}>
      <div className="w-full flex justify-between p-4">
        <button
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
          onClick={() => navigate("/")}
        >
          HOME
        </button>
      </div>
      <div className="w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Workout Summary</h1>
        <h2 className="text-xl mb-2">Duration: {workoutData.duration}</h2>
        <div className={`w-11/12 max-w-xl ${summaryClass} p-4 rounded-md mb-4`}>
          {workoutData.exercises.map((exercise, index) => (
            <div key={index} className="exercise-set">
              <h3 className="text-xl font-bold">{exercise.Name}</h3>
              <div className="flex items-center mb-2 font-semibold text-lg">
                <h4 className="w-1/4">Set</h4>
                <h4 className="w-1/2">Weight x Reps</h4>
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center mb-2 text-lg">
                  <span className="w-1/4">{setIndex + 1}</span>
                  <span className="w-1/2">{set.weight} x {set.reps}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <MobileNavbar />
    </div>
  );
};

export default FinishedWorkout;