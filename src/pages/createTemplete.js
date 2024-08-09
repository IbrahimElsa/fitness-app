import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, collection, addDoc } from "firebase/firestore";
import SearchExercisesModal from "../components/SearchExercisesModal";
import exercisesData from "../components/Exercises.json";

function CreateTemplete() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [templeteName, setTempleteName] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddExercise = (exercise) => {
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const handleSaveTemplete = async () => {
        if (templeteName.trim() === "" || selectedExercises.length === 0) {
            alert("Please name the templete and add at least one exercise.");
            return;
        }

        try {
            // Get a reference to the specific user's document
            const userDocRef = doc(db, "users", currentUser.uid);
            
            // Create a reference to the 'templetes' collection under the user's document
            const templetesCollectionRef = collection(userDocRef, "templetes");

            // Add the new template to the 'templetes' collection
            await addDoc(templetesCollectionRef, {
                name: templeteName,
                exercises: selectedExercises,
                createdAt: new Date(),  // Optional: track when the template was created
            });

            // Redirect to the templetes page after successful save
            navigate("/templetes");
        } catch (error) {
            console.error("Error saving templete:", error);
            alert("There was an error saving the templete. Please try again.");
        }
    };

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

    return (
        <div className={`${containerClass} min-h-screen`}>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-center font-bold mb-10">Create New Templete</h1>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Name your templete..."
                        className={`w-full px-4 py-2 border rounded ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}
                        value={templeteName}
                        onChange={(e) => setTempleteName(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded-full mb-8"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Add Exercise
                    </button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedExercises.map((exercise, index) => (
                        <div
                            key={index}
                            className="bg-gray-700 text-white p-6 rounded-lg shadow-lg"
                        >
                            <h5 className="font-bold text-2xl mb-2">{exercise.Name}</h5>
                            <p className="text-base">Category: {exercise.Category}</p>
                            {exercise.Muscle && <p className="text-base">Muscle: {exercise.Muscle}</p>}
                        </div>
                    ))}
                </div>
                <button
                    className="bg-green-600 text-white py-2 px-4 rounded-full mt-8"
                    onClick={handleSaveTemplete}
                >
                    Save Templete
                </button>
            </div>
            <MobileNavbar />
            {isModalOpen && (
                <SearchExercisesModal
                    show={isModalOpen}
                    title="Add Exercise"
                    onClose={() => setIsModalOpen(false)}
                    exercisesData={exercisesData}
                    handleAddExercise={handleAddExercise}
                />
            )}
        </div>
    );
}

export default CreateTemplete;
