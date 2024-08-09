import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useTheme } from "../components/ThemeContext";
import { useAuth } from "../AuthContext";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

function Templetes() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [templetes, setTempletes] = useState([]);

    useEffect(() => {
        const fetchTempletes = async () => {
            if (currentUser) {
                try {
                    const templetesCollectionRef = collection(db, "users", currentUser.uid, "templetes");
                    const querySnapshot = await getDocs(templetesCollectionRef);
                    const templetesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setTempletes(templetesData);
                } catch (error) {
                    console.error("Error fetching templetes:", error);
                }
            }
        };

        fetchTempletes();
    }, [currentUser]);

    const handleCreateTemplete = () => {
        navigate("/create-templete");
    };

    const handleLoadTemplete = (templete) => {
        navigate("/active-Workout", { state: { selectedExercises: templete.exercises } });
    };

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

    return (
        <div className={`${containerClass} min-h-screen`}>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl text-center font-bold mb-10">Workout Templetes</h1>
                <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-full mb-8"
                    onClick={handleCreateTemplete}
                >
                    Create New Templete
                </button>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templetes.map((templete) => (
                        <div
                            key={templete.id}
                            className="bg-gray-700 text-white p-6 rounded-lg shadow-lg cursor-pointer"
                            onClick={() => handleLoadTemplete(templete)}
                        >
                            <h3 className="text-2xl font-bold mb-2">{templete.name}</h3>
                            <ul>
                                {templete.exercises.map((exercise, index) => (
                                    <li key={index}>{exercise.Name}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Templetes;
