import React, { useEffect, useState } from "react";
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";
import { useTheme } from "../components/ThemeContext";
import { db } from '../firebaseConfig'; // Ensure you have this export in your firebase config
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext"; // Assumes you have an Auth context

function HistoryPage() {
    const { theme } = useTheme();
    const { currentUser } = useAuth();
    const [workouts, setWorkouts] = useState([]);

    const containerClass = theme === 'light' ? 'bg-white text-black' : 'bg-gray-800 text-white';

    useEffect(() => {
        if (!currentUser) {
            console.log("No current user found.");
            return;
        }

        const workoutsRef = collection(db, "users", currentUser.uid, "workouts");
        const q = query(workoutsRef, orderBy("date", "desc"));

        const unsubscribe = onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                console.log("No workouts found in the database.");
                return;
            }
            const workoutsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().date.toDate() // Formatting Firestore Timestamp to JavaScript Date
            }));
            setWorkouts(workoutsData);
        }, 
        error => {
            console.error("Error fetching workouts:", error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    return (
        <div className={`history-page ${containerClass}`}>
            <Navbar />
            <div className="w-full flex justify-between items-center p-4">
                <h1 className="text-xl font-bold text-right">History</h1>
            </div>
            <div className="flex flex-col items-center justify-center min-h-screen pt-10">
                {workouts.length > 0 ? (
                    workouts.map(workout => (
                        <div key={workout.id} className="workout-item bg-white shadow-md rounded-lg p-4 mb-4 w-3/4">
                            <p>{workout.name} on {workout.date.toLocaleDateString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No workouts found</p>
                )}
                <MobileNavbar />
            </div>
        </div>
    );
}

export default HistoryPage;
