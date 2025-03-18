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
    
    // Track insert position for visual indicator
    const [insertPosition, setInsertPosition] = useState(null);
    
    // Reset states when exercises change
    useEffect(() => {
        setDraggedItem(null);
        setDragOverItem(null);
        setInsertPosition(null);
    }, [selectedExercises]);

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
        
        if (draggedItem === null || index === draggedItem) {
            return;
        }
        
        // Set the current drag over item
        setDragOverItem(index);
        
        // Set insert position - will either be before or after the item
        // depending on which half of the item we're hovering over
        const rect = exerciseRefs.current[index].getBoundingClientRect();
        const mouseY = e.clientY;
        const threshold = rect.top + rect.height / 2;
        
        // If mouse is in the top half, insert before; otherwise, insert after
        setInsertPosition({
            index: index,
            position: mouseY < threshold ? 'before' : 'after'
        });
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
        setInsertPosition(null);
    };

    const handleDrop = (index) => {
        if (draggedItem === null || draggedItem === index) return;
        
        if (insertPosition === null) return;
        
        // Calculate the actual insertion index based on the position indicator
        let insertIndex = insertPosition.index;
        
        // If inserting after and it's not the last item, adjust the index
        if (insertPosition.position === 'after') {
            insertIndex += 1;
        }
        
        // If we're dropping after the dragged item, we need to adjust the index
        // because the dragged item will be removed first
        if (insertIndex > draggedItem) {
            insertIndex -= 1;
        }
        
        // Create a new array without modifying the original
        const newExercises = [...selectedExercises];
        
        // Remove the dragged item
        const draggedExercise = newExercises.splice(draggedItem, 1)[0];
        
        // Insert at the new position
        newExercises.splice(insertIndex, 0, draggedExercise);
        
        // Update state
        setSelectedExercises(newExercises);
        setDraggedItem(null);
        setDragOverItem(null);
        setInsertPosition(null);
    };

    // Touch handlers for mobile
    const handleTouchStart = (e, index) => {
        setTouchStartY(e.touches[0].clientY);
        setDraggedItem(index);
    };

    const handleTouchMove = (e) => {
        if (draggedItem === null || touchStartY === null) return;
        
        const draggedElement = exerciseRefs.current[draggedItem];
        if (!draggedElement) return;

        // Find which element we're hovering over
        const elementsUnderTouch = document.elementsFromPoint(
            e.touches[0].clientX,
            e.touches[0].clientY
        );
        
        // Look for another exercise card element
        let foundTarget = false;
        for (const el of elementsUnderTouch) {
            const index = exerciseRefs.current.findIndex(ref => ref && ref.contains(el));
            if (index !== -1 && index !== draggedItem) {
                // We've found a target
                setDragOverItem(index);
                foundTarget = true;
                
                // Determine if we should insert before or after the target
                const rect = exerciseRefs.current[index].getBoundingClientRect();
                const touchY = e.touches[0].clientY;
                const threshold = rect.top + rect.height / 2;
                
                setInsertPosition({
                    index: index,
                    position: touchY < threshold ? 'before' : 'after'
                });
                
                break;
            }
        }
        
        if (!foundTarget) {
            setDragOverItem(null);
            setInsertPosition(null);
        }
    };

    const handleTouchEnd = () => {
        // If we were over a drop target and have an insert position, perform the drop
        if (draggedItem !== null && dragOverItem !== null && insertPosition !== null) {
            handleDrop(dragOverItem);
        }
        
        // Reset states
        setDraggedItem(null);
        setDragOverItem(null);
        setInsertPosition(null);
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

    const getAnimationStyles = (index) => {
        const isDragging = index === draggedItem;
        
        return {
            scale: isDragging ? 1.05 : 1,
            zIndex: isDragging ? 10 : 1,
            opacity: isDragging ? 0.8 : 1,
            boxShadow: isDragging 
                ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                : "none",
            transition: { 
                type: "spring", 
                damping: 20,
                stiffness: 300 
            }
        };
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
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 relative">
                            {/* Render exercises */}
                            {selectedExercises.map((exercise, index) => (
                                <React.Fragment key={`${exercise.Name}-${index}`}>
                                    {/* Insert indicator line - before */}
                                    {insertPosition && 
                                     insertPosition.index === index && 
                                     insertPosition.position === 'before' && (
                                        <div 
                                            className="absolute left-0 right-0 h-1 bg-indigo-500 rounded-full z-20"
                                            style={{ 
                                                top: exerciseRefs.current[index]?.offsetTop - 4,
                                                width: '100%'
                                            }}
                                        />
                                    )}
                                    
                                    <motion.div
                                        initial={{ opacity: 1 }}
                                        animate={getAnimationStyles(index)}
                                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                                        ref={el => exerciseRefs.current[index] = el}
                                        className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-4 relative ${
                                            draggedItem === index ? 'z-10 opacity-70' : 'z-1'
                                        } transition-colors duration-200`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDragEnd={handleTouchEnd}
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
                                    
                                    {/* Insert indicator line - after */}
                                    {insertPosition && 
                                     insertPosition.index === index && 
                                     insertPosition.position === 'after' && (
                                        <div 
                                            className="absolute left-0 right-0 h-1 bg-indigo-500 rounded-full z-20"
                                            style={{ 
                                                top: (exerciseRefs.current[index]?.offsetTop || 0) + 
                                                     (exerciseRefs.current[index]?.offsetHeight || 0) + 4,
                                                width: '100%'
                                            }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                            
                            {/* If we're at the end and need to place an item at the end of the list */}
                            {insertPosition && 
                             insertPosition.index === selectedExercises.length - 1 && 
                             insertPosition.position === 'after' && (
                                <div 
                                    className="absolute left-0 right-0 h-1 bg-indigo-500 rounded-full z-20"
                                    style={{ 
                                        top: (exerciseRefs.current[selectedExercises.length - 1]?.offsetTop || 0) + 
                                             (exerciseRefs.current[selectedExercises.length - 1]?.offsetHeight || 0) + 4,
                                        width: '100%'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        className={`flex items-center gap-2 py-2.5 px-6 rounded-lg ${themeCss.successButton}`}
                        onClick={handleSaveTemplate}
                    >
                        <Save size={18} />
                        Save Template
                    </button>
                    <button
                        className={`flex items-center gap-2 py-2.5 px-6 rounded-lg ${themeCss.secondaryButton}`}
                        onClick={() => navigate("/templates")}
                    >
                        <X size={18} />
                        Cancel
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
                    modalZIndex={50}
                />
            )}
        </div>
    );
}

export default EditTemplate;