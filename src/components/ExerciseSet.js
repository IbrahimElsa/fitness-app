import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const ExerciseSet = ({ exercise, sets, handleSetChange, currentUser }) => {
  const [localSets, setLocalSets] = useState(sets);
  const [prevWorkoutData, setPrevWorkoutData] = useState([]);

  useEffect(() => {
    setLocalSets(sets);
  }, [sets]);

  useEffect(() => {
    const fetchPrevWorkoutData = async () => {
      try {
        const userId = currentUser.uid;
        const workoutsCollectionRef = collection(db, 'users', userId, 'workouts');
        const q = query(workoutsCollectionRef, orderBy('timestamp', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const prevWorkout = querySnapshot.docs[0].data();
          const prevSets = prevWorkout.exercises.find(ex => ex.Name === exercise.Name)?.sets || [];
          setPrevWorkoutData(prevSets);
        } else {
          setPrevWorkoutData([]);
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

  return (
    <div className="exercise-set bg-gray-200 text-gray-800 p-4 rounded-md mb-4">
      <h3>{exercise.Name}</h3>
      <div className="flex items-center mb-2">
        <h4 className="w-1/4">Set</h4>
        <h4 className="w-1/4">Prev Workout</h4>
        <h4 className="w-1/4">Weight</h4>
        <h4 className="w-1/4">Reps</h4>
      </div>
      {localSets.map((set, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="w-1/4">{index + 1}</span>
          <span className="w-1/4">
            {prevWorkoutData[index]
              ? `${prevWorkoutData[index].weight} x ${prevWorkoutData[index].reps}`
              : '- x -'}
          </span>
          <input
            type="text"
            value={set.weight}
            onChange={(e) => handleWeightChange(index, e.target.value)}
            className="weight-input w-1/4 bg-gray-300 rounded-md px-2 py-1"
            placeholder="Weight"
          />
          <input
            type="text"
            value={set.reps}
            onChange={(e) => handleRepsChange(index, e.target.value)}
            className="reps-input w-1/4 bg-gray-300 rounded-md px-2 py-1"
            placeholder="Reps"
          />
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