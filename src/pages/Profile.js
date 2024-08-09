import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useAuth } from "../AuthContext";
import DeleteAccModal from "../components/DeleteAccModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from "../components/ThemeContext";
import { doc, deleteDoc, collection, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser as firebaseDeleteUser } from "firebase/auth";
import { db, storage } from "../firebaseConfig";

function Profile() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const { theme } = useTheme();
    const [showPencil, setShowPencil] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    useEffect(() => {
        const fetchProfilePic = async () => {
            if (currentUser) {
                const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setProfilePic(userDoc.data().profilePic);
                }
            }
        };
        fetchProfilePic();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            console.log('Logged out');
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const deleteUserAndData = async (password, confirmText) => {
        if (!currentUser) {
            setError("No user is currently logged in.");
            return;
        }
    
        try {
            if (currentUser.providerData[0].providerId === 'password') {
                if (!password) {
                    setError('Please enter your password.');
                    return;
                }
                const credential = EmailAuthProvider.credential(currentUser.email, password);
                await reauthenticateWithCredential(currentUser, credential);
            } else {
                if (confirmText !== 'delete my account') {
                    setError('Please type "delete my account" to confirm.');
                    return;
                }
            }
    
            // Fetch and delete all documents in the "workouts" subcollection for the user
            const workoutsCollectionRef = collection(db, `users/${currentUser.uid}/workouts`);
            const workoutDocs = await getDocs(workoutsCollectionRef);
            const deletePromises = workoutDocs.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
            await Promise.all(deletePromises);
    
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
        setError('');
        await deleteUserAndData(password, confirmText);
    };

    const handleProfilePicClick = () => {
        if (showPencil) {
            document.getElementById('profilePicInput').click();
        } else {
            setShowPencil(true);
        }
    };

    const handleProfilePicChange = async (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const storageRef = ref(storage, `profilePictures/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", currentUser.uid), { profilePic: downloadURL });
            setProfilePic(downloadURL);
            setShowPencil(false);
        }
    };

    const backgroundColor = theme === 'light' ? 'bg-gray-200' : 'bg-gray-900';
    const textColor = theme === 'light' ? 'text-gray-700' : 'text-white';

    return (
        <div className={`${backgroundColor} min-h-screen`}>
            <Navbar />
            <div className={`flex flex-col h-screen ${backgroundColor}`}>
                <div className={`px-4 py-2 w-full ${textColor}`}>
                    <h1 className="text-3xl pt-12 pl-6">Profile</h1>
                    
                    <div className="flex flex-col justify-center items-center flex-1">
                        <div className="relative w-36 h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 mt-12 mb-10" onClick={handleProfilePicClick}>
                            {profilePic ? (
                                <img 
                                    src={profilePic} 
                                    alt="Profile" 
                                    className="rounded-full w-full h-full object-cover cursor-pointer"
                                />
                            ) : (
                                <FontAwesomeIcon 
                                    icon={faUserCircle} 
                                    className={`w-full h-full ${textColor} cursor-pointer`} 
                                />
                            )}
                            {showPencil && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <FontAwesomeIcon 
                                        icon={faPencilAlt} 
                                        className="text-white text-3xl" 
                                    />
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            id="profilePicInput" 
                            className="hidden" 
                            onChange={handleProfilePicChange}
                        />
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
                <DeleteAccModal 
                    title="Confirm Account Deletion" 
                    onClose={() => setModalOpen(false)}
                    isGoogleUser={currentUser.providerData[0].providerId !== 'password'}
                    password={password}
                    setPassword={setPassword}
                    confirmText={confirmText}
                    setConfirmText={setConfirmText}
                    handleDeleteAccount={handleDeleteAccount}
                    error={error}
                />
            )}
        </div>
    );
}

export default Profile;
