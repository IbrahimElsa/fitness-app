// src/pages/Templates.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { PlusCircle, Edit, Trash2, Play } from "lucide-react";
import { motion } from "framer-motion";

function Templates() {
    const navigate = useNavigate();
    const { theme, themeCss } = useTheme();
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

    return (
        <div className={`${theme === 'light' ? themeCss.light : themeCss.dark} min-h-screen`}>
            <Navbar />
            <div className="container mx-auto px-4 py-8 pb-24">
                <h1 className="text-3xl text-center font-bold mb-8">Workout Templates</h1>
                
                <div className="flex justify-center mb-8">
                    <button
                        className={`flex items-center gap-2 py-2.5 px-5 rounded-lg ${themeCss.primaryButton}`}
                        onClick={handleCreateTemplate}
                    >
                        <PlusCircle size={18} />
                        Create New Template
                    </button>
                </div>
                
                {templates.length === 0 ? (
                    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-8 text-center max-w-md mx-auto`}>
                        <h3 className="text-xl font-semibold mb-3">No Templates Yet</h3>
                        <p className={`${themeCss.secondaryText} mb-4`}>
                            Create templates to save your favorite workouts for quick access
                        </p>
                        <button
                            className={`flex items-center gap-2 py-2 px-4 rounded-lg mx-auto ${themeCss.primaryButton}`}
                            onClick={handleCreateTemplate}
                        >
                            <PlusCircle size={16} />
                            Create Your First Template
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ y: -5 }}
                                className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl overflow-hidden`}
                            >
                                <div className="p-5">
                                    <h3 
                                        className="text-xl font-bold mb-2 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                        onClick={() => handleLoadTemplate(template)}
                                    >
                                        {template.name}
                                    </h3>
                                    
                                    <div className="mb-4">
                                        <p className={`text-sm ${themeCss.secondaryText}`}>
                                            {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    
                                    <div className="max-h-32 overflow-y-auto pr-2 mb-4">
                                        <ul className="space-y-1">
                                            {template.exercises.map((exercise, index) => (
                                                <li 
                                                    key={index} 
                                                    className={`text-sm py-1 px-2 rounded ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700/50'}`}
                                                >
                                                    {exercise.Name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <button
                                            className="flex items-center gap-1 py-1.5 px-3 rounded text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                                            onClick={() => handleLoadTemplate(template)}
                                        >
                                            <Play size={14} />
                                            Start
                                        </button>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                className="p-1.5 rounded text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                                onClick={() => handleEditTemplate(template)}
                                                aria-label="Edit template"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="p-1.5 rounded text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                aria-label="Delete template"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Templates;