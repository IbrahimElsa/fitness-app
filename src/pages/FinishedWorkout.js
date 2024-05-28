import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import MobileNavbar from "../components/MobileNavbar";

const FinishedWorkout = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [workoutData, setWorkoutData] = useState(null);

  useEffect(() => {
    const fetchWorkoutData = async () => {
      try {
        const userId = currentUser.uid;
        const workoutsCollectionRef = collection(db, "users", userId, "workouts");
        const q = query(workoutsCollectionRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setWorkoutData(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching workout data: ", error);
      }
    };

    fetchWorkoutData();
  }, [currentUser]);

  if (!workoutData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="finished-workout-page min-h-screen bg-white text-black flex flex-col pb-16">
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
        <div className="w-full max-w-2xl">
          {workoutData.exercises.map((exercise, index) => (
            <div key={index} className="exercise-set bg-gray-200 text-gray-800 p-4 rounded-md mb-4">
              <h3 className="text-lg font-semibold">{exercise.Name}</h3>
              <div className="flex items-center mb-2">
                <h4 className="w-1/4">Set</h4>
                <h4 className="w-1/4">Weight</h4>
                <h4 className="w-1/4">Reps</h4>
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center mb-2">
                  <span className="w-1/4">{setIndex + 1}</span>
                  <span className="w-1/4">{set.weight}</span>
                  <span className="w-1/4">{set.reps}</span>
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
