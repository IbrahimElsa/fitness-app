import React, { useState } from 'react';

const ExerciseSet = ({ exercise, sets, handleSetChange }) => {
  const [localSets, setLocalSets] = useState(sets.length > 0 ? sets : [{ weight: '', reps: '' }]);

  const handleWeightChange = (setIndex, value) => {
    const newSets = [...localSets];
    newSets[setIndex].weight = value;
    setLocalSets(newSets);
    handleSetChange(setIndex, 'weight', value);
  };

  const handleRepsChange = (setIndex, value) => {
    const newSets = [...localSets];
    newSets[setIndex].reps = value;
    setLocalSets(newSets);
    handleSetChange(setIndex, 'reps', value);
  };

  const addSet = () => {
    const newSets = [...localSets, { weight: '', reps: '' }];
    setLocalSets(newSets);
    handleSetChange(localSets.length, 'new', { weight: '', reps: '' });
  };

  return (
    <div className="exercise-set bg-gray-200 text-gray-800 p-4 rounded-md">
      <h3>{exercise.Name}</h3>
      <div className="flex items-center mb-2">
        <h4 className="w-1/4">Set</h4>
        <h4 className="w-1/4">Weight</h4>
        <h4 className="w-1/4">Reps</h4>
      </div>
      {localSets.map((set, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="w-1/4">{index + 1}</span>
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
      <button
        onClick={addSet}
        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
      >
        Add Set
      </button>
    </div>
  );
};

export default ExerciseSet;