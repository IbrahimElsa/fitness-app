// firebaseAuthServices.js
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from './firebaseConfig';

// Make sure users/{uid} exists. The Profile page (profile picture, join date)
// and account deletion assume it does, but only email registration used to
// create it, so Google sign-ins never had one.
export const ensureUserDoc = async (user) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
        const snapshot = await getDoc(userDocRef);
        if (!snapshot.exists()) {
            await setDoc(userDocRef, { createdAt: new Date() }, { merge: true });
        }
    } catch (error) {
        // Non-fatal (e.g. offline with an empty cache); retried on the next login.
        console.error("Error ensuring user document:", error);
    }
};

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Only the user document is created here. Previously a placeholder
    // `{ initialized: true }` workout was written too, which showed up as a
    // broken entry in History and Statistics.
    await setDoc(doc(db, "users", user.uid), { createdAt: new Date() }, { merge: true });
    return user;
};

export const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user);
    return result.user;
};

// Map Firebase Auth error codes to messages a user can act on.
export const authErrorMessage = (error) => {
    switch (error?.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'Incorrect email or password.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists.';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters long.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a moment and try again.';
        case 'auth/network-request-failed':
            return "You're offline. Connect to the internet to sign in.";
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            return 'Sign-in was cancelled.';
        default:
            return error?.message || 'Something went wrong. Please try again.';
    }
};
