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
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date(),
        });

        return user;
    } catch (error) {
        throw error;
    }
};
