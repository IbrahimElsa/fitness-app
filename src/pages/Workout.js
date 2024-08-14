import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function WorkoutPage() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);

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
            scale: 2,
            opacity: 0,
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
            },
        },
    };

    const containerClass = theme === 'light' ? 'text-black bg-white' : 'bg-gray-900 text-white';

    // Fill the remaining slots with 'Empty' placeholders
    const templatesToShow = [...templates.slice(currentPage * 3, (currentPage + 1) * 3)];
    while (templatesToShow.length < 3) {
        templatesToShow.push({ id: `empty-${templatesToShow.length}`, name: "Empty", isEmpty: true });
    }

    return (
        <div className={`flex flex-col h-screen ${containerClass}`}>
            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
                <h1 className="text-3xl text-center mb-4 font-bold">Workout</h1>
                <div className="flex-1 flex flex-col justify-center items-center">
                    <motion.div
                        className="relative flex justify-center items-center"
                        onClick={startWorkout}
                    >
                        <motion.div
                            className="absolute w-48 h-48 rounded-full bg-blue-600"
                            variants={rippleVariants}
                            initial="start"
                            animate="end"
                        />
                        <div 
                            className="relative text-2xl z-10 flex justify-center items-center w-48 h-48 bg-blue-600 hover:bg-blue-700 text-center font-bold rounded-full cursor-pointer"
                        >
                            START
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Templates Section */}
            <div className="w-full mb-16 px-4">
                <h2 className="text-xl text-center mb-4 font-bold">Templates</h2>
                <div className="flex justify-center items-center">
                    <div className="flex items-center w-full max-w-lg">
                        <button 
                            className={`text-xl font-bold mr-2 transition-opacity duration-300 ${currentPage > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={handlePreviousPage}
                        >
                            &lt;
                        </button>
                        <div className="flex flex-col justify-between w-full">
                            {templatesToShow.map((template) => (
                                <div 
                                    key={template.id} 
                                    className={`flex-1 p-4 mb-2 ${template.isEmpty ? 'bg-gray-300 text-black' : 'bg-gray-700 text-white'} rounded-lg shadow-md text-center cursor-pointer`}
                                    onClick={!template.isEmpty ? () => handleTemplateClick(template) : null}
                                >
                                    <h3 className="text-lg font-bold">{template.name}</h3>
                                </div>
                            ))}
                        </div>
                        <button 
                            className={`text-xl font-bold ml-2 transition-opacity duration-300 ${(currentPage + 1) * 3 < templates.length ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={handleNextPage}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            <MobileNavbar className="fixed bottom-0 left-0 w-full" />
        </div>
    );
}

export default WorkoutPage;
