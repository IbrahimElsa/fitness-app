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
                <ActiveWorkoutModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    title="Add Exercise"
                    className="z-50"
                >
                    <div className="max-h-96 overflow-y-auto">
                        <ul className="flex flex-col space-y-2">
                            {exercisesData.Exercises.map((exercise, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleAddExercise(exercise)}
                                    className="cursor-pointer bg-gray-200 text-gray-800 rounded-md p-4 hover:bg-gray-300 transition-colors duration-200"
                                >
                                    {exercise.Name}
                                </li>
                            ))}
                        </ul>
                    </div>
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
