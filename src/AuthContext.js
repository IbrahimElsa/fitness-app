import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Remove cached user data so it doesn't leak to the next account on a shared device.
// Keeps device-level prefs like "theme".
const clearUserLocalStorage = () => {
    const exactKeys = [
        "activeWorkout",
        "recentWorkouts",
        "gymVisits",
        "templates",
        "workoutTemplates", // legacy key
        "timerEndTime",
        // legacy active-workout keys
        "startTime",
        "isActive",
        "timer",
        "timeLeft",
    ];
    exactKeys.forEach((key) => localStorage.removeItem(key));

    Object.keys(localStorage)
        .filter((key) => key.startsWith("workoutData_") || key.startsWith("workoutDataTimestamp_"))
        .forEach((key) => localStorage.removeItem(key));
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state to track auth initialization
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false); // Mark loading as complete once auth state is determined
        });

        return unsubscribe;
    }, [auth]);

    const logout = () => {
        clearUserLocalStorage();
        return signOut(auth);
    };

    const value = {
        currentUser,
        loading, // Include loading in the context value
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;