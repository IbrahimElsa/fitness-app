import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CustomBarChart from "../components/CustomBarChart";
import { useAuth } from "../AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

function Home() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleToggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async () => {
        try {
            await logout(); // Call the logout method from your AuthContext
            navigate('/');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const data = [
        { date: '03-05', days: 4 },
        { date: '03-12', days: 5 },
        { date: '03-19', days: 3 },
        { date: '03-26', days: 4 },
        { date: '04-02', days: 2 },
        { date: '04-09', days: 6 },
    ];

    return (
        <div>
            <Navbar />
            <div className="flex flex-col h-screen bg-gray-200">
                <div className="px-4 py-2 flex justify-between items-center w-full">
                    <h1 className="text-3xl pt-12 pl-6">Home</h1>
                    {currentUser ? (
                <div className="relative">
                    <FontAwesomeIcon 
                        icon={faUserCircle} 
                        size="2x" 
                        className="text-black cursor-pointer"
                        onClick={handleToggleDropdown}
                    />
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                            <Link to="/settings" className="block px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white">
                                Settings
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="block w-full text-left px-4 py-2 text-sm capitalize text-gray-700 hover:bg-blue-500 hover:text-white"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
                    ) : (
                        // Show login button if not logged in
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() => navigate('/login')}
                        >
                            Log in
                        </button>
                    )}
                </div>
                <div className="flex flex-col items-center flex-1 p-4 mt-10">
                    <CustomBarChart data={data} />
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Home;
