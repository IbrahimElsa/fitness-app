import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { useTheme } from '../components/ThemeContext';

const renderCustomBarShape = ({ fill, x, y, width, height, value }) => {
    const gapHeight = 2;
    const totalGapsHeight = (value - 1) * gapHeight;
    const usableHeight = Math.max(0, height - totalGapsHeight);
    const dayHeight = value > 0 ? usableHeight / value : 0;

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

const CustomBarChart = ({ data }) => {
    const { theme } = useTheme();
    const textColor = theme === 'light' ? 'black' : 'white'; // Dynamically set text color based on theme

    const maxDays = Math.max(...data.map(item => item.days));

    return (
        <div style={{ width: '100%', height: '40%' }} >
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <XAxis dataKey="date" stroke={textColor} />
                    <YAxis domain={[0, maxDays]} allowDecimals={false} stroke={textColor}>
                        <Label value="Days at Gym" offset={0} position="insideLeft" angle={-90} style={{ fill: textColor }} />
                    </YAxis>
                    <Tooltip cursor={{ fill: 'transparent' }} labelStyle={{ color: textColor }} />
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
};

export default CustomBarChart;
