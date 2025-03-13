// src/pages/Exercises.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import exercisesData from "../components/Exercises.json";
import { useTheme } from "../components/ThemeContext"; 
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";

function ExercisesPage() {
    const { theme, themeCss } = useTheme();
    const { currentUser } = useAuth();
    const [customExercises, setCustomExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterMuscle, setFilterMuscle] = useState("");

    useEffect(() => {
        const fetchCustomExercises = async () => {
            if (currentUser) {
                try {
                    const customExercisesCollectionRef = collection(db, "users", currentUser.uid, "exercises");
                    const querySnapshot = await getDocs(customExercisesCollectionRef);
                    const customExercisesData = querySnapshot.docs.map(doc => doc.data());
                    setCustomExercises(customExercisesData);
                } catch (error) {
                    console.error("Error fetching custom exercises:", error);
                }
            }
        };

        fetchCustomExercises();
    }, [currentUser]);

    const allExercises = [...exercisesData.Exercises, ...customExercises];

    // Get unique categories and muscles for filters
    const categories = [...new Set(allExercises.map(ex => ex.Category))].sort();
    const muscles = [...new Set(allExercises.map(ex => ex.Muscle))].sort();

    const filteredExercises = allExercises.filter(exercise => {
        const matchesSearch = exercise.Name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "" || exercise.Category === filterCategory;
        const matchesMuscle = filterMuscle === "" || exercise.Muscle === filterMuscle;
        return matchesSearch && matchesCategory && matchesMuscle;
    });

    // Group exercises by muscle group
    const groupedExercises = filteredExercises.reduce((acc, exercise) => {
        const muscle = exercise.Muscle || "Other";
        if (!acc[muscle]) {
            acc[muscle] = [];
        }
        acc[muscle].push(exercise);
        return acc;
    }, {});

    const handleClearFilters = () => {
        setFilterCategory("");
        setFilterMuscle("");
        setSearchTerm("");
    };

    return (
        <div className={`${theme === 'light' ? themeCss.light : themeCss.dark} min-h-screen pb-20`}>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-center font-bold mb-6">Exercises</h1>
                
                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            className={`w-full pl-10 pr-4 py-3 border rounded-xl ${
                                theme === 'light' 
                                ? 'border-slate-300 bg-white' 
                                : 'border-slate-600 bg-slate-800'
                            } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                value={filterMuscle}
                                onChange={(e) => setFilterMuscle(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl appearance-none ${
                                    theme === 'light' 
                                    ? 'border-slate-300 bg-white' 
                                    : 'border-slate-600 bg-slate-800'
                                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                            >
                                <option value="">All Muscle Groups</option>
                                {muscles.map((muscle, index) => (
                                    <option key={index} value={muscle}>{muscle}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2.5 border rounded-xl appearance-none ${
                                    theme === 'light' 
                                    ? 'border-slate-300 bg-white' 
                                    : 'border-slate-600 bg-slate-800'
                                } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                            >
                                <option value="">All Equipment Types</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                        
                        {(filterCategory || filterMuscle || searchTerm) && (
                            <button
                                onClick={handleClearFilters}
                                className="py-2 px-4 text-sm text-indigo-600 dark:text-indigo-400 font-medium"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Results count */}
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Showing {filteredExercises.length} exercises
                </p>
                
                {/* Display exercises grouped by muscle */}
                {Object.keys(groupedExercises).length > 0 ? (
                    Object.entries(groupedExercises).map(([muscle, exercises]) => (
                        <div key={muscle} className="mb-8">
                            <h2 className="text-xl font-bold mb-4 px-2 border-l-4 border-indigo-500">
                                {muscle}
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {exercises.map((exercise, index) => (
                                    <motion.div
                                        key={`${exercise.Name}-${index}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className={`${
                                            theme === 'light' 
                                            ? 'bg-white border border-slate-200' 
                                            : 'bg-slate-800 border border-slate-700'
                                        } rounded-xl shadow-sm p-4 flex flex-col justify-between leading-normal hover:shadow-md transition-shadow duration-200`}
                                    >
                                        <h3 className="font-bold text-xl mb-2">{exercise.Name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                theme === 'light' 
                                                ? 'bg-indigo-100 text-indigo-800' 
                                                : 'bg-indigo-900 text-indigo-200'
                                            }`}>
                                                {exercise.Category}
                                            </span>
                                            {exercise.Muscle && (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    theme === 'light' 
                                                    ? 'bg-emerald-100 text-emerald-800' 
                                                    : 'bg-emerald-900 text-emerald-200'
                                                }`}>
                                                    {exercise.Muscle}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        No exercises found matching your criteria
                    </div>
                )}
            </div>
            <MobileNavbar />
        </div>
    );
}

export default ExercisesPage;