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

  const updateExerciseSets = (exerciseIndex, newSet, setIndex) => {
    setWorkoutExercises(prevExercises => {
      const updatedExercises = [...prevExercises];
  
      if (setIndex === 0) {
        updatedExercises[exerciseIndex].sets[setIndex] = newSet;
      } else {
        if (!updatedExercises[exerciseIndex].additionalSets) {
          updatedExercises[exerciseIndex].additionalSets = [];
        }
  
        const existingSetIndex = updatedExercises[exerciseIndex].additionalSets.findIndex(
          (set, index) => index === setIndex - 1
        );
        if (existingSetIndex >= 0) {
          updatedExercises[exerciseIndex].additionalSets[existingSetIndex] = newSet;
        } else {
          updatedExercises[exerciseIndex].additionalSets.push(newSet);
        }
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