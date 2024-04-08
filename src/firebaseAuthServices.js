import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
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
                email: user.email,
                createdAt: new Date(),
            });

            // Create a 'workouts' collection under the user
            const workoutsCollectionRef = doc(db, `users/${user.uid}/workouts`, 'initial');
            await setDoc(workoutsCollectionRef, {
                // Initial data or structure for the workouts collection
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

