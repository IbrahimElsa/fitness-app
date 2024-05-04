import React from "react";
import { useNavigate } from "react-router-dom";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { useTheme } from "../components/ThemeContext";

function WorkoutPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const startWorkout = () => {
        navigate('/active-workout', { state: { startTimer: true } });
    };

    return (
        <div className={theme === 'light' ? 'flex flex-col h-screen text-black bg-white' : 'flex flex-col h-screen bg-gray-800 text-white'}>
            <Navbar />
            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <h1 className="text-3xl mb-4 font-bold">Workout</h1>
                <div 
                    className="bg-blue-600 hover:bg-blue-700 text-center font-bold py-5 rounded mb-20 cursor-pointer"
                    onClick={startWorkout}
                >
                    START A WORKOUT!
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default WorkoutPage;
