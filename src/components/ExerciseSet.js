import React, { useState } from 'react';

const ExerciseSet = ({ exerciseName, prevWeight, prevReps, setNumber }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [completed, setCompleted] = useState(false);

  const handleWeightChange = (e) => setWeight(e.target.value);
  const handleRepsChange = (e) => setReps(e.target.value);
  const handleCompletedChange = () => setCompleted(!completed);

  return (
    <div className="exercise-set bg-gray-800 text-white rounded-md p-2 sm:p-4 mb-4">
    <div className="exercise-name text-sm sm:text-lg font-semibold mb-2">{exerciseName}</div>
    <div className="set-info flex flex-wrap justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
            <span className="text-gray-400 text-xs sm:text-sm mr-2">SET</span>
            <span className="text-xs sm:text-sm">{setNumber}</span>
        </div>
        <div className="flex items-center mb-2 sm:mb-0">
            <span className="text-gray-400 text-xs sm:text-sm mr-2">PREVIOUS</span>
            <span className="text-xs sm:text-sm">{`${prevWeight} lbs x ${prevReps}`}</span>
        </div>
        <div className="flex items-center mb-2 sm:mb-0">
            <span className="text-gray-400 text-xs sm:text-sm mr-2">LBS</span>
            <input
                type="text"
                value={weight}
                onChange={handleWeightChange}
                className="bg-gray-700 text-white rounded-md px-1 sm:px-2 py-1 w-16 sm:w-20"
            />
        </div>
        <div className="flex items-center mb-2 sm:mb-0">
            <span className="text-gray-400 text-xs sm:text-sm mr-2">REPS</span>
            <input
                type="text"
                value={reps}
                onChange={handleRepsChange}
                className="bg-gray-700 text-white rounded-md px-1 sm:px-2 py-1 w-16 sm:w-20"
            />
        </div>
        <div className="flex items-center">
            <input
                type="checkbox"
                checked={completed}
                onChange={handleCompletedChange}
                className="form-checkbox text-blue-500"
            />
        </div>
    </div>
</div>

    );
};

export default ExerciseSet;