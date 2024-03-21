import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveWorkoutModal from "../components/ActiveWorkoutModal";
import CancelModal from "../components/CancelModal";
import exercisesData from "../components/Exercises.json"; // Ensure this import path is correct
import MobileNavbar from "../components/MobileNavbar";

function ActiveWorkout() {
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false); 
    const navigate = useNavigate();

    const handleAddExercise = (exercise) => {
        console.log('Attempting to add exercise:', exercise);
        setWorkoutExercises(prevExercises => [...prevExercises, exercise]);
        setShowModal(false);
    };

    const handleFinishWorkout = () => {
        navigate('/'); 
    };

    const handleCancelWorkout = () => {
        setShowCancelModal(true);
    };

    const confirmCancelWorkout = () => {
        navigate('/'); 
    };

    const openModal = () => {
        console.log('Opening modal');
        setShowModal(true);
    }

    return (
        <div className="active-workout-page bg-gray-900 text-white min-h-screen">
            {/* Timer and workout note components should go here */}

            <div className="flex flex-col items-center pt-4 space-y-4">
            <button className="py-2 px-4 bg-blue-600 hover:bg-blue-700 focus:outline-none rounded text-white"
        onClick={openModal}>
    ADD EXERCISE
</button>
                <button 
                    className="py-2 px-4 bg-green-600 hover:bg-green-700 focus:outline-none rounded text-white"
                    onClick={handleFinishWorkout}
                >
                    FINISH
                </button>

                <button 
                    className="py-2 px-4 bg-red-600 hover:bg-red-700 focus:outline-none rounded text-white"
                    onClick={handleCancelWorkout}
                >
                    CANCEL WORKOUT
                </button>
            </div>

            {showModal && (
                <ActiveWorkoutModal onClose={() => setShowModal(false)} title="Add Exercise">
                    <ul>
                        {exercisesData.Exercises.map((exercise, index) => (
                            <li 
                                key={index} 
                                onClick={() => handleAddExercise(exercise)} 
                                className="cursor-pointer hover:bg-blue-200 p-2 rounded"
                            >
                                {exercise.Name}
                            </li>
                        ))}
                    </ul>
                </ActiveWorkoutModal>
            )}

            {/* List of added exercises */}
            <div className="selected-exercises">
                {workoutExercises.map((exercise, index) => (
                    <div key={index} className="exercise-item">{exercise.Name}</div>
                ))}
            </div>

            {showCancelModal && (
                <CancelModal onConfirm={confirmCancelWorkout} onClose={() => setShowCancelModal(false)} />
            )}

            <MobileNavbar />
        </div>
    );
}

export default ActiveWorkout;
