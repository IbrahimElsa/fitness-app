import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import { useAuth } from "../AuthContext";
import DeleteAccModal from "../components/DeleteAccModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

function Profile() {
    const navigate = useNavigate();
    const { logout, deleteUser } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogout = async () => {
        try {
            await logout();
            console.log('Logged out');
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const handleDeleteAccount = async () => {
        if (!password) {
            setError('Please enter your password.');
            return;
        }
        try {
            await deleteUser(password);
            console.log('Account deleted');
            navigate('/');
        } catch (error) {
            console.error('Account deletion failed', error);
            setError('Failed to delete account. Please check your password and try again.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex flex-col h-screen bg-gray-200">
                <div className="px-4 py-2 w-full">
                    <h1 className="text-3xl pt-12 pl-6">Profile</h1>
                    
                    <div className="flex flex-col justify-center items-center flex-1">
                        {/* Logout button */}
                        <div className="w-full flex justify-center">
                            <FontAwesomeIcon 
                                icon={faUserCircle} 
                                size="9x" 
                                className="mt-12 text-gray-700 pb-10"
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
                    <div className="p-4 w-11/12">
                        {error && <p className="text-red-500">{error}</p>}
                        <p>Please enter your password to confirm deletion.</p>
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
