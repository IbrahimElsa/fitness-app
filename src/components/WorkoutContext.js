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

  const updateExerciseSets = (exerciseIndex, newSet) => {
    setWorkoutExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
      // Check if additionalSets exists, if not, create it
      if (!updatedExercises[exerciseIndex].additionalSets) {
        updatedExercises[exerciseIndex].additionalSets = [];
      }
      // Determine if this is a new set or an update to an existing one
      const existingSetIndex = updatedExercises[exerciseIndex].additionalSets.findIndex(set => set.id === newSet.id);
      if (existingSetIndex >= 0) {
        // Update existing set
        updatedExercises[exerciseIndex].additionalSets[existingSetIndex] = newSet;
      } else {
        // Add new set
        updatedExercises[exerciseIndex].additionalSets.push(newSet);
      }
      return updatedExercises;
    });
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