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

  const updateExerciseSets = (exerciseIndex, setIndex, setDetails, isAdditional = false) => {
    const updatedExercises = [...workoutExercises];
    if (isAdditional) {
      // Check if additionalSets array exists, if not, create it
      if (!updatedExercises[exerciseIndex].additionalSets) {
        updatedExercises[exerciseIndex].additionalSets = [];
      }
      // Update or add the set in the additionalSets array
      updatedExercises[exerciseIndex].additionalSets[setIndex] = setDetails;
    } else {
      // Update the set in the main sets array
      updatedExercises[exerciseIndex].sets[setIndex] = setDetails;
    }
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