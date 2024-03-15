import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

const CustomBarChart = ({ data }) => (
    <div style={{ width: '100%', height: '40%' }} >
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
);

export default CustomBarChart;
