// src/pages/Workout.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

function WorkoutPage() {
    const navigate = useNavigate();
    const { theme, themeCss } = useTheme();
    const { currentUser } = useAuth();
    const [templates, setTemplates] = useState(() => {
        // Load templates from local storage if available
        const savedTemplates = localStorage.getItem("workoutTemplates");
        return savedTemplates ? JSON.parse(savedTemplates) : [];
    });
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        const fetchTemplates = async () => {
            if (currentUser) {
                try {
                    const templatesCollectionRef = collection(db, "users", currentUser.uid, "templates");
                    const querySnapshot = await getDocs(templatesCollectionRef);
                    const templatesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTemplates(templatesData);
                    // Save templates to local storage
                    localStorage.setItem("workoutTemplates", JSON.stringify(templatesData));
                } catch (error) {
                    console.error("Error fetching templates:", error);
                }
            }
        };

        fetchTemplates();
    }, [currentUser]);

    const startWorkout = () => {
        navigate('/active-workout', { state: { startTimer: true } });
    };

    const handleTemplateClick = (template) => {
        navigate("/active-workout", { state: { selectedExercises: template.exercises, startTimer: true } });
    };

    const handleNextPage = () => {
        if ((currentPage + 1) * 3 < templates.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const rippleVariants = {
        start: {
            scale: 1,
            opacity: 1,
        },
        end: {
            scale: 1.5,
            opacity: 0,
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
            },
        },
    };

    // Fill the remaining slots with 'Empty' placeholders
    const templatesToShow = [...templates.slice(currentPage * 3, (currentPage + 1) * 3)];
    while (templatesToShow.length < 3) {
        templatesToShow.push({ id: `empty-${templatesToShow.length}`, name: "Empty", isEmpty: true });
    }

    return (
        <div className={`flex flex-col h-screen ${theme === 'light' ? themeCss.light : themeCss.dark}`}>
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
                <h1 className="text-3xl text-center font-bold mb-6">Workout</h1>
                
                <div className="flex-1 flex flex-col justify-center items-center">
                    <motion.div
                        className="relative flex justify-center items-center my-8"
                        onClick={startWorkout}
                    >
                        <motion.div
                            className="absolute w-56 h-56 rounded-full bg-indigo-500/50 dark:bg-indigo-600/30"
                            variants={rippleVariants}
                            initial="start"
                            animate="end"
                        />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="relative z-10 flex justify-center items-center w-48 h-48 bg-gradient-to-br from-indigo-600 to-violet-600 text-center font-bold rounded-full cursor-pointer shadow-lg text-white"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <Play className="w-12 h-12 mb-2" />
                                <span className="text-2xl">START</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Templates Section */}
            <div className="w-full mb-20 px-6 py-4">
                <h2 className="text-xl text-center font-bold mb-6">Templates</h2>
                <div className="flex justify-center items-center">
                    <div className="flex items-center w-full max-w-lg">
                        <button 
                            className={`text-xl font-bold mr-3 p-2 rounded-full transition-all duration-300 ${
                                currentPage > 0 
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 opacity-100' 
                                : 'opacity-0 pointer-events-none'
                            }`}
                            onClick={handlePreviousPage}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        
                        <div className="flex flex-col justify-between w-full gap-3">
                            {templatesToShow.map((template) => (
                                <motion.div 
                                    key={template.id}
                                    whileHover={{ scale: template.isEmpty ? 1 : 1.02 }}
                                    whileTap={{ scale: template.isEmpty ? 1 : 0.98 }}
                                    className={`flex-1 p-4 ${
                                        template.isEmpty 
                                        ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-dashed border-slate-300 dark:border-slate-700' 
                                        : theme === 'light' 
                                          ? `${themeCss.cardLight} text-slate-900` 
                                          : `${themeCss.cardDark} text-white`
                                    } rounded-xl text-center ${template.isEmpty ? 'cursor-default' : 'cursor-pointer'}`}
                                    onClick={!template.isEmpty ? () => handleTemplateClick(template) : null}
                                >
                                    <h3 className="text-lg font-bold">{template.name}</h3>
                                    {!template.isEmpty && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                            {template.exercises?.length || 0} exercise{template.exercises?.length !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        
                        <button 
                            className={`text-xl font-bold ml-3 p-2 rounded-full transition-all duration-300 ${
                                (currentPage + 1) * 3 < templates.length 
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 opacity-100' 
                                : 'opacity-0 pointer-events-none'
                            }`}
                            onClick={handleNextPage}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            <MobileNavbar />
        </div>
    );
}

export default WorkoutPage;