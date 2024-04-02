import { useWorkout } from './WorkoutContext';
import { useNavigate } from 'react-router-dom';

const ActiveWorkoutIndicator = () => {
  const { workoutActive } = useWorkout();
  const navigate = useNavigate();

  if (!workoutActive) return null;

  return (
    <div 
      onClick={() => navigate('/active-workout')} 
      style={{ 
        cursor: 'pointer',
        position: 'fixed',
        top: '0',
        width: '100%',
        backgroundColor: 'red',
        color: 'white',
        textAlign: 'center',
        padding: '10px'
      }}>
      Workout in Progress - Click to return
    </div>
  );
  
};

export default ActiveWorkoutIndicator;