import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const ExerciseSet = ({ exerciseName, prevWeight, prevReps, setNumber, exerciseIndex, updateSets }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [completed, setCompleted] = useState(false);
  const [additionalSets, setAdditionalSets] = useState([]);
  const [swipeState, setSwipeState] = useState({});

  const handleWeightChange = (e) => {
    setWeight(e.target.value);
    updateSets(exerciseIndex, { weight: e.target.value, reps, completed }, 0);
  };
  
  const handleRepsChange = (e) => {
    setReps(e.target.value);
    updateSets(exerciseIndex, { weight, reps: e.target.value, completed }, 0);
  };
  
  const handleCompletedChange = () => {
    setCompleted(!completed);
    updateSets(exerciseIndex, { weight, reps, completed: !completed }, 0);
  };

  const handleAddSet = () => {
    const lastSet = additionalSets[additionalSets.length - 1] || { weight, reps };
    const newSet = {
      prevWeight: lastSet.weight,
      prevReps: lastSet.reps,
      weight: '',
      reps: '',
      completed: false
    };
    const updatedSets = [...additionalSets, newSet];
    setAdditionalSets(updatedSets);
    updateSets(exerciseIndex, newSet, additionalSets.length); // Pass setIndex as the length of additionalSets for the new set
  };

  const handleDeleteSet = (setIndex) => {
    const updatedSets = additionalSets.filter((set, index) => index !== setIndex - 1);
    setAdditionalSets(updatedSets);
    setSwipeState(prev => ({ ...prev, [setIndex]: undefined }));
    // No need to call updateSets here since we're not updating any set data
  };

  const handleAdditionalSetChange = (setIndex, updatedSet) => {
    const updatedSets = [...additionalSets];
    updatedSets[setIndex - 1] = updatedSet;
    setAdditionalSets(updatedSets);
    updateSets(exerciseIndex, updatedSet, setIndex); // Pass setIndex for the updated additional set
  };

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const setIndex = parseInt(eventData.event.target.closest('.swipe-delete').dataset.setIndex, 10);
      if (setIndex !== undefined) {
        setSwipeState(prev => ({
          ...prev,
          [setIndex]: { deltaX: eventData.deltaX }
        }));
      }
    },
    onSwiped: (eventData) => {
      const setIndex = parseInt(eventData.event.target.closest('.swipe-delete').dataset.setIndex, 10);
      if (setIndex !== undefined) {
        handleDeleteSet(setIndex);
        setSwipeState(prev => ({ ...prev, [setIndex]: undefined }));
      }
    },
    trackMouse: true,
  });

  return (
    <div className="exercise-set bg-gray-400 rounded-md p-4 mb-4" {...handlers}>
      <div className="exercise-name text-lg font-semibold mb-4">{exerciseName}</div>

      {/* Column Titles */}
      <div className="grid grid-cols-10 text-center mb-2 font-bold">
        <div className='col-span-1'>SET</div>
        <div className='col-span-2'>PREVIOUS</div>
        <div className='col-span-3'>LBS</div>
        <div className='col-span-3'>REPS</div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-10 text-center mb-4 gap-2 items-center">
        <div className='col-span-1'>{setNumber}</div>
        <div className='col-span-2'>{`${prevWeight || '-'} lbs x ${prevReps || '-'}`}</div>
        <input
          type="text"
          value={weight}
          onChange={handleWeightChange}
          className="  rounded-md px-2 py-1 col-span-3"
        />
        <input
          type="text"
          value={reps}
          onChange={handleRepsChange}
          className="  rounded-md px-2 py-1 col-span-3"
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

      {additionalSets.map((set, index) => {
        const swipeStyles = swipeState[index + 1]
          ? { transform: `translateX(${swipeState[index + 1].deltaX}px)` }
          : {};

        return (
          <div
            key={index}
            className="grid grid-cols-10 text-center mb-4 gap-2 items-center relative swipe-delete"
            data-set-index={index + 1}
            style={swipeStyles}
          >
            <div className='col-span-1'>{setNumber + index + 1}</div>
            <div className='col-span-2'>{`${set.prevWeight || '-'} lbs x ${set.prevReps || '-'}`}</div>
            <input
              type="text"
              value={set.weight}
              onChange={(e) => {
                const updatedSet = {
                  ...set,
                  weight: e.target.value
                };
                handleAdditionalSetChange(index + 1, updatedSet);
              }}
              className="  rounded-md px-2 py-1 col-span-3"
            />
            <input
              type="text"
              value={set.reps}
              onChange={(e) => {
                const updatedSet = {
                  ...set,
                  reps: e.target.value
                };
                handleAdditionalSetChange(index + 1, updatedSet);
              }}
              className="  rounded-md px-2 py-1 col-span-3"
            />
            <div className="checkbox-container flex justify-end">
              <input
                type="checkbox"
                checked={set.completed}
                onChange={() => {
                  const updatedSet = {
                    ...set,
                    completed: !set.completed
                  };
                  handleAdditionalSetChange(index + 1, updatedSet);
                }}
                className="form-checkbox text-blue-500"
              />
            </div>
          </div>
        );
      })}

      {/* Add Set Button */}
      <div className="flex justify-center">
        <button
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded "
          onClick={handleAddSet}
        >
          Add Set
        </button>
      </div>
    </div>
  );
};

export default ExerciseSet;