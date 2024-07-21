import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";

function WorkoutPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const startWorkout = () => {
        navigate('/active-workout', { state: { startTimer: true } });
    };

    const rippleVariants = {
        start: {
            scale: 1,
            opacity: 1,
        },
        end: {
            scale: 2,
            opacity: 0,
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
            },
        },
    };

    return (
        <div className={theme === 'light' ? 'flex flex-col h-screen text-black bg-white' : 'flex flex-col h-screen bg-gray-900 text-white'}>
            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <h1 className="text-3xl text-center mb-4 font-bold">Workout</h1>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <motion.div
                        className="relative flex justify-center items-center"
                        onClick={startWorkout}
                    >
                        <motion.div
                            className="absolute w-48 h-48 rounded-full bg-blue-600"
                            variants={rippleVariants}
                            initial="start"
                            animate="end"
                        />
                        <div 
                            className="relative text-2xl z-10 flex justify-center items-center w-48 h-48 bg-blue-600 hover:bg-blue-700 text-center font-bold rounded-full cursor-pointer"
                        >
                            START
                        </div>
                    </motion.div>
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default WorkoutPage;
