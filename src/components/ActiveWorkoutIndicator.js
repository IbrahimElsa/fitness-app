import { useWorkout } from './WorkoutContext';
import { useNavigate } from 'react-router-dom';

const ActiveWorkoutIndicator = () => {
  const { workoutActive } = useWorkout();
  const navigate = useNavigate();

  if (!workoutActive) return null;

  return (
    <button
      onClick={() => navigate('/active-workout')}
      className="fixed bottom-20 right-4 px-4 py-2 bg-red-500 text-white rounded-full z-50 shadow-md"
    >
      <span className="material-icons">fitness_center</span>
    </button>
  );
};

export default ActiveWorkoutIndicator;