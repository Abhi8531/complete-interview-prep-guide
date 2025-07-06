'use client';

import { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store';
import { CheckCircle, Circle, Clock, AlertTriangle, Target, TrendingUp, BookOpen, Code, Brain } from 'lucide-react';
import { cppRoadmap } from '@/data/roadmap';
import { format, differenceInDays } from 'date-fns';

interface TopicProgress {
  topicId: string;
  weekNumber: number;
  title: string;
  totalSubtopics: number;
  completedSubtopics: number;
  completionPercentage: number;
  estimatedHours: number;
  practiceProblems: number;
  isOnTrack: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  daysRemaining: number;
  expectedCompletionDate: string;
}

interface WeekSummary {
  weekNumber: number;
  focus: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  completionPercentage: number;
  isOnTrack: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export default function TopicList() {
  const { studyPlan, updateProgress, updateSubtopicProgress } = useStudyStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [weekSummaries, setWeekSummaries] = useState<WeekSummary[]>([]);

  useEffect(() => {
    if (studyPlan) {
      calculateProgress();
    }
  }, [studyPlan]);

  const calculateProgress = () => {
    if (!studyPlan) return;

    const currentDate = new Date();
    const startDate = new Date(studyPlan.config.startDate);
    const endDate = new Date(studyPlan.config.endDate);
    const currentWeek = Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Calculate progress for each topic
    const topicProgressData: TopicProgress[] = [];
    const weekSummaryData: WeekSummary[] = [];

    cppRoadmap.forEach(week => {
      let weekCompletedTopics = 0;
      let weekInProgressTopics = 0;
      let weekNotStartedTopics = 0;

      week.topics.forEach(topic => {
        const topicProgressInfo = studyPlan.progress.topicsProgress?.[topic.id];
        const completedSubtopics = topicProgressInfo?.subtopicsProgress?.filter(sp => sp.completed).length || 0;
        const totalSubtopics = topic.subtopics.length;
        const completionPercentage = (completedSubtopics / totalSubtopics) * 100;

        // Determine if topic is on track
        const expectedProgressByNow = week.weekNumber <= currentWeek ? 100 : 0;
        const isOnTrack = completionPercentage >= expectedProgressByNow * 0.8; // 80% threshold

        // Calculate urgency level
        let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (week.weekNumber <= currentWeek) {
          if (completionPercentage < 50) urgencyLevel = 'critical';
          else if (completionPercentage < 80) urgencyLevel = 'high';
          else if (completionPercentage < 100) urgencyLevel = 'medium';
        } else if (week.weekNumber === currentWeek + 1) {
          if (completionPercentage < 20) urgencyLevel = 'medium';
        }

        // Calculate days remaining for this topic
        const topicEndDate = new Date(startDate.getTime() + (week.weekNumber * 7 * 24 * 60 * 60 * 1000));
        const daysRemaining = Math.max(0, differenceInDays(topicEndDate, currentDate));

        topicProgressData.push({
          topicId: topic.id,
          weekNumber: week.weekNumber,
          title: topic.title,
          totalSubtopics,
          completedSubtopics,
          completionPercentage,
          estimatedHours: topic.estimatedHours,
          practiceProblems: topic.practiceProblems || 0,
          isOnTrack,
          urgencyLevel,
          daysRemaining,
          expectedCompletionDate: format(topicEndDate, 'yyyy-MM-dd')
        });

        // Update week summary counts
        if (completionPercentage === 100) {
          weekCompletedTopics++;
        } else if (completionPercentage > 0) {
          weekInProgressTopics++;
        } else {
          weekNotStartedTopics++;
        }
      });

      // Calculate week summary
      const totalTopics = week.topics.length;
      const weekCompletionPercentage = (weekCompletedTopics / totalTopics) * 100;
      const weekIsOnTrack = week.weekNumber > currentWeek || weekCompletionPercentage >= 80;
      
      let weekUrgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (week.weekNumber <= currentWeek) {
        if (weekCompletionPercentage < 50) weekUrgencyLevel = 'critical';
        else if (weekCompletionPercentage < 80) weekUrgencyLevel = 'high';
        else if (weekCompletionPercentage < 100) weekUrgencyLevel = 'medium';
      }

      weekSummaryData.push({
        weekNumber: week.weekNumber,
        focus: week.focus,
        totalTopics,
        completedTopics: weekCompletedTopics,
        inProgressTopics: weekInProgressTopics,
        notStartedTopics: weekNotStartedTopics,
        completionPercentage: weekCompletionPercentage,
        isOnTrack: weekIsOnTrack,
        urgencyLevel: weekUrgencyLevel
      });
    });

    setTopicProgress(topicProgressData);
    setWeekSummaries(weekSummaryData);
  };

  const handleTopicToggle = async (topicId: string, completed: boolean) => {
    await updateProgress(topicId, completed);
  };

  const handleSubtopicToggle = async (topicId: string, subtopicIndex: number, completed: boolean) => {
    await updateSubtopicProgress(topicId, subtopicIndex, completed);
  };

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getUrgencyColor = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getUrgencyIcon = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <Clock className="h-4 w-4" />;
      case 'medium': return <Target className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSubtopicProgress = (topicId: string, subtopicIndex: number): boolean => {
    if (!studyPlan?.progress.topicsProgress) return false;
    const progress = studyPlan.progress.topicsProgress[topicId];
    return progress?.subtopicsProgress?.some(sp => sp.subtopicIndex === subtopicIndex && sp.completed) || false;
  };

  const isTopicCompleted = (topicId: string): boolean => {
    return studyPlan?.progress.completedTopics.includes(topicId) || false;
  };

  // Calculate overall statistics
  const overallStats = {
    totalTopics: topicProgress.length,
    completedTopics: topicProgress.filter(tp => tp.completionPercentage === 100).length,
    inProgressTopics: topicProgress.filter(tp => tp.completionPercentage > 0 && tp.completionPercentage < 100).length,
    urgentTopics: topicProgress.filter(tp => tp.urgencyLevel === 'critical' || tp.urgencyLevel === 'high').length,
    onTrackTopics: topicProgress.filter(tp => tp.isOnTrack).length,
    averageCompletion: topicProgress.reduce((sum, tp) => sum + tp.completionPercentage, 0) / topicProgress.length || 0
  };

  const filteredWeeks = selectedWeek ? weekSummaries.filter(w => w.weekNumber === selectedWeek) : weekSummaries;
  const filteredTopics = selectedWeek 
    ? topicProgress.filter(tp => tp.weekNumber === selectedWeek)
    : topicProgress;

  if (!studyPlan) return null;

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
          30-Week Progress Overview
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{overallStats.completedTopics}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{overallStats.inProgressTopics}</p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{overallStats.urgentTopics}</p>
            <p className="text-sm text-gray-600">Urgent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{overallStats.onTrackTopics}</p>
            <p className="text-sm text-gray-600">On Track</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{Math.round(overallStats.averageCompletion)}%</p>
            <p className="text-sm text-gray-600">Avg Complete</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{overallStats.totalTopics}</p>
            <p className="text-sm text-gray-600">Total Topics</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(overallStats.averageCompletion)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${overallStats.averageCompletion}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Week Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Filter by Week</h3>
          <button
            onClick={() => setSelectedWeek(null)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedWeek === null 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Weeks
          </button>
        </div>
        
        <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map(week => {
            const weekSummary = weekSummaries.find(w => w.weekNumber === week);
            const isSelected = selectedWeek === week;
            
            return (
                <button
                key={week}
                onClick={() => setSelectedWeek(isSelected ? null : week)}
                className={`p-2 rounded-md text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : weekSummary?.urgencyLevel === 'critical'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : weekSummary?.urgencyLevel === 'high'
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    : weekSummary?.completionPercentage === 100
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={weekSummary ? `Week ${week}: ${Math.round(weekSummary.completionPercentage)}% complete` : `Week ${week}`}
              >
                {week}
              </button>
            );
          })}
        </div>
      </div>

      {/* Week Summaries */}
      {selectedWeek && (
        <div className="bg-white rounded-lg shadow p-6">
          {filteredWeeks.map(week => (
            <div key={week.weekNumber} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Week {week.weekNumber}: {week.focus}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {week.completedTopics}/{week.totalTopics} topics completed ({Math.round(week.completionPercentage)}%)
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(week.urgencyLevel)}`}>
                  <div className="flex items-center space-x-1">
                    {getUrgencyIcon(week.urgencyLevel)}
                    <span className="capitalize">{week.urgencyLevel}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    week.urgencyLevel === 'critical' ? 'bg-red-500' :
                    week.urgencyLevel === 'high' ? 'bg-orange-500' :
                    week.urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${week.completionPercentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Topic List */}
      <div className="space-y-4">
        {filteredTopics.map(topicProgress => {
          const topic = cppRoadmap
            .flatMap(w => w.topics)
            .find(t => t.id === topicProgress.topicId);
          
          if (!topic) return null;

          const isExpanded = expandedTopics.includes(topic.id);
          const isCompleted = isTopicCompleted(topic.id);

          return (
            <div key={topic.id} className={`bg-white rounded-lg shadow border-l-4 ${
              topicProgress.urgencyLevel === 'critical' ? 'border-red-500' :
              topicProgress.urgencyLevel === 'high' ? 'border-orange-500' :
              topicProgress.urgencyLevel === 'medium' ? 'border-yellow-500' : 'border-green-500'
            }`}>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleTopicToggle(topic.id, !isCompleted)}
                      className="transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {topic.title}
                      </h3>
                        <span className="text-sm text-gray-500">Week {topicProgress.weekNumber}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(topicProgress.urgencyLevel)}`}>
                          <div className="flex items-center space-x-1">
                            {getUrgencyIcon(topicProgress.urgencyLevel)}
                            <span className="capitalize">{topicProgress.urgencyLevel}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {topicProgress.completedSubtopics}/{topicProgress.totalSubtopics} subtopics
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {topicProgress.estimatedHours}h
                        </span>
                        <span className="flex items-center">
                          <Code className="h-4 w-4 mr-1" />
                          {topicProgress.practiceProblems} problems
                        </span>
                        {topicProgress.daysRemaining > 0 && (
                          <span className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {topicProgress.daysRemaining} days left
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {Math.round(topicProgress.completionPercentage)}%
                      </p>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            topicProgress.urgencyLevel === 'critical' ? 'bg-red-500' :
                            topicProgress.urgencyLevel === 'high' ? 'bg-orange-500' :
                            topicProgress.urgencyLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${topicProgress.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleTopicExpansion(topic.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Brain className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Subtopics */}
                {isExpanded && (
                  <div className="mt-4 pl-9 space-y-2">
                    {topic.subtopics.map((subtopic, index) => {
                      const isSubtopicCompleted = getSubtopicProgress(topic.id, index);
                      
                      return (
                        <div key={index} className="flex items-center space-x-2">
                                <button
                            onClick={() => handleSubtopicToggle(topic.id, index, !isSubtopicCompleted)}
                            className="transition-colors"
                                >
                            {isSubtopicCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                              <Circle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                  )}
                                </button>
                          <span className={`text-sm ${isSubtopicCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                          {subtopic}
                                        </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            );
          })}
      </div>

      {/* Completion Guarantee */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-600" />
          30-Week Completion Guarantee
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Progress Metrics</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✅ {overallStats.completedTopics} topics completed</li>
              <li>⚡ {overallStats.inProgressTopics} topics in progress</li>
              <li>🎯 {overallStats.onTrackTopics} topics on track</li>
              <li>📈 {Math.round(overallStats.averageCompletion)}% overall completion</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Success Strategy</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>🚨 Prioritize {overallStats.urgentTopics} urgent topics</li>
              <li>📚 Maintain daily study consistency</li>
              <li>⏰ Use AI recommendations for optimization</li>
              <li>🎯 Track progress weekly for adjustments</li>
            </ul>
          </div>
        </div>
        
        {overallStats.urgentTopics > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              <strong>Action Required:</strong> {overallStats.urgentTopics} topic(s) need immediate attention to stay on track for 30-week completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 