'use client';

import { useStudyStore } from '@/lib/store';
import { 
  Calendar, Clock, Target, TrendingUp, BookOpen, Code, 
  Award, Star, CheckCircle, AlertCircle, Activity,
  Brain, Database, Network, Cpu, Users, Zap,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cppRoadmap, getTotalHours, getTotalProblems } from '@/data/roadmap';
import { getCurrentWeekNumber, getProgressPercentage } from '@/lib/schedule-utils';
import ProgressChart from './ProgressChart';

export default function HomePage() {
  const { studyPlan } = useStudyStore();

  if (!studyPlan) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = differenceInDays(new Date(studyPlan.config.endDate), new Date());
  const currentWeek = getCurrentWeekNumber(studyPlan.config.startDate);
  const totalTopics = cppRoadmap.flatMap(w => w.topics).length;
  const completedTopics = studyPlan.progress.completedTopics.length;
  const progressPercentage = getProgressPercentage(
    studyPlan.progress.completedTopics,
    cppRoadmap.flatMap(w => w.topics)
  );

  // Calculate detailed statistics
  const totalHours = getTotalHours();
  const totalProblems = getTotalProblems();
  const hoursStudied = studyPlan.progress.totalHoursStudied;
  const weeksCompleted = Math.max(0, currentWeek - 1);
  const averageHoursPerDay = hoursStudied / Math.max(1, (Date.now() - new Date(studyPlan.config.startDate).getTime()) / (1000 * 60 * 60 * 24));

  // Subject-wise breakdown (simulated based on topics)
  const subjects = [
    { 
      name: 'C++ Programming', 
      icon: Code, 
      color: 'blue',
      progress: Math.min(100, (completedTopics / totalTopics) * 120),
      topics: Math.floor(totalTopics * 0.25),
      completed: Math.floor(completedTopics * 0.25)
    },
    { 
      name: 'Data Structures & Algorithms', 
      icon: Brain, 
      color: 'green',
      progress: Math.min(100, (completedTopics / totalTopics) * 110),
      topics: Math.floor(totalTopics * 0.30),
      completed: Math.floor(completedTopics * 0.30)
    },
    { 
      name: 'Database Management', 
      icon: Database, 
      color: 'purple',
      progress: Math.min(100, (completedTopics / totalTopics) * 100),
      topics: Math.floor(totalTopics * 0.15),
      completed: Math.floor(completedTopics * 0.15)
    },
    { 
      name: 'Operating Systems', 
      icon: Cpu, 
      color: 'orange',
      progress: Math.min(100, (completedTopics / totalTopics) * 90),
      topics: Math.floor(totalTopics * 0.15),
      completed: Math.floor(completedTopics * 0.15)
    },
    { 
      name: 'Computer Networks', 
      icon: Network, 
      color: 'indigo',
      progress: Math.min(100, (completedTopics / totalTopics) * 85),
      topics: Math.floor(totalTopics * 0.10),
      completed: Math.floor(completedTopics * 0.10)
    },
    { 
      name: 'Aptitude & Reasoning', 
      icon: Users, 
      color: 'pink',
      progress: Math.min(100, (completedTopics / totalTopics) * 95),
      topics: Math.floor(totalTopics * 0.05),
      completed: Math.floor(completedTopics * 0.05)
    }
  ];

  const mainStats = [
    {
      icon: TrendingUp,
      label: 'Overall Progress',
      value: `${progressPercentage}%`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${completedTopics} of ${totalTopics} topics completed`
    },
    {
      icon: Calendar,
      label: 'Days Remaining',
      value: daysRemaining,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: `Week ${currentWeek} of 30`
    },
    {
      icon: Clock,
      label: 'Hours Studied',
      value: hoursStudied,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: `${totalHours} hours total required`
    },
    {
      icon: Target,
      label: 'Weekly Average',
      value: `${Math.round(averageHoursPerDay * 7)}h`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: `${Math.round(averageHoursPerDay * 10) / 10}h daily average`
    }
  ];

  const achievementStats = [
    {
      icon: CheckCircle,
      label: 'Consistency Score',
      value: `${Math.min(100, Math.round((hoursStudied / (currentWeek * 10)) * 100))}%`,
      color: 'text-green-600'
    },
    {
      icon: Star,
      label: 'Performance Rating',
      value: progressPercentage > 80 ? 'Excellent' : progressPercentage > 60 ? 'Good' : progressPercentage > 40 ? 'Average' : 'Needs Improvement',
      color: progressPercentage > 80 ? 'text-green-600' : progressPercentage > 60 ? 'text-blue-600' : progressPercentage > 40 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      icon: Award,
      label: 'Streak',
      value: `${Math.min(currentWeek, weeksCompleted)} weeks`,
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      label: 'Momentum',
      value: hoursStudied > (currentWeek * 8) ? 'High' : hoursStudied > (currentWeek * 5) ? 'Medium' : 'Low',
      color: hoursStudied > (currentWeek * 8) ? 'text-green-600' : hoursStudied > (currentWeek * 5) ? 'text-yellow-600' : 'text-red-600'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg p-4 sm:p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-responsive-xl font-bold text-gray-900 mb-2">
              Welcome Back, Abhishek! 👋
            </h1>
            <p className="text-responsive-base text-gray-600">
              Your 30-week interview preparation journey
            </p>
            <p className="text-responsive-xs text-gray-500 mt-1">
              Target: {format(new Date(studyPlan.config.endDate), 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl sm:text-4xl font-bold text-blue-600">
              {progressPercentage}%
            </div>
            <div className="text-responsive-sm text-gray-600">Complete</div>
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid-responsive-1-2-4 gap-4 sm:gap-6">
        {mainStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow card-hover">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-2 sm:p-3`}>
                <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  {stat.label}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Metrics */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-indigo-600" />
          Performance Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {achievementStats.map((stat) => (
            <div key={stat.label} className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
              <p className={`text-sm sm:text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LineChart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" />
          Weekly Progress Chart
        </h2>
        <div className="chart-mobile">
          <ProgressChart />
        </div>
      </div>

      {/* Subject-wise Progress */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
          <PieChart className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-green-600" />
          Subject-wise Progress
        </h2>
        <div className="grid-responsive-1-2-3 gap-4 sm:gap-6">
          {subjects.map((subject) => (
            <div key={subject.name} className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow card-hover">
              <div className="flex items-center mb-3">
                <subject.icon className={`h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-${subject.color}-600`} />
                <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-tight">{subject.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{Math.round(subject.progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full progress-responsive">
                  <div 
                    className={`bg-${subject.color}-500 progress-responsive rounded-full transition-all duration-500`}
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{subject.completed} completed</span>
                  <span>{subject.topics} total</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Focus */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-responsive-base font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
            This Week's Focus
          </h3>
          <div className="space-y-3">
            {cppRoadmap
              .find(w => w.weekNumber === currentWeek)
              ?.topics.slice(0, 3).map(topic => (
                <div key={topic.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{topic.title}</p>
                    <p className="text-xs text-gray-500">{topic.estimatedHours} hours • {topic.difficulty}</p>
                  </div>
                  {studyPlan.progress.completedTopics.includes(topic.id) && (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Study Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-responsive-base font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
            Study Summary
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Total Study Time</p>
                <p className="text-xs text-gray-500">Across all subjects</p>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-green-600">{hoursStudied}h</p>
                <p className="text-xs text-gray-500">of {totalHours}h</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Problems Solved</p>
                <p className="text-xs text-gray-500">Coding challenges</p>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-purple-600">{Math.floor(completedTopics * 3.5)}</p>
                <p className="text-xs text-gray-500">of {totalProblems}</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Weeks Completed</p>
                <p className="text-xs text-gray-500">Study milestones</p>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-bold text-orange-600">{weeksCompleted}</p>
                <p className="text-xs text-gray-500">of 30 weeks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivation Section */}
      {progressPercentage < 100 && (
        <div className={`rounded-lg p-4 sm:p-6 border ${
          progressPercentage > 75 ? 'bg-green-50 border-green-200' : 
          progressPercentage > 50 ? 'bg-blue-50 border-blue-200' : 
          progressPercentage > 25 ? 'bg-yellow-50 border-yellow-200' : 
          'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start sm:items-center">
            <div className="flex-shrink-0 mt-1 sm:mt-0">
              {progressPercentage > 75 ? (
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              ) : progressPercentage > 50 ? (
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              ) : progressPercentage > 25 ? (
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              ) : (
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-responsive-base font-semibold ${
                progressPercentage > 75 ? 'text-green-900' : 
                progressPercentage > 50 ? 'text-blue-900' : 
                progressPercentage > 25 ? 'text-yellow-900' : 
                'text-red-900'
              }`}>
                {progressPercentage > 75 ? '🎉 Excellent Progress!' : 
                 progressPercentage > 50 ? '💪 Keep Going!' : 
                 progressPercentage > 25 ? '⚡ Stay Focused!' : 
                 '🚀 Let\'s Get Started!'}
              </h3>
              <p className={`text-responsive-sm ${
                progressPercentage > 75 ? 'text-green-700' : 
                progressPercentage > 50 ? 'text-blue-700' : 
                progressPercentage > 25 ? 'text-yellow-700' : 
                'text-red-700'
              }`}>
                {progressPercentage > 75 ? 
                  `You're almost there! Just ${100 - progressPercentage}% more to complete your preparation.` : 
                 progressPercentage > 50 ? 
                  `Great momentum! You've completed more than half of your preparation journey.` : 
                 progressPercentage > 25 ? 
                  `You've made a good start. Stay consistent to reach your goals.` : 
                  `Your journey begins now. Every topic completed brings you closer to success.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 