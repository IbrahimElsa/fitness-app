import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';

const ExerciseSet = ({ exerciseName, prevWeight, prevReps, setNumber }) => {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [completed, setCompleted] = useState(false);
  const [additionalSets, setAdditionalSets] = useState([]);
  const [swipeState, setSwipeState] = useState({});

  const handleWeightChange = (e) => setWeight(e.target.value);
  const handleRepsChange = (e) => setReps(e.target.value);
  const handleCompletedChange = () => setCompleted(!completed);

  const handleAddSet = () => {
    const lastSet = additionalSets[additionalSets.length - 1] || { weight, reps };
    const newSet = {
      id: additionalSets.length > 0 ? additionalSets[additionalSets.length - 1].id + 1 : 0,
      prevWeight: lastSet.weight,
      prevReps: lastSet.reps,
      weight: '',
      reps: '',
      completed: false
    };
    setAdditionalSets([...additionalSets, newSet]);
  };

  const handleDeleteSet = (setId) => {
    const updatedSets = additionalSets.filter(set => set.id !== setId);
    setAdditionalSets(updatedSets);
    setSwipeState(prev => ({ ...prev, [setId]: undefined }));
  };

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      const setId = parseInt(eventData.event.target.closest('.swipe-delete').dataset.setId, 10);
      if (setId !== undefined) {
        setSwipeState(prev => ({
          ...prev,
          [setId]: { deltaX: eventData.deltaX }
        }));
      }
    },
    onSwiped: (eventData) => {
      const setId = parseInt(eventData.event.target.closest('.swipe-delete').dataset.setId, 10);
      if (setId !== undefined) {
        handleDeleteSet(setId);
        setSwipeState(prev => ({ ...prev, [setId]: undefined }));
      }
    },
    trackMouse: true,
  });

  return (
    <div className="exercise-set bg-gray-800 text-white rounded-md p-4 mb-4" {...handlers}>
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
          className="bg-gray-700 text-white rounded-md px-2 py-1 col-span-3"
        />
        <input
          type="text"
          value={reps}
          onChange={handleRepsChange}
          className="bg-gray-700 text-white rounded-md px-2 py-1 col-span-3"
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
        const swipeStyles = swipeState[set.id]
          ? { transform: `translateX(${swipeState[set.id].deltaX}px)` }
          : {};

        return (
          <div
            key={set.id}
            className="grid grid-cols-10 text-center mb-4 gap-2 items-center relative swipe-delete"
            data-set-id={set.id}
            style={swipeStyles}
          >
            <div className='col-span-1'>{setNumber + index + 1}</div>
            <div className='col-span-2'>{`${set.prevWeight || '-'} lbs x ${set.prevReps || '-'}`}</div>
            <input
              type="text"
              value={set.weight}
              onChange={(e) => {
                const updatedSets = [...additionalSets];
                updatedSets[index].weight = e.target.value;
                setAdditionalSets(updatedSets);
              }}
              className="bg-gray-700 text-white rounded-md px-2 py-1 col-span-3"
            />
            <input
              type="text"
              value={set.reps}
              onChange={(e) => {
                const updatedSets = [...additionalSets];
                updatedSets[index].reps = e.target.value;
                setAdditionalSets(updatedSets);
              }}
              className="bg-gray-700 text-white rounded-md px-2 py-1 col-span-3"
            />
            <div className="checkbox-container flex justify-end">
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
        );
      })}

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
