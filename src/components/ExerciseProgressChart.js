import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../components/ThemeContext';
import { ArrowUpRight, ArrowDownRight, Dumbbell } from 'lucide-react';

const ExerciseProgressChart = ({ selectedExercise, workoutData }) => {
  const { theme, themeCss } = useTheme();
  const [progressData, setProgressData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    max: 0,
    lastValue: 0,
    percentageChange: 0
  });

  // Process workout data to extract progress for the selected exercise
  useEffect(() => {
    const processExerciseData = () => {
      if (!selectedExercise || !workoutData || workoutData.length === 0) {
        setProgressData([]);
        setStats({ max: 0, lastValue: 0, percentageChange: 0 });
        return;
      }
      
      setIsLoading(true);
      
      try {
        const progressDataPoints = [];
        
        // Process each workout to find the selected exercise data
        workoutData.forEach(workout => {
          const exerciseData = workout.exercises.find(ex => ex.Name === selectedExercise);
          
          if (exerciseData && exerciseData.sets && exerciseData.sets.length > 0) {
            // Find the max weight for this workout
            let maxWeight = 0;
            let maxWeightReps = 0;
            
            exerciseData.sets.forEach(set => {
              const weight = parseFloat(set.weight) || 0;
              const reps = parseInt(set.reps) || 0;
              
              if (weight > maxWeight) {
                maxWeight = weight;
                maxWeightReps = reps;
              }
            });
            
            if (maxWeight > 0) {
              progressDataPoints.push({
                date: workout.timestamp.toLocaleDateString(),
                timestamp: workout.timestamp,
                weight: maxWeight,
                reps: maxWeightReps
              });
            }
          }
        });
        
        // Sort by date ascending
        progressDataPoints.sort((a, b) => a.timestamp - b.timestamp);
        
        setProgressData(progressDataPoints);
        calculateStats(progressDataPoints);
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing exercise data:", error);
        setIsLoading(false);
      }
    };
    
    processExerciseData();
  }, [selectedExercise, workoutData]);
  
  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ max: 0, lastValue: 0, percentageChange: 0 });
      return;
    }
    
    const maxWeight = Math.max(...data.map(d => d.weight));
    const lastValue = data[data.length - 1].weight;
    
    let percentageChange = 0;
    
    if (data.length > 1) {
      const previousValue = data[data.length - 2].weight;
      percentageChange = ((lastValue - previousValue) / previousValue) * 100;
    }
    
    setStats({
      max: maxWeight,
      lastValue: lastValue,
      percentageChange: percentageChange
    });
  };

  // Memoize the tooltip to avoid unnecessary re-renders
  const CustomTooltip = useMemo(() => {
    return ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className={`p-3 rounded shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-sm">{`Weight: ${payload[0].value} lb`}</p>
            <p className="text-sm">{`Reps: ${payload[0].payload.reps}`}</p>
          </div>
        );
      }
      return null;
    };
  }, [theme]);

  return (
    <div className={`${theme === 'light' ? themeCss.cardLight : themeCss.cardDark} rounded-xl overflow-hidden p-4`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold">{selectedExercise ? selectedExercise : 'Exercise Progress'}</h2>
      </div>
      
      {/* Stats Summary */}
      {progressData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            <p className="text-xs text-slate-500 dark:text-slate-400">Max Weight</p>
            <p className="text-lg font-bold">{stats.max} lb</p>
          </div>
          
          <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            <p className="text-xs text-slate-500 dark:text-slate-400">Current Weight</p>
            <p className="text-lg font-bold">{stats.lastValue} lb</p>
          </div>
          
          <div className={`p-3 rounded-lg ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-700'}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">Last Change</p>
              {stats.percentageChange !== 0 && (
                stats.percentageChange > 0 
                  ? <ArrowUpRight size={16} className="text-green-500" />
                  : <ArrowDownRight size={16} className="text-red-500" />
              )}
            </div>
            <p className={`text-lg font-bold ${
              stats.percentageChange > 0 
                ? 'text-green-500' 
                : stats.percentageChange < 0 
                  ? 'text-red-500' 
                  : ''
            }`}>
              {stats.percentageChange.toFixed(1)}%
            </p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      ) : progressData.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium">No progress data available</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedExercise 
              ? `Complete more workouts with ${selectedExercise} to see progress`
              : 'Select an exercise to view progress'}
          </p>
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progressData}
              margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#475569'} />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickMargin={10}
                stroke={theme === 'light' ? '#64748b' : '#94a3b8'}
              />
              <YAxis 
                label={{ 
                  value: 'Weight (lb)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle' },
                  fill: theme === 'light' ? '#64748b' : '#94a3b8',
                  fontSize: 12
                }}
                tick={{ fontSize: 12 }}
                stroke={theme === 'light' ? '#64748b' : '#94a3b8'}
              />
              <Tooltip content={CustomTooltip} />
              <Line 
                type="monotone" 
                dataKey="weight" 
                name="Weight (lb)" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ r: 4, stroke: '#6366f1', fill: theme === 'light' ? 'white' : '#1e293b' }}
                activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ExerciseProgressChart;