import React, { createContext, useState, useContext, useEffect } from 'react';
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
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

const firestore = getFirestore();
const auth = getAuth();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return unsubscribe;
    }, []);

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

            // Delete the user's data from Firestore
            const userDocRef = doc(firestore, "users", currentUser.uid);
            await deleteDoc(userDocRef);

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
