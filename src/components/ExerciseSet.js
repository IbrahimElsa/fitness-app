import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useTheme } from "../components/ThemeContext";

const ExerciseSet = ({ exercise, sets, handleSetChange, currentUser, handleRemoveExercise }) => {
  const [localSets, setLocalSets] = useState(sets);
  const [prevWorkoutData, setPrevWorkoutData] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  useEffect(() => {
    const fetchPrevWorkoutData = async () => {
      try {
        const userId = currentUser.uid;
        const workoutsCollectionRef = collection(db, 'users', userId, 'workouts');
        const q = query(workoutsCollectionRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        for (const doc of querySnapshot.docs) {
          const workout = doc.data();
          const prevSets = workout.exercises.find(ex => ex.Name === exercise.Name)?.sets || [];
          if (prevSets.length > 0) {
            setPrevWorkoutData(prevSets);
            break;
          }
        }
      } catch (error) {
        console.error('Error fetching previous workout data: ', error);
      }
    };

    fetchPrevWorkoutData();
  }, [exercise.Name, currentUser]);

  const handleWeightChange = (setIndex, value) => {
    const newSets = [...localSets];
    newSets[setIndex].weight = value;
    setLocalSets(newSets);
    handleSetChange(exercise.Name, setIndex, 'weight', value);
  };

  const handleRepsChange = (setIndex, value) => {
    const newSets = [...localSets];
    newSets[setIndex].reps = value;
    setLocalSets(newSets);
    handleSetChange(exercise.Name, setIndex, 'reps', value);
  };

  const addSet = () => {
    const newSets = [...localSets, { weight: '', reps: '' }];
    setLocalSets(newSets);
    handleSetChange(exercise.Name, localSets.length, 'new', { weight: '', reps: '' });
  };

  const deleteLastSet = () => {
    if (localSets.length === 1) {
      handleRemoveExercise(exercise.Name);
    } else {
      const newSets = localSets.slice(0, -1);
      setLocalSets(newSets);
      handleSetChange(exercise.Name, localSets.length - 1, 'delete');
    }
  };

  const containerClass = theme === 'light' 
    ? 'bg-gray-200 text-gray-800' 
    : 'bg-gray-800 text-white border-t border-b border-gray-600';
  const inputClass = theme === 'light' 
    ? 'bg-gray-300 text-black' 
    : 'bg-gray-600 text-white';

  return (
    <div className={`exercise-set ${containerClass} p-4 rounded-md mb-4`}>
      <h3>{exercise.Name}</h3>
      <div className="grid grid-cols-5 gap-4 mb-2">
        <h4>Set</h4>
        <h4>Prev Workout</h4>
        <h4>Weight</h4>
        <h4>Reps</h4>
        <div></div> {/* Placeholder for the delete button */}
      </div>
      {localSets.map((set, index) => (
        <div
          key={index}
          className={`grid grid-cols-5 gap-4 items-center mb-2 ${
            set.weight && set.reps ? 'bg-green-200' : ''
          }`}
        >
          <span>{index + 1}</span>
          <span>
            {prevWorkoutData[index]
              ? `${prevWorkoutData[index].weight} x ${prevWorkoutData[index].reps}`
              : '- x -'}
          </span>
          <input
            type="text"
            value={set.weight}
            onChange={(e) => handleWeightChange(index, e.target.value)}
            className={`weight-input ${inputClass} rounded-md px-2 py-1`}
            placeholder="Weight"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <input
            type="text"
            value={set.reps}
            onChange={(e) => handleRepsChange(index, e.target.value)}
            className={`reps-input ${inputClass} rounded-md px-2 py-1`}
            placeholder="Reps"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {index === localSets.length - 1 && (
            <button
              onClick={deleteLastSet}
              className="text-red-600 hover:text-red-800"
            >
              X
            </button>
          )}
        </div>
      ))}
      <div className="flex justify-center mt-4">
        <button
          onClick={addSet}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
        >
          Add Set
        </button>
      </div>
    </div>
  );
};

export default ExerciseSet;
