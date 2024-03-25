import React, { useState } from 'react';

const ExerciseSet = ({ exerciseName, prevWeight, prevReps, setNumber }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [completed, setCompleted] = useState(false);
  const [additionalSets, setAdditionalSets] = useState([]);

  const handleWeightChange = (e) => setWeight(e.target.value);
  const handleRepsChange = (e) => setReps(e.target.value);
  const handleCompletedChange = () => setCompleted(!completed);

  const handleAddSet = () => {
    const lastSet = additionalSets[additionalSets.length - 1] || { weight, reps };
    const newSet = {
      prevWeight: lastSet.weight,
      prevReps: lastSet.reps,
      weight: '',
      reps: '',
      completed: false
    };
    setAdditionalSets([...additionalSets, newSet]);
  };

  return (
    <div className="exercise-set bg-gray-800 text-white rounded-md p-4 mb-4">
      <div className="exercise-name text-lg font-semibold mb-4">{exerciseName}</div>

      {/* Column Titles */}
      <div className="grid grid-cols-5 text-center mb-2 font-bold">
        <div>SET</div>
        <div>PREVIOUS</div>
        <div>LBS</div>
        <div>REPS</div>
        <div></div>
      </div>

      {/* Initial Set */}
      <div className="grid grid-cols-5 text-center mb-4 gap-2 items-center">
        <div>{setNumber}</div>
        <div>{`${prevWeight || '-'} lbs x ${prevReps || '-'}`}</div>
        <input
          type="text"
          value={weight}
          onChange={handleWeightChange}
          className=" bg-gray-700 text-white rounded-md px-2 py-1"
        />
        <input
          type="text"
          value={reps}
          onChange={handleRepsChange}
          className="bg-gray-700 text-white rounded-md px-2 py-1"
        />
        <div className="checkbox-container flex justify-end">
          <input
            type="checkbox"
            checked={completed}
            onChange={handleCompletedChange}
            className="form-checkbox text-blue-500"
          />
        </div>
      </div>

      {/* Additional Sets */}
      {additionalSets.map((set, index) => (
        <div key={index} className="grid grid-cols-5 text-center mb-4 gap-2 items-center">
          <div>{setNumber + index + 1}</div>
          <div>{`${set.prevWeight || '-'} lbs x ${set.prevReps || '-'}`}</div>
          <input
            type="text"
            value={set.weight}
            onChange={(e) => {
              const updatedSets = [...additionalSets];
              updatedSets[index].weight = e.target.value;
              setAdditionalSets(updatedSets);
            }}
            className="bg-gray-700 text-white rounded-md px-2 py-1"
          />
          <input
            type="text"
            value={set.reps}
            onChange={(e) => {
              const updatedSets = [...additionalSets];
              updatedSets[index].reps = e.target.value;
              setAdditionalSets(updatedSets);
            }}
            className="bg-gray-700 text-white rounded-md px-2 py-1"
          />
          <div className="checkbox-container flex justify-end ">
            <input
              type="checkbox"
              checked={set.completed}
              onChange={() => {
                const updatedSets = [...additionalSets];
                updatedSets[index].completed = !updatedSets[index].completed;
                setAdditionalSets(updatedSets);
              }}
              className="form-checkbox text-blue-500"
            />
          </div>
        </div>
      ))}

      {/* Add Set Button */}
      <div className="flex justify-center">
        <button
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded text-white"
          onClick={handleAddSet}
        >
          Add Set
        </button>
      </div>
    </div>
  );
};

export default ExerciseSet;