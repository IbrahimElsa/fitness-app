// src/pages/Profile.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useAuth } from "../AuthContext";
import DeleteAccModal from "../components/DeleteAccModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useTheme } from "../components/ThemeContext";
import { doc, deleteDoc, collection, getDocs, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser as firebaseDeleteUser } from "firebase/auth";
import { db, storage } from "../firebaseConfig";
import { Moon, Sun, Camera, LogOut, UserX, User, Mail, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

function Profile() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const { theme, toggleTheme, themeCss } = useTheme();
    const [showPencil, setShowPencil] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [profileStats, setProfileStats] = useState({
        workoutCount: 0,
        joinDate: null,
        lastWorkout: null,
    });

    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                try {
                    // Fetch profile picture
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setProfilePic(userDoc.data().profilePic);
                        
                        // Set join date
                        if (userDoc.data().createdAt) {
                            const joinDate = userDoc.data().createdAt.toDate ? 
                                userDoc.data().createdAt.toDate() : 
                                new Date(userDoc.data().createdAt);
                            setProfileStats(prev => ({ ...prev, joinDate }));
                        }
                    }
                    
                    // Fetch workout count and last workout
                    const workoutsCollectionRef = collection(db, "users", currentUser.uid, "workouts");
                    const querySnapshot = await getDocs(workoutsCollectionRef);
                    
                    const workouts = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp?.toDate ? 
                            doc.data().timestamp.toDate() : 
                            new Date(doc.data().timestamp)
                    }));
                    
                    workouts.sort((a, b) => b.timestamp - a.timestamp);
                    
                    setProfileStats(prev => ({
                        ...prev,
                        workoutCount: workouts.length,
                        lastWorkout: workouts.length > 0 ? workouts[0].timestamp : null,
                    }));
                    
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        
        fetchUserData();
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
    
            // Fetch and delete all documents in subcollections
            const workoutsCollectionRef = collection(db, `users/${currentUser.uid}/workouts`);
            const workoutDocs = await getDocs(workoutsCollectionRef);
            const workoutPromises = workoutDocs.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
            await Promise.all(workoutPromises);
            
            const templatesCollectionRef = collection(db, `users/${currentUser.uid}/templates`);
            const templateDocs = await getDocs(templatesCollectionRef);
            const templatePromises = templateDocs.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
            await Promise.all(templatePromises);
            
            const exercisesCollectionRef = collection(db, `users/${currentUser.uid}/exercises`);
            const exerciseDocs = await getDocs(exercisesCollectionRef);
            const exercisePromises = exerciseDocs.docs.map(docSnapshot => deleteDoc(docSnapshot.ref));
            await Promise.all(exercisePromises);
    
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
        document.getElementById('profilePicInput').click();
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

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    return (
        <div className={`${theme === 'light' ? themeCss.light : themeCss.dark} min-h-screen pb-20`}>
            <Navbar />
            
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Profile</h1>
                
                <div className="max-w-lg mx-auto">
                    {/* Profile Header with Image */}
                    <div className="relative flex flex-col items-center mb-8">
                        <div 
                            className="relative group cursor-pointer" 
                            onClick={handleProfilePicClick}
                        >
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg">
                                {profilePic ? (
                                    <img 
                                        src={profilePic} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                                        <FontAwesomeIcon 
                                            icon={faUserCircle} 
                                            className="text-slate-400 dark:text-slate-500 w-24 h-24" 
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                                <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" size={24} />
                            </div>
                        </div>
                        
                        <input 
                            type="file" 
                            id="profilePicInput" 
                            className="hidden" 
                            onChange={handleProfilePicChange}
                            accept="image/*"
                        />
                        
                        {currentUser && (
                            <div className="mt-4 text-center">
                                <h2 className="text-xl font-bold">{currentUser.displayName || 'Fitness Enthusiast'}</h2>
                                <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1 mt-1">
                                    <Mail size={14} />
                                    <span>{currentUser.email}</span>
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-4 text-center`}
                        >
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Workouts</p>
                            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{profileStats.workoutCount}</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ y: -5 }}
                            className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl p-4 text-center`}
                        >
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Member Since</p>
                            <p className="text-lg font-bold">{formatDate(profileStats.joinDate)}</p>
                        </motion.div>
                    </div>
                    
                    {/* Settings List */}
                    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl overflow-hidden mb-8`}>
                        <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                            <h3 className="font-medium">Settings</h3>
                        </div>
                        
                        <div>
                            <button 
                                onClick={toggleTheme}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center">
                                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                                    <span className="ml-3">Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
                                </div>
                                <div className={`w-10 h-5 ${theme === 'light' ? 'bg-slate-300' : 'bg-indigo-600'} rounded-full relative`}>
                                    <div className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all duration-200 ${theme === 'light' ? 'left-0.5' : 'left-5.5'}`}></div>
                                </div>
                            </button>

                            <div className="border-t border-slate-200 dark:border-slate-700">
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                                >
                                    <LogOut size={18} />
                                    <span className="ml-3">Logout</span>
                                </button>
                            </div>
                            
                            <div className="border-t border-slate-200 dark:border-slate-700">
                                <button 
                                    onClick={() => setModalOpen(true)}
                                    className="w-full flex items-center px-4 py-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                                >
                                    <UserX size={18} />
                                    <span className="ml-3">Delete Account</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Account Security */}
                    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl overflow-hidden mb-8`}>
                        <div className="border-b border-slate-200 dark:border-slate-700 px-4 py-3">
                            <h3 className="font-medium flex items-center">
                                <Shield size={16} className="mr-2" />
                                Security
                            </h3>
                        </div>
                        
                        <div className="px-4 py-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                Account Provider
                            </p>
                            <div className="flex items-center">
                                {currentUser?.providerData?.[0]?.providerId === 'password' ? (
                                    <p className="font-medium flex items-center">
                                        <Mail size={16} className="mr-2 text-indigo-500" />
                                        Email & Password
                                    </p>
                                ) : (
                                    <p className="font-medium flex items-center">
                                        <FontAwesomeIcon icon={faGoogle} className="mr-2 text-rose-500" />
                                        Google Account
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <MobileNavbar />
            
            {modalOpen && (
                <DeleteAccModal 
                    title="Confirm Account Deletion" 
                    onClose={() => setModalOpen(false)}
                    isGoogleUser={currentUser?.providerData?.[0]?.providerId !== 'password'}
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