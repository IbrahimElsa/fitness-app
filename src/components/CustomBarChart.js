import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../components/ThemeContext';

const CustomBarChart = ({ data }) => {
    const { theme } = useTheme();
    const textColor = theme === 'light' ? '#374151' : '#D1D5DB';
    const barColor = '#8B5CF6';

    const maxDays = Math.max(...data.map(item => item.days));

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-3xl h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <XAxis 
                            dataKey="date" 
                            stroke={textColor}
                            tickLine={false}
                            axisLine={{ stroke: textColor, strokeWidth: 1 }}
                        />
                        <YAxis 
                            domain={[0, maxDays]} 
                            allowDecimals={false} 
                            stroke={textColor}
                            tickLine={false}
                            axisLine={{ stroke: textColor, strokeWidth: 1 }}
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                            contentStyle={{ 
                                backgroundColor: theme === 'light' ? 'white' : '#374151',
                                borderColor: barColor,
                                borderRadius: '8px'
                            }}
                            labelStyle={{ color: textColor }}
                        />
                        <Bar
                            dataKey="days"
                            fill={barColor}
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CustomBarChart;
