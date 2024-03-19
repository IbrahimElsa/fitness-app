import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActiveWorkoutModal from "../components/ActiveWorkoutModal";
import exercisesData from "../components/Exercises.json";
import MobileNavbar from "../components/MobileNavbar";

function ActiveWorkout() {
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const handleAddExercise = (exercise) => {
        setWorkoutExercises((prevExercises) => [...prevExercises, exercise]);
        setShowModal(false);
    };

    const handleFinishWorkout = () => {
        // Implement workout finish logic
        navigate('/'); // Navigate to home or workout summary page
    };

    return (
        <div className="active-workout-page">
            
            {/* Your timer and workout note components here */}
            
            <button className="add-exercise-btn" onClick={() => setShowModal(true)}>
                ADD EXERCISE
            </button>

            <button className="finish-workout-btn" onClick={handleFinishWorkout}>
                FINISH
            </button>

            <ActiveWorkoutModal show={showModal} onClose={() => setShowModal(false)}>
                <h3 className="modal-title">ADD EXERCISE</h3>
                <ul className="modal-list">
                    {exercisesData.Exercises.map((exercise, index) => (
                        <li key={index} onClick={() => handleAddExercise(exercise)} className="modal-list-item">
                            {exercise.Name}
                        </li>
                    ))}
                </ul>
            </ActiveWorkoutModal>

            <div className="selected-exercises">
                {workoutExercises.map((exercise, index) => (
                    <div key={index}>{exercise.Name}</div>
                ))}
            </div>

            {/* Implement CANCEL WORKOUT logic */}
            <MobileNavbar />
        </div>

    );
}

export default ActiveWorkout;
