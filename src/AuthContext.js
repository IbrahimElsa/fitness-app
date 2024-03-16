import React, { createContext, useState, useContext, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return unsubscribe;
    }, [auth]);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
