// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDPVV_dMvLLgKJ2w_xzqUTODeh6YWYC3fk",
    authDomain: "fitness-app-00.firebaseapp.com",
    databaseURL: "https://fitness-app-00-default-rtdb.firebaseio.com",
    projectId: "fitness-app-00",
    storageBucket: "fitness-app-00.appspot.com",
    messagingSenderId: "272840826228",
    appId: "1:272840826228:web:45e8a3f04594303c36a021"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Offline-first Firestore: documents are persisted in IndexedDB so reads work
// without a connection and writes are queued until the device is back online.
// The multi-tab manager keeps several open tabs consistent.
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, googleProvider };
