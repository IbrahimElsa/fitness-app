// firebaseAuthServices.js
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getFirestore, collection } from "firebase/firestore";
import { auth, googleProvider } from './firebaseConfig';

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email, password) => {
    const db = getFirestore();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Ensure the user is authenticated before proceeding
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                createdAt: new Date(),
            });

            // Create a 'workouts' subcollection under the user document
            const workoutsCollectionRef = collection(userDocRef, 'workouts');
            const initialWorkoutDocRef = doc(workoutsCollectionRef);
            await setDoc(initialWorkoutDocRef, {
                initialized: true,
                createdAt: new Date(),
            });

            return user;
        } else {
            throw new Error('Authentication not initialized');
        }
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
};

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        throw error;
    }
};
