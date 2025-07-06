'use client';

import { useStudyStore } from '@/lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cppRoadmap } from '@/data/roadmap';

export default function ProgressChart() {
  const { studyPlan } = useStudyStore();

  if (!studyPlan) return null;

  // Generate chart data
  const chartData = cppRoadmap.map(week => {
    const completedInWeek = week.topics.filter(topic => 
      studyPlan.progress.completedTopics.includes(topic.id)
    ).length;
    
    const totalInWeek = week.topics.length;
    const progressPercentage = totalInWeek > 0 ? Math.round((completedInWeek / totalInWeek) * 100) : 0;
    
    return {
      week: `Week ${week.weekNumber}`,
      weekShort: `W${week.weekNumber}`,
      completed: completedInWeek,
      total: totalInWeek,
      progress: progressPercentage,
    };
  });

  // Custom tooltip for better mobile experience
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value}{item.name === 'Progress %' ? '%' : ' topics'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={250} className="sm:!h-[300px] lg:!h-[350px]">
        <LineChart 
          data={chartData}
          margin={{ 
            top: 5, 
            right: 10, 
            left: 10, 
            bottom: 5 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={{ xs: 'weekShort', sm: 'week' }}
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            interval="preserveStartEnd"
            className="text-xs sm:text-sm"
          />
          <YAxis 
            yAxisId="left"
            label={{ 
              value: 'Topics', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: '12px' }
            }}
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            className="text-xs"
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ 
              value: 'Progress %', 
              angle: 90, 
              position: 'insideRight',
              style: { textAnchor: 'middle', fontSize: '12px' }
            }}
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            className="text-xs"
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="completed" 
            stroke="#3b82f6" 
            name="Completed Topics"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="progress" 
            stroke="#10b981" 
            name="Progress %"
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 