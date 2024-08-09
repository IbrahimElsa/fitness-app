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
    const [templates, setTemplates] = useState([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            if (currentUser) {
                try {
                    const templatesCollectionRef = collection(db, "users", currentUser.uid, "templates");
                    const querySnapshot = await getDocs(templatesCollectionRef);
                    const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTemplates(templatesData);
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
            setTemplates(templates.filter(template => template.id !== templateId));
        } catch (error) {
            console.error("Error deleting template:", error);
        }
    };

    const handleLoadTemplate = (template) => {
        navigate("/active-Workout", { state: { selectedExercises: template.exercises } });
    };

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

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
