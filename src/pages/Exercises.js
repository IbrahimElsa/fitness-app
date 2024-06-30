import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import exercisesData from "../components/Exercises.json";
import { useTheme } from "../components/ThemeContext"; 
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore"; 

function ExercisesPage() {
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [customExercises, setCustomExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredExercises = allExercises.filter(exercise =>
        exercise.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const backgroundColor = theme === 'light' ? 'bg-white' : 'bg-gray-900';
    const textColor = theme === 'light' ? 'text-gray-900' : 'text-white';
    const cardBackgroundColor = theme === 'light' ? 'bg-white' : 'bg-gray-700';

    return (
        <div className={`${backgroundColor} min-h-screen`}>
            <Navbar />
            <div className={`container mx-auto px-4 py-8 ${textColor}`}>
                <h1 className="text-3xl text-center font-bold mb-10">Exercises</h1>
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search exercises..."
                        className={`w-full px-4 py-2 border rounded ${textColor} ${theme === 'light' ? 'border-gray-300' : 'border-gray-600'} ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExercises.map((exercise, index) => (
                        <div key={index} className={`${cardBackgroundColor} rounded-lg shadow-lg p-6 flex flex-col justify-between leading-normal`}>
                            <h5 className="font-bold text-2xl mb-2">{exercise.Name}</h5>
                            <p className="text-base">Category: {exercise.Category}</p>
                            {exercise.Muscle && <p className="text-base">Muscle: {exercise.Muscle}</p>}
                        </div>
                    ))}
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default ExercisesPage;
