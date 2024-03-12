import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from "../components/Navbar";
import MobileNavbar from "../components/MobileNavbar";

const renderCustomBarShape = ({ fill, x, y, width, height, value }) => {
const gapHeight = 2;
const dayHeight = (height - (value - 1) * gapHeight) / value;

let shapes = [];
for (let i = 0; i < value; i++) {
    shapes.push(
        <rect
            key={`bar-${i}`}
            x={x}
            y={y + i * (dayHeight + gapHeight)}
            width={width}
            height={dayHeight}
            fill={fill}
        />
    );
}

return <g>{shapes}</g>;
};

function Home() {
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
        <div className="flex flex-col items-center h-screen bg-gray-200 p-4">
            <h1 className="text-3xl mb-4">Home</h1>
                <div style={{ width: '100%', height: '40%' }} className="border-">
                <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 7]} allowDecimals={false} />
                    <Tooltip />
                    <Bar 
                        dataKey="days" 
                        fill="#A66FB5" 
                        name="Days at Gym" 
                        shape={renderCustomBarShape}
                    />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <MobileNavbar />
    </div>
    );
}

export default Home;
