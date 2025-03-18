// src/components/ExerciseSet.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useTheme } from "../components/ThemeContext";
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExerciseSet = ({ exercise, sets, handleSetChange, currentUser, handleRemoveExercise }) => {
  const [localSets, setLocalSets] = useState(sets);
  const [prevWorkoutData, setPrevWorkoutData] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  // Base container styles
  const containerClass = theme === 'light'
    ? 'bg-white border border-slate-200 shadow-sm' 
    : 'bg-slate-800 border border-slate-700 shadow-sm';

  // Input field styles  
  const inputClass = theme === 'light'
    ? 'bg-slate-100 text-slate-900 border-slate-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
    : 'bg-slate-700 text-white border-slate-600 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-30';

  // Status indicator for completed sets
  const getSetStatusClasses = (set) => {
    if (set.weight && set.reps) {
      return theme === 'light' 
        ? 'bg-emerald-50 border-emerald-200' 
        : 'bg-emerald-900/20 border-emerald-800';
    }
    return theme === 'light' 
      ? 'bg-white border-slate-200' 
      : 'bg-slate-800 border-slate-700';
  };

  return (
    <motion.div 
      layout
      className={`exercise-set ${containerClass} rounded-xl m-3 overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div 
        className="px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex-1">
          <h3 className="text-xl font-bold">{exercise.Name}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {exercise.Category} · {exercise.Muscle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveExercise(exercise.Name);
            }}
            className="p-1.5 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors"
            aria-label="Remove exercise"
          >
            <X size={18} />
          </button>
          {isCollapsed ? (
            <ChevronDown size={20} className="text-slate-500" />
          ) : (
            <ChevronUp size={20} className="text-slate-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <div className='grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400 px-1'>
              <div className="col-span-1 text-center">Set</div>
              <div className="col-span-4 text-center">Previous</div>
              <div className="col-span-3 text-center">Weight</div>
              <div className="col-span-3 text-center">Reps</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-2 mb-4">
              {localSets.map((set, index) => (
                <motion.div
                  key={index}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border ${getSetStatusClasses(set)}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <span className="col-span-1 font-medium text-center">{index + 1}</span>
                  <span className="col-span-4 truncate text-center text-xs text-slate-500 dark:text-slate-400">
                    {prevWorkoutData[index]
                      ? `${prevWorkoutData[index].weight} × ${prevWorkoutData[index].reps}`
                      : '—'}
                  </span>
                  <input
                    type="text"
                    value={set.weight}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    className={`col-span-3 weight-input ${inputClass} rounded-lg px-2 py-1.5 border text-center`}
                    placeholder="lb"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  <input
                    type="text"
                    value={set.reps}
                    onChange={(e) => handleRepsChange(index, e.target.value)}
                    className={`col-span-3 reps-input ${inputClass} rounded-lg px-2 py-1.5 border text-center`}
                    placeholder="reps"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  {index === localSets.length - 1 && (
                    <button
                      onClick={deleteLastSet}
                      className="col-span-1 text-rose-500 hover:text-rose-700 transition-colors flex justify-center"
                      aria-label="Remove set"
                    >
                      <X size={16} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <button
                onClick={addSet}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors flex items-center gap-1 shadow-sm"
              >
                <Plus size={16} />
                <span>Add Set</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExerciseSet;