import React, { createContext, useState, useContext } from 'react';

const WorkoutContext = createContext();

export function useWorkout() {
  return useContext(WorkoutContext);
}

export const WorkoutProvider = ({ children }) => {
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [workoutActive, setWorkoutActive] = useState(false);

  const startWorkout = (exercises) => {
    setWorkoutExercises(exercises);
    setWorkoutActive(true);
  };

  const finishWorkout = () => {
    setWorkoutExercises([]);
    setWorkoutActive(false);
  };

  const cancelWorkout = () => {
    setWorkoutExercises([]);
    setWorkoutActive(false);
  };

  return (
    <WorkoutContext.Provider value={{ workoutExercises, workoutActive, startWorkout, finishWorkout, cancelWorkout }}>
      {children}
    </WorkoutContext.Provider>
  );
};
