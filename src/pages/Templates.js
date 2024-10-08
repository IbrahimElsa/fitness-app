import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

function Templates() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [templates, setTemplates] = useState(() => {
        // Load templates from local storage if available
        const savedTemplates = localStorage.getItem("templates");
        return savedTemplates ? JSON.parse(savedTemplates) : [];
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            if (currentUser) {
                try {
                    const templatesCollectionRef = collection(db, "users", currentUser.uid, "templates");
                    const querySnapshot = await getDocs(templatesCollectionRef);
                    const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTemplates(templatesData);
                    // Save templates to local storage
                    localStorage.setItem("templates", JSON.stringify(templatesData));
                } catch (error) {
                    console.error("Error fetching templates:", error);
                }
            }
        };

        fetchTemplates();
    }, [currentUser]);

    const handleCreateTemplate = () => {
        navigate("/edit-template");
    };

    const handleEditTemplate = (template) => {
        navigate("/edit-template", { state: { template } });
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            const templateDocRef = doc(db, "users", currentUser.uid, "templates", templateId);
            await deleteDoc(templateDocRef);
            const updatedTemplates = templates.filter(template => template.id !== templateId);
            setTemplates(updatedTemplates);
            // Update local storage
            localStorage.setItem("templates", JSON.stringify(updatedTemplates));
        } catch (error) {
            console.error("Error deleting template:", error);
        }
    };

    const handleLoadTemplate = async (template) => {
        try {
            // Fetch the previously completed workout sets from Firestore (if any)
            const workoutsCollectionRef = collection(db, "users", currentUser.uid, "workouts");
            const querySnapshot = await getDocs(workoutsCollectionRef);

            let previousExercises = template.exercises.map(exercise => ({
                ...exercise,
                sets: [{ weight: "", reps: "" }]  // Default to one empty set
            }));

            querySnapshot.forEach(docSnapshot => {
                const workoutData = docSnapshot.data();
                workoutData.exercises.forEach(prevExercise => {
                    const matchingExercise = previousExercises.find(ex => ex.Name === prevExercise.Name);
                    if (matchingExercise) {
                        // Maintain the number of previous sets, but initialize with empty values
                        matchingExercise.sets = prevExercise.sets.map(() => ({
                            weight: "",
                            reps: ""
                        }));
                    }
                });
            });

            navigate("/active-Workout", { state: { selectedExercises: previousExercises, startTimer: true } });
        } catch (error) {
            console.error("Error loading template:", error);
        }
    };

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-900 text-white';

    return (
        <div className={`${containerClass} min-h-screen`}>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-center font-bold mb-10">Workout Templates</h1>
                <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-full mb-8"
                    onClick={handleCreateTemplate}
                >
                    Create New Template
                </button>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="bg-gray-700 text-white p-6 rounded-lg shadow-lg relative"
                        >
                            <h3 className="text-2xl font-bold mb-2 cursor-pointer" onClick={() => handleLoadTemplate(template)}>
                                {template.name}
                            </h3>
                            <ul>
                                {template.exercises.map((exercise, index) => (
                                    <li key={index}>{exercise.Name}</li>
                                ))}
                            </ul>
                            <div className="absolute top-2 right-2 flex flex-col space-y-2">
                                <button
                                    className="bg-yellow-500 text-white py-1 px-3 rounded"
                                    onClick={() => handleEditTemplate(template)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="bg-red-500 text-white py-1 px-3 rounded"
                                    onClick={() => handleDeleteTemplate(template.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Templates;
