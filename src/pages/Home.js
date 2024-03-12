import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MobileNavbar from "../components/MobileNavbar";
import Navbar from "../components/Navbar";

function Home() {
    // Adjusted data with dates instead of week numbers
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
            {/* Updated to use flex-col for a vertical layout */}
            <div className="flex flex-col items-center h-screen bg-gray-200 p-4">
                <h1 className="text-3xl mb-4">Home</h1>
                <div style={{ width: '100%', height: '40%' }} className="border-">
                    <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}> 
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 7]} allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="days" fill="#8884d8" name="Days at Gym" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <MobileNavbar />
        </div>
    );
}

export default Home;
