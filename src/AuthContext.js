import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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