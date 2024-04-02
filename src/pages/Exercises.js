import React from "react";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import exercisesData from "../components/Exercises.json";
import { useTheme } from "../components/ThemeContext"; 

function ExercisesPage() {
    const { theme } = useTheme();

    const backgroundColor = theme === 'light' ? 'bg-white' : 'bg-gray-800';
    const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
    const cardBackgroundColor = theme === 'light' ? 'bg-white' : 'bg-gray-700';

    return (
        <div className={`${backgroundColor} min-h-screen`}>
            <Navbar />
            <div className={`container mx-auto px-4 py-8 ${textColor}`}>
                <h1 className="text-3xl text-center font-bold mb-10">Exercises</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exercisesData.Exercises.map((exercise, index) => (
                        <div key={index} className={`${cardBackgroundColor} rounded-lg shadow-lg p-6 flex flex-col justify-between leading-normal`}>
                            <h5 className="font-bold text-2xl mb-2">{exercise.Name}</h5>
                            <p className="text-base">Category: {exercise.Category}</p>
                        </div>
                    ))}
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default ExercisesPage;
