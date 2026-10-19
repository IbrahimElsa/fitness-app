import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Remove per-user data from localStorage so it doesn't leak to the next
// account on a shared device. Device-level prefs like "theme" are kept.
// Firestore's own persistent cache is keyed by document path (users/{uid}/...),
// so another account can never query it.
const clearUserLocalStorage = () => {
    const exactKeys = [
        "activeWorkout",
        "timerEndTime",
        // legacy caches, now replaced by Firestore offline persistence
        "recentWorkouts",
        "gymVisits",
        "templates",
        "workoutTemplates",
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
