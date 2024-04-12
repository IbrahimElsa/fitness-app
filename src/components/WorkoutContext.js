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

  const updateExerciseSets = (exerciseIndex, updatedSets) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets = updatedSets;
    setWorkoutExercises(updatedExercises);
  };  

  return (
    <WorkoutContext.Provider
      value={{
        workoutExercises,
        workoutActive,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        updateExerciseSets,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};