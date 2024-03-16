import React from "react";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import exercisesData from "../components/Exercises.json"; 

function ExercisesPage() {
return (
    <div>
        <Navbar />
        <div className="container mx-auto px-4">
            <h1 className="text-3xl text-center my-6">Exercises</h1>
            <ul className="list-disc">
                {exercisesData.Exercises.map((exercise, index) => (
                    <li key={index} className="mb-2">
                        <strong>{exercise.Name}</strong> - {exercise.Category}
                    </li>
                ))}
            </ul>
        </div>
        <MobileNavbar />
    </div>
    );
}

export default ExercisesPage;
