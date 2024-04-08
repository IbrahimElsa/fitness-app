import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc, getFirestore, collection } from "firebase/firestore";
import { auth } from './firebaseConfig';

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email, password) => {
    const db = getFirestore();
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Ensure the user is authenticated before proceeding
        if (userCredential.user) {
            const user = userCredential.user;

            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                createdAt: new Date(),
            });

            // Create a 'workouts' subcollection under the user document
            const workoutsCollectionRef = collection(userDocRef, 'workouts');
            const initialWorkoutDocRef = doc(workoutsCollectionRef);
            await setDoc(initialWorkoutDocRef, {
                // Initial data or structure for the workouts subcollection
                initialized: true,
                createdAt: new Date(),
            });

            return user;
        } else {
            throw new Error('Authentication not initialized');
        }
    } catch (error) {
        throw error;
    }
};