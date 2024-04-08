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
        const user = userCredential.user;

        // Create a document in the "users" collection
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date(),
        });

        // Create a new document in the "workouts" collection
        const workoutsDocRef = doc(collection(db, "workouts"), user.uid);
        await setDoc(workoutsDocRef, {
            userId: user.uid,
            initialized: true,
            createdAt: new Date(),
        });

        return user;
    } catch (error) {
        throw error;
    }
};

