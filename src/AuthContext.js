import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser as firebaseDeleteUser
} from "firebase/auth";

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

    const logout = () => {
        return signOut(auth);
    };

    const deleteUser = async (password) => {
        if (!currentUser) {
        throw new Error("No user is currently logged in.");
    }

    const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
    );

    try {
        await reauthenticateWithCredential(currentUser, credential);
        await firebaseDeleteUser(currentUser);
        } catch (error) {
        throw error;
        }
    };

    const value = {
        currentUser,
        logout,
        deleteUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
