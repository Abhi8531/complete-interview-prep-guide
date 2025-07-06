'use client';

import { useEffect, useState } from 'react';
import { useStudyStore } from '@/lib/store';
import { Calendar, Clock, Target, TrendingUp, BookOpen, Code } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cppRoadmap, getTotalHours, getTotalProblems } from '@/data/roadmap';
import { getCurrentWeekNumber, getProgressPercentage } from '@/lib/schedule-utils';
import ProgressChart from './ProgressChart';
import ScheduleCalendar from './ScheduleCalendar';
import TopicList from './TopicList';
import ConstraintManager from './ConstraintManager';

export default function Dashboard() {
  const { studyPlan, initializePlan } = useStudyStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'topics' | 'constraints'>('overview');

  useEffect(() => {
    if (!studyPlan) {
      initializePlan();
    }
  }, [studyPlan, initializePlan]);

  if (!studyPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
                          <div className="flex items-center">
                <Code className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Comeplete Interview Prep</h1>
              </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Target: {format(new Date(studyPlan.config.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'topics', label: 'Topics' },
              { id: 'constraints', label: 'Constraints' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {stat.label}
                          </dt>
                          <dd className="text-lg font-semibold text-gray-900">
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
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Weekly Progress</h2>
              <ProgressChart />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Study Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Topics</span>
                    <span className="font-medium">{cppRoadmap.flatMap(w => w.topics).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Topics</span>
                    <span className="font-medium">{studyPlan.progress.completedTopics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hours Required</span>
                    <span className="font-medium">{getTotalHours()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Problems</span>
                    <span className="font-medium">{getTotalProblems()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Focus</h3>
                <div className="space-y-3">
                  {cppRoadmap
                    .find(w => w.weekNumber === currentWeek)
                    ?.topics.map(topic => (
                      <div key={topic.id} className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{topic.title}</p>
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