import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";
import CustomBarChart from "../components/CustomBarChart";
import { useAuth } from "../AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

function Home() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();

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
                        // Replace with a FontAwesomeIcon if user is logged in
                        <FontAwesomeIcon icon={faUserCircle} size="2x" className="text-black" />
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
