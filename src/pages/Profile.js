import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useAuth } from "../AuthContext";
import DeleteAccModal from "../components/DeleteAccModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../components/ThemeContext";
import { 
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser as firebaseDeleteUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  deleteDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';

function Profile() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth(); // Use currentUser and logout from AuthContext
    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { theme } = useTheme(); // Use theme from context
    const db = getFirestore();

    const handleLogout = async () => {
        try {
            await logout();
            console.log('Logged out');
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const deleteUserAndData = async (password) => {
        if (!currentUser) {
            setError("No user is currently logged in.");
            return;
        }

        const credential = EmailAuthProvider.credential(
            currentUser.email,
            password
        );

        try {
            // Re-authenticate the user
            await reauthenticateWithCredential(currentUser, credential);

            // Fetch all workout documents in the "workouts" subcollection for the user
            const workoutsCollectionRef = collection(db, `users/${currentUser.uid}/workouts`);
            const workoutDocs = await getDocs(workoutsCollectionRef);
            
            // Delete each workout document
            for (const docSnapshot of workoutDocs.docs) {
                await deleteDoc(docSnapshot.ref);
            }

            // Delete the user's document from the "workouts" collection
            const workoutDocRef = doc(db, "workouts", currentUser.uid);
            await deleteDoc(workoutDocRef);

            // Delete the user's document from the "users" collection
            const userDocRef = doc(db, "users", currentUser.uid);
            await deleteDoc(userDocRef);

            // Finally, delete the user's authentication data
            await firebaseDeleteUser(currentUser);
            
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleDeleteAccount = async () => {
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        setError('');
        await deleteUserAndData(password);
    };

    // Determine the background and text color based on the current theme
    const backgroundColor = theme === 'light' ? 'bg-gray-200' : 'bg-gray-800';
    const textColor = theme === 'light' ? 'text-gray-700' : 'text-white';

    return (
        <div className={`${backgroundColor} min-h-screen`}>
            <Navbar />
            <div className={`flex flex-col h-screen ${backgroundColor}`}>
                <div className={`px-4 py-2 w-full ${textColor}`}>
                    <h1 className="text-3xl pt-12 pl-6">Profile</h1>
                    
                    <div className="flex flex-col justify-center items-center flex-1">
                        <div className="w-full flex justify-center">
                            <FontAwesomeIcon 
                                icon={faUserCircle} 
                                size="9x" 
                                className={`mt-12 ${textColor} pb-10`}
                            />
                        </div>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mb-4"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                        <button
                            className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                            onClick={() => setModalOpen(true)}
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
            <MobileNavbar />
            {modalOpen && (
                <DeleteAccModal title="Confirm Account Deletion" onClose={() => setModalOpen(false)}>
                    <div className={`p-4 w-11/12 ${textColor}`}>
                        {error && <p className="text-red-500">{error}</p>}
                        <p>Please enter your password to confirm deletion:</p>
                        <input
                            type="password"
                            placeholder="Password"
                            className="p-2 border rounded w-full mb-4"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                                onClick={handleDeleteAccount}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </DeleteAccModal>
            )}
        </div>
    );
}

export default Profile;
