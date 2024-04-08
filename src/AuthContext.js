import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser as firebaseDeleteUser
} from "firebase/auth";
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const auth = getAuth();
    const db = getFirestore();

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
            // Re-authenticate the user
            await reauthenticateWithCredential(currentUser, credential);

            // Delete the user's document from the "users" collection
            const userDocRef = doc(db, "users", currentUser.uid);
            await deleteDoc(userDocRef);

            // Delete the user's document from the "workouts" collection
            const workoutsDocRef = doc(db, "workouts", currentUser.uid);
            await deleteDoc(workoutsDocRef);

            // Finally, delete the user's authentication data
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