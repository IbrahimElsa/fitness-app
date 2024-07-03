import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useTheme } from "../components/ThemeContext";
import { X } from 'lucide-react';

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
    : 'bg-gray-700 text-white border-t border-b border-gray-600';
  const inputClass = theme === 'light' 
    ? 'bg-gray-300 text-black' 
    : 'bg-gray-600 text-white';

  return (
    <div className={`exercise-set ${containerClass} p-4 rounded-lg shadow-md m-3`}>
      <h3 className="text-xl font-semibold mb-4">{exercise.Name}</h3>
      <div className='grid grid-cols-12 gap-2 mb-2 text-sm font-medium'>
        <h4 className="col-span-1 text-center">Set</h4>
        <h4 className="col-span-4 text-center">Prev Workout</h4>
        <h4 className="col-span-3 text-center">Weight</h4>
        <h4 className="col-span-3 text-center">Reps</h4>
        <div className="col-span-1"></div> 
      </div>
      {localSets.map((set, index) => (
        <div
          key={index}
          className={`grid grid-cols-12 gap-2 items-center mb-2 p-2 rounded-md ${
            set.weight && set.reps 
              ? theme === 'light' ? 'bg-green-100' : 'bg-green-800'
              : theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
          }`}
        >
          <span className="col-span-1 font-medium text-center">{index + 1}</span>
          <span className="col-span-4 truncate text-center">
            {prevWorkoutData[index]
              ? `${prevWorkoutData[index].weight} x ${prevWorkoutData[index].reps}`
              : '- x -'}
          </span>
          <input
            type="text"
            value={set.weight}
            onChange={(e) => handleWeightChange(index, e.target.value)}
            className={`col-span-3 weight-input ${inputClass} rounded-md px-2 py-1 border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center`}
            placeholder="Weight"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          <input
            type="text"
            value={set.reps}
            onChange={(e) => handleRepsChange(index, e.target.value)}
            className={`col-span-3 reps-input ${inputClass} rounded-md px-2 py-1 border focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center`}
            placeholder="Reps"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {index === localSets.length - 1 && (
            <button
              onClick={deleteLastSet}
              className="col-span-1 text-red-600 hover:text-red-800 transition duration-150 ease-in-out flex justify-center items-center"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ))}
      <div className="flex justify-center mt-4">
        <button
          onClick={addSet}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full text-white transition duration-150 ease-in-out"
        >
          Add Set
        </button>
      </div>
    </div>
  );
};

export default ExerciseSet;