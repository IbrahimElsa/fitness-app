// src/pages/Templates.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CancelModal from "../components/CancelModal";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, doc, deleteDoc, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { PlusCircle, Edit, Trash2, Play } from "lucide-react";
import { motion } from "framer-motion";

function Templates() {
    const navigate = useNavigate();
    const { theme, themeCss } = useTheme();
    const { currentUser } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [templateToDelete, setTemplateToDelete] = useState(null);

    // Live subscription: Firestore serves the cached copy immediately (also
    // offline) and pushes updates, so no hand-rolled localStorage cache.
    useEffect(() => {
        if (!currentUser) return;

        const templatesCollectionRef = collection(db, "users", currentUser.uid, "templates");
        const unsubscribe = onSnapshot(
            templatesCollectionRef,
            (snapshot) => {
                setTemplates(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
                setIsLoading(false);
            },
            (error) => {
                console.error("Error fetching templates:", error);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [currentUser]);

    const handleCreateTemplate = () => {
        navigate("/edit-template");
    };

    const handleEditTemplate = (template) => {
        navigate("/edit-template", { state: { template } });
    };

    const confirmDeleteTemplate = () => {
        if (!templateToDelete) return;
        const templateDocRef = doc(db, "users", currentUser.uid, "templates", templateToDelete.id);
        // Applied to the local cache immediately; the snapshot listener above
        // updates the list. Not awaited so it also completes offline.
        deleteDoc(templateDocRef).catch((error) => {
            console.error("Error deleting template:", error);
        });
        setTemplateToDelete(null);
    };

    const handleLoadTemplate = async (template) => {
        let previousExercises = (template.exercises || []).map((exercise) => ({
            ...exercise,
            sets: [{ weight: "", reps: "" }], // Default to one empty set
        }));

        try {
            // Pre-size each exercise with the set count from its most recent
            // appearance in the last 20 workouts (served from cache offline).
            const workoutsCollectionRef = collection(db, "users", currentUser.uid, "workouts");
            const q = query(workoutsCollectionRef, orderBy("timestamp", "desc"), limit(20));
            const querySnapshot = await getDocs(q);

            for (const exercise of previousExercises) {
                for (const docSnapshot of querySnapshot.docs) {
                    const prevExercise = (docSnapshot.data().exercises || []).find((ex) => ex.Name === exercise.Name);
                    if (prevExercise?.sets?.length > 0) {
                        exercise.sets = prevExercise.sets.map(() => ({ weight: "", reps: "" }));
                        break;
                    }
                }
            }
        } catch (error) {
            // Fall back to one empty set per exercise rather than blocking the workout
            console.error("Error loading previous sets for template:", error);
        }

        navigate("/active-workout", { state: { selectedExercises: previousExercises, startTimer: true } });
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

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                    </div>
                ) : templates.length === 0 ? (
                    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-8 text-center max-w-md mx-auto`}>
                        <h3 className="text-xl font-semibold mb-3">No Templates Yet</h3>
                        <p className={`${themeCss.secondaryText} mb-4`}>
                            Create templates to save your favorite workouts for quick access
                        </p>
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
                                            {(template.exercises || []).length} exercise{(template.exercises || []).length !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    <div className="max-h-32 overflow-y-auto pr-2 mb-4">
                                        <ul className="space-y-1">
                                            {(template.exercises || []).map((exercise, index) => (
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
                                                onClick={() => setTemplateToDelete(template)}
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

            {templateToDelete && (
                <CancelModal
                    title="Delete Template"
                    message={`Delete "${templateToDelete.name}"? This can't be undone.`}
                    confirmLabel="Delete"
                    cancelLabel="Keep"
                    onConfirm={confirmDeleteTemplate}
                    onClose={() => setTemplateToDelete(null)}
                />
            )}
        </div>
    );
}

export default Templates;
