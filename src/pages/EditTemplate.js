// src/pages/EditTemplate.js
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import SearchExercisesModal from "../components/SearchExercisesModal";
import exercisesData from "../components/Exercises.json";
import { PlusCircle, Save, X, Dumbbell, GripVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function EditTemplate() {
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, themeCss } = useTheme();
    const { currentUser } = useAuth();
    const [templateName, setTemplateName] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [templateId, setTemplateId] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);
    const [touchStartY, setTouchStartY] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const exerciseRefs = useRef([]);

    useEffect(() => {
        if (location.state && location.state.template) {
            const { template } = location.state;
            setTemplateName(template.name);
            setSelectedExercises(template.exercises || []);
            setIsEditing(true);
            setTemplateId(template.id);
        }
    }, [location.state]);

    const handleAddExercise = (exercise) => {
        setSelectedExercises([...selectedExercises, exercise]);
    };

    const handleRemoveExercise = (indexToRemove) => {
        setSelectedExercises(selectedExercises.filter((_, index) => index !== indexToRemove));
    };

    // Drag and drop handlers
    const handleDragStart = (index) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverItem(index);
    };

    const handleDrop = (index) => {
        if (draggedItem === null) return;
        
        // Create a new array without modifying the original
        const newExercises = [...selectedExercises];
        
        // Remove the dragged item
        const draggedExercise = newExercises.splice(draggedItem, 1)[0];
        
        // Insert at the new position
        newExercises.splice(index, 0, draggedExercise);
        
        // Update state
        setSelectedExercises(newExercises);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e, index) => {
        setTouchStartY(e.touches[0].clientY);
        setDraggedItem(index);
        
        // Add visual feedback
        if (exerciseRefs.current[index]) {
            exerciseRefs.current[index].style.opacity = '0.6';
            exerciseRefs.current[index].style.transform = 'scale(1.03)';
            exerciseRefs.current[index].style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }
    };

    const handleTouchMove = (e) => {
        if (draggedItem === null || touchStartY === null) return;
        
        const touchY = e.touches[0].clientY;
        const draggedElement = exerciseRefs.current[draggedItem];
        
        if (!draggedElement) return;

        // Find which element we're hovering over
        const elementsUnderTouch = document.elementsFromPoint(
            e.touches[0].clientX,
            e.touches[0].clientY
        );
        
        // Look for another exercise card element
        for (const el of elementsUnderTouch) {
            const index = exerciseRefs.current.findIndex(ref => ref && ref.contains(el));
            if (index !== -1 && index !== draggedItem) {
                setDragOverItem(index);
                break;
            }
        }
    };

    const handleTouchEnd = () => {
        if (draggedItem !== null && dragOverItem !== null) {
            handleDrop(dragOverItem);
        }
        
        // Reset visual state
        if (draggedItem !== null && exerciseRefs.current[draggedItem]) {
            exerciseRefs.current[draggedItem].style.opacity = '1';
            exerciseRefs.current[draggedItem].style.transform = 'scale(1)';
            exerciseRefs.current[draggedItem].style.boxShadow = '';
        }
        
        setDraggedItem(null);
        setDragOverItem(null);
        setTouchStartY(null);
    };

    const handleSaveTemplate = async () => {
        if (templateName.trim() === "") {
            alert("Please name your template");
            return;
        }

        if (selectedExercises.length === 0) {
            alert("Please add at least one exercise");
            return;
        }
    
        try {
            if (isEditing && templateId) {
                // If editing an existing template
                const templateDocRef = doc(db, "users", currentUser.uid, "templates", templateId);
    
                await updateDoc(templateDocRef, {
                    name: templateName,
                    exercises: selectedExercises,
                    updatedAt: new Date(),
                });
            } else {
                // If creating a new template
                const templatesCollectionRef = collection(db, "users", currentUser.uid, "templates");
    
                await addDoc(templatesCollectionRef, {
                    name: templateName,
                    exercises: selectedExercises,
                    createdAt: new Date(),
                });
            }
    
            // Redirect to the templates page after successful save
            navigate("/templates");
        } catch (error) {
            console.error("Error saving template:", error);
            alert("There was an error saving the template. Please try again.");
        }
    };

    return (
        <div className={`${theme === 'light' ? themeCss.light : themeCss.dark} min-h-screen pb-20`}>
            <Navbar />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl text-center font-bold mb-6">
                    {isEditing ? "Edit Template" : "Create Template"}
                </h1>
                
                <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-4 mb-6`}>
                    <label htmlFor="templateName" className={`block text-sm font-medium ${themeCss.secondaryText} mb-1`}>
                        Template Name
                    </label>
                    <input
                        id="templateName"
                        type="text"
                        placeholder="Name your template..."
                        className={`w-full px-4 py-3 border rounded-lg ${
                            theme === 'light' ? themeCss.inputLight : themeCss.inputDark
                        }`}
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                    />
                </div>
                
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">
                        Exercises ({selectedExercises.length})
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            className={`flex items-center gap-2 py-2 px-4 rounded-lg ${themeCss.primaryButton}`}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusCircle size={18} />
                            Add Exercise
                        </button>
                    </div>
                </div>
                
                {selectedExercises.length === 0 ? (
                    <div className={`${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'} rounded-xl p-8 text-center border border-dashed ${theme === 'light' ? 'border-slate-300' : 'border-slate-700'}`}>
                        <Dumbbell className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                        <h3 className="text-lg font-medium mb-2">No Exercises Added</h3>
                        <p className={`${themeCss.secondaryText} mb-4`}>
                            Start building your template by adding exercises
                        </p>
                        <button
                            className={`flex items-center gap-2 py-2 px-4 rounded-lg mx-auto ${themeCss.primaryButton}`}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <PlusCircle size={16} />
                            Add First Exercise
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="mb-2 pl-2">
                            <p className={`text-sm ${themeCss.secondaryText}`}>
                                Hold and drag exercises to reorder them
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <AnimatePresence>
                            {selectedExercises.map((exercise, index) => (
                                <motion.div
                                    key={`${exercise.Name}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    ref={el => exerciseRefs.current[index] = el}
                                    className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-4 relative ${
                                        draggedItem === index ? 'opacity-60 scale-105' : ''
                                    } ${
                                        dragOverItem === index ? 'border-2 border-indigo-400' : ''
                                    } transition-all duration-200`}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={() => handleDrop(index)}
                                    onTouchStart={(e) => handleTouchStart(e, index)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <div className="absolute top-2 right-2">
                                        <button
                                            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                                            onClick={() => handleRemoveExercise(index)}
                                            aria-label="Remove exercise"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex items-center mb-2">
                                        <div 
                                            className="p-1 mr-2 text-slate-500 touch-none cursor-grab active:cursor-grabbing"
                                            aria-label="Drag to reorder"
                                        >
                                            <GripVertical size={20} />
                                        </div>
                                        <h3 className="font-bold text-lg pr-6">{exercise.Name}</h3>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {exercise.Category && (
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                theme === 'light' 
                                                ? 'bg-indigo-100 text-indigo-800' 
                                                : 'bg-indigo-900/30 text-indigo-300'
                                            }`}>
                                                {exercise.Category}
                                            </span>
                                        )}
                                        
                                        {exercise.Muscle && (
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                theme === 'light' 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-emerald-900/30 text-emerald-300'
                                            }`}>
                                                {exercise.Muscle}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                                            </div>
                    </div>
                )}
                
                <div className="flex justify-center mt-8">
                    <button
                        className={`flex items-center gap-2 py-2.5 px-6 rounded-lg ${themeCss.successButton}`}
                        onClick={handleSaveTemplate}
                    >
                        <Save size={18} />
                        Save Template
                    </button>
                </div>
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

export default EditTemplate;