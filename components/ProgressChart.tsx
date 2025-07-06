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
      completed: completedInWeek,
      total: totalInWeek,
      progress: progressPercentage,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="week" 
          tick={{ fontSize: 12 }}
          interval={2}
        />
        <YAxis 
          yAxisId="left"
          label={{ value: 'Topics', angle: -90, position: 'insideLeft' }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right"
          label={{ value: 'Progress %', angle: 90, position: 'insideRight' }}
          domain={[0, 100]}
        />
        <Tooltip />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="completed" 
          stroke="#3b82f6" 
          name="Completed Topics"
          strokeWidth={2}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="progress" 
          stroke="#10b981" 
          name="Progress %"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 