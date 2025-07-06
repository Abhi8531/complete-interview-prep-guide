'use client';

import { useEffect, useState } from 'react';
import { useStudyStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, Target, TrendingUp, BookOpen, Code, LogOut, Home } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cppRoadmap, getTotalHours, getTotalProblems } from '@/data/roadmap';
import { getCurrentWeekNumber, getProgressPercentage } from '@/lib/schedule-utils';
import ProgressChart from './ProgressChart';
import ScheduleCalendar from './ScheduleCalendar';
import TopicList from './TopicList';
import ConstraintManager from './ConstraintManager';
import HomePage from './HomePage';

export default function Dashboard() {
  const { studyPlan, initializePlan } = useStudyStore();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'overview' | 'schedule' | 'topics' | 'constraints'>('home');

  useEffect(() => {
    if (!studyPlan) {
      initializePlan();
    }
  }, [studyPlan, initializePlan]);

  if (!studyPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen safe-top safe-bottom">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing your study plan...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = differenceInDays(new Date(studyPlan.config.endDate), new Date());
  const currentWeek = getCurrentWeekNumber(studyPlan.config.startDate);
  const progressPercentage = getProgressPercentage(
    studyPlan.progress.completedTopics,
    cppRoadmap.flatMap(w => w.topics)
  );

  const stats = [
    {
      icon: Calendar,
      label: 'Days Remaining',
      value: daysRemaining,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Target,
      label: 'Current Week',
      value: `Week ${currentWeek}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: `${progressPercentage}%`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Clock,
      label: 'Hours Studied',
      value: studyPlan.progress.totalHoursStudied,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto mobile-padding">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center flex-1 min-w-0">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className="text-lg sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate block w-full text-left"
                >
                  Complete Interview Prep
                </button>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Welcome back, Abhishek! 👋</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <span className="text-xs sm:text-sm text-gray-600 hidden md:inline">
                Target: {format(new Date(studyPlan.config.endDate), 'MMM d, yyyy')}
              </span>
              <button
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors tap-target"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto mobile-padding">
          <nav className="flex space-x-1 sm:space-x-4 md:space-x-8 overflow-x-auto mobile-nav-scroll" aria-label="Tabs">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'schedule', label: 'Schedule', icon: Calendar },
              { id: 'topics', label: 'Topics', icon: BookOpen },
              { id: 'constraints', label: 'Constraints', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors tap-target
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-padding py-4 sm:py-8">
        {activeTab === 'home' && <HomePage />}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Stats Grid */}
            <div className="grid-responsive-1-2-4 gap-4 sm:gap-5">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg card-hover">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-2 sm:p-3`}>
                        <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                      </div>
                      <div className="ml-3 sm:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                            {stat.label}
                          </dt>
                          <dd className="text-base sm:text-lg font-semibold text-gray-900">
                            {stat.value}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Chart */}
            <div className="bg-white shadow rounded-lg p-4 sm:p-6">
              <h2 className="text-responsive-base font-medium text-gray-900 mb-4">Weekly Progress</h2>
              <ProgressChart />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                <h3 className="text-responsive-base font-medium text-gray-900 mb-4">Study Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total Topics</span>
                    <span className="font-medium text-sm">{cppRoadmap.flatMap(w => w.topics).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Completed Topics</span>
                    <span className="font-medium text-sm">{studyPlan.progress.completedTopics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total Hours Required</span>
                    <span className="font-medium text-sm">{getTotalHours()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Total Problems</span>
                    <span className="font-medium text-sm">{getTotalProblems()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-4 sm:p-6">
                <h3 className="text-responsive-base font-medium text-gray-900 mb-4">Current Focus</h3>
                <div className="space-y-3">
                  {cppRoadmap
                    .find(w => w.weekNumber === currentWeek)
                    ?.topics.slice(0, 3).map(topic => (
                      <div key={topic.id} className="flex items-center space-x-3">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{topic.title}</p>
                          <p className="text-xs text-gray-500">{topic.estimatedHours} hours</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && <ScheduleCalendar />}
        {activeTab === 'topics' && <TopicList />}
        {activeTab === 'constraints' && <ConstraintManager />}
      </main>
    </div>
  );
} 