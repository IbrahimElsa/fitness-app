import React, { createContext, useContext, useState, useEffect } from 'react';

const PersistedStateContext = createContext();

export const usePersistedState = () => useContext(PersistedStateContext);

const PersistedStateProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const storedState = localStorage.getItem('activeWorkout');
    return storedState ? JSON.parse(storedState) : {
      selectedExercises: [],
      localExerciseData: [],
      startTime: null,
      timer: 0,
      isActive: false
    };
  });

  useEffect(() => {
    if (state.isActive) {
      localStorage.setItem('activeWorkout', JSON.stringify(state));
    } else {
      localStorage.removeItem('activeWorkout');
    }
  }, [state]);

  const clearState = () => {
    setState({
      selectedExercises: [],
      localExerciseData: [],
      startTime: null,
      timer: 0,
      isActive: false
    });
    localStorage.removeItem('activeWorkout');
  };

  return (
    <PersistedStateContext.Provider value={{ state, setState, clearState }}>
      {children}
    </PersistedStateContext.Provider>
  );
};

export default PersistedStateProvider;
