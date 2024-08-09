import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import SearchExercisesModal from "../components/SearchExercisesModal";
import exercisesData from "../components/Exercises.json";

function EditTemplate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [templateName, setTemplateName] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state && location.state.template) {
            const { template } = location.state;
            setTemplateName(template.name);
            setSelectedExercises(template.exercises);
        }
    }, [location.state]);

    const handleAddExercise = (exercise) => {
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const handleRemoveExercise = (indexToRemove) => {
        setSelectedExercises(selectedExercises.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveTemplate = async () => {
        if (templateName.trim() === "" || selectedExercises.length === 0) {
            alert("Please name the template and add at least one exercise.");
            return;
        }

        try {
            // Get a reference to the specific template document
            const templateDocRef = doc(db, "users", currentUser.uid, "templates", location.state.template.id);

            // Update the existing template document with the new data
            await updateDoc(templateDocRef, {
                name: templateName,
                exercises: selectedExercises,
                updatedAt: new Date(),  // Optional: track when the template was updated
            });

            // Redirect to the templates page after successful save
            navigate("/templates");
        } catch (error) {
            console.error("Error saving template:", error);
            alert("There was an error saving the template. Please try again.");
        }
    };

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

    return (
        <div className={`${containerClass} min-h-screen`}>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-center font-bold mb-10">Edit Template</h1>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Name your template..."
                        className={`w-full px-4 py-2 border rounded ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
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
                            className="bg-gray-700 text-white p-6 rounded-lg shadow-lg relative"
                        >
                            <h5 className="font-bold text-2xl mb-2">{exercise.Name}</h5>
                            <p className="text-base">Category: {exercise.Category}</p>
                            {exercise.Muscle && <p className="text-base">Muscle: {exercise.Muscle}</p>}
                            {/* X button to remove exercise */}
                            <button
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                onClick={() => handleRemoveExercise(index)}
                            >
                                X
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    className="bg-green-600 text-white py-2 px-4 rounded-full mt-8 mb-12"
                    onClick={handleSaveTemplate}
                >
                    Save Template
                </button>
            </div>
            {/* Place the MobileNavbar fixed at the bottom */}
            <MobileNavbar className="fixed bottom-0 left-0 w-full" />
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

export default EditTemplate;
