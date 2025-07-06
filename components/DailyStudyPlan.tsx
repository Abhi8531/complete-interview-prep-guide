'use client';

import { useState, useEffect } from 'react';
import { useStudyStore } from '@/lib/store';
import { format } from 'date-fns';
import { Calendar, Clock, BookOpen, Brain, CheckSquare, Square, Loader2, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { DailyStudySuggestion } from '@/types';
import { generateDailyStudySuggestions, DailyStudyRequest, AISchedulingContext } from '@/lib/ai-study-suggestions';
import { getDayType, getAvailableHours } from '@/lib/schedule-utils';
import { cppRoadmap } from '@/data/roadmap';
import toast from 'react-hot-toast';

interface Props {
  selectedDate: Date;
}

export default function DailyStudyPlan({ selectedDate }: Props) {
  const { studyPlan, updateSubtopicProgress, isSyncing } = useStudyStore();
  const [suggestions, setSuggestions] = useState<DailyStudySuggestion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [aiContext, setAiContext] = useState<AISchedulingContext | null>(null);

  useEffect(() => {
    if (studyPlan) {
      loadOrGenerateSuggestions();
    }
  }, [selectedDate, studyPlan]);

  const loadOrGenerateSuggestions = async () => {
    if (!studyPlan) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // Check if we have saved suggestions for this date
    const existingSession = studyPlan.sessions.find(s => s.date === dateString);
    if (existingSession?.aiSuggestions) {
      setSuggestions(existingSession.aiSuggestions);
      return;
    }

    // Generate new suggestions
    await generateSuggestions();
  };

  const generateSuggestions = async () => {
    if (!studyPlan) {
      toast.error('Study plan not loaded. Please refresh the page.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Define variables for AI context
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const dayType = getDayType(selectedDate, studyPlan.config);
      const isLabDay = studyPlan.config.defaultLabDays?.includes(format(selectedDate, 'EEEE').toLowerCase()) || false;
      
      const dayInfo = {
        date: selectedDate,
        dateString,
        dayOfWeek: selectedDate.getDay(),
        type: dayType,
        availableHours: Math.max(1, getAvailableHours({
          date: selectedDate,
          dateString,
          dayOfWeek: selectedDate.getDay(),
          type: dayType,
          availableHours: 0,
          isLabDay,
        }) || 2),
        isLabDay,
      };

      // Get current week topics with intelligent fallback
      let currentWeek = Math.floor((selectedDate.getTime() - new Date(studyPlan.config.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      // Ensure week is within valid range
      if (currentWeek < 1) currentWeek = 1;
      if (currentWeek > 30) currentWeek = 30;
      
      let currentTopics = cppRoadmap.find(w => w.weekNumber === currentWeek)?.topics || [];
      
      // Enhanced fallback: if no topics for current week, get from nearest week
      if (currentTopics.length === 0) {
        // Try previous weeks first, then next weeks
        for (let offset = 1; offset <= 5; offset++) {
          const prevWeek = currentWeek - offset;
          const nextWeek = currentWeek + offset;
          
          if (prevWeek >= 1) {
            const prevTopics = cppRoadmap.find(w => w.weekNumber === prevWeek)?.topics || [];
            if (prevTopics.length > 0) {
              currentTopics = prevTopics;
              console.log(`Using topics from week ${prevWeek} as fallback`);
              break;
            }
          }
          
          if (nextWeek <= 30) {
            const nextTopics = cppRoadmap.find(w => w.weekNumber === nextWeek)?.topics || [];
            if (nextTopics.length > 0) {
              currentTopics = nextTopics;
              console.log(`Using topics from week ${nextWeek} as fallback`);
              break;
            }
          }
        }
        
        // Final fallback to first week
        if (currentTopics.length === 0) {
          currentTopics = cppRoadmap[0]?.topics || [];
          console.log('Using fallback topics from week 1');
        }
      }

      // Build completed subtopics map with comprehensive safety checks
      const completedSubtopics: Record<string, number[]> = {};
      if (studyPlan.progress.topicsProgress) {
        Object.entries(studyPlan.progress.topicsProgress).forEach(([topicId, progress]) => {
          if (progress && progress.subtopicsProgress && Array.isArray(progress.subtopicsProgress)) {
            completedSubtopics[topicId] = progress.subtopicsProgress
              .filter(sp => sp && sp.completed)
              .map(sp => sp.subtopicIndex);
          }
        });
      }

      // Create enhanced AI request
      const request: DailyStudyRequest = {
        date: dateString,
        dayInfo,
        config: studyPlan.config,
        currentTopics,
        completedSubtopics,
        recentProgress: buildRecentProgress(studyPlan), // Enhanced progress tracking
      };

      console.log('Generating AI suggestions with enhanced context:', {
        week: currentWeek,
        availableHours: dayInfo.availableHours,
        dayType: dayInfo.type,
        isLabDay: dayInfo.isLabDay,
        completedTopicsCount: Object.keys(completedSubtopics).length,
        currentTopicsCount: currentTopics.length
      });

      // Generate AI-powered suggestions
      const aiSuggestions = await generateDailyStudySuggestions(request);
      setSuggestions(aiSuggestions);

      // Show success with AI context information
      const hasOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      const urgentTopics = countUrgentTopics(completedSubtopics, currentWeek);
      
      if (urgentTopics > 0) {
        toast.success(
          `🚨 AI study plan generated! ${urgentTopics} urgent topic(s) prioritized`,
          { duration: 4000 }
        );
      } else {
        toast.success(
          hasOpenAI 
            ? '🤖 AI study plan generated with smart prioritization!' 
            : '📚 Smart study plan generated! (Add OpenAI key for enhanced AI features)',
          { duration: 3000 }
        );
      }

      // Show additional context
      if (currentWeek > 15) {
        toast(`⏰ Week ${currentWeek}/30 - Focus on completion rate`, {
          icon: '📈',
          duration: 3000
        });
      }

    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      
      // Enhanced fallback with better error handling
      const basicSuggestions = generateEnhancedFallback(dateString, dayInfo, currentTopics);
      setSuggestions(basicSuggestions);
      
      toast.success('📚 Smart study plan generated successfully!');
      toast('💡 For AI-powered prioritization, ensure OpenAI API key is configured', {
        icon: '🤖',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Build recent progress for AI context
  const buildRecentProgress = (studyPlan: any) => {
    const recentProgress: any[] = [];
    
    if (studyPlan.progress.topicsProgress) {
      Object.entries(studyPlan.progress.topicsProgress).forEach(([topicId, progress]: [string, any]) => {
        if (progress && progress.subtopicsProgress && Array.isArray(progress.subtopicsProgress)) {
          const completedSubtopics = progress.subtopicsProgress
            .filter((sp: any) => sp && sp.completed && sp.completedAt)
            .map((sp: any) => sp.subtopicIndex);
          
          if (completedSubtopics.length > 0) {
            recentProgress.push({
              topicId,
              subtopicsCompleted: completedSubtopics,
              date: progress.subtopicsProgress.find((sp: any) => sp.completedAt)?.completedAt || new Date().toISOString()
            });
          }
        }
      });
    }
    
    return recentProgress.slice(-10); // Last 10 progress entries
  };

  // Count urgent topics for user feedback
  const countUrgentTopics = (completedSubtopics: Record<string, number[]>, currentWeek: number): number => {
    let urgentCount = 0;
    
    for (let week = 1; week <= currentWeek; week++) {
      const weekTopics = cppRoadmap.find(w => w.weekNumber === week)?.topics || [];
      
      weekTopics.forEach(topic => {
        const completed = completedSubtopics[topic.id] || [];
        const completionPercentage = (completed.length / topic.subtopics.length) * 100;
        
        if (completionPercentage < 80) {
          urgentCount++;
        }
      });
    }
    
    return urgentCount;
  };

  // Enhanced fallback function with better topic selection
  const generateEnhancedFallback = (date: string, dayInfo: any, topics: any[]): DailyStudySuggestion => {
    console.log('Generating enhanced fallback plan');
    
    if (!topics || topics.length === 0) {
      return {
        date,
        totalAvailableHours: dayInfo.availableHours || 2,
        suggestions: [{
          topicId: 'cpp-basics',
          topicTitle: 'C++ Fundamentals',
          subtopics: [{
            index: 0,
            title: 'Review C++ basics',
            estimatedTime: 60,
            priority: 'high' as const,
            reason: 'Foundation review for programming skills'
          }],
          timeSlots: [{
            start: '09:00',
            end: '10:00',
            activity: 'Study: Review C++ basics'
          }]
        }],
        tips: [
          'Focus on understanding fundamental concepts',
          'Take breaks every hour to maintain focus',
          'Practice coding examples for each concept'
        ]
      };
    }

    // Select best topic based on completion status
    let selectedTopic = topics[0];
    let bestCompletionRate = 100;
    
    if (studyPlan?.progress.topicsProgress) {
      topics.forEach(topic => {
        const completed = studyPlan.progress.topicsProgress[topic.id]?.subtopicsProgress || [];
        const completionRate = (completed.filter((sp: any) => sp.completed).length / topic.subtopics.length) * 100;
        
        if (completionRate < bestCompletionRate) {
          bestCompletionRate = completionRate;
          selectedTopic = topic;
        }
      });
    }
    
    // Safety check for selected topic
    if (!selectedTopic || !selectedTopic.id || !selectedTopic.subtopics || !Array.isArray(selectedTopic.subtopics)) {
      return {
        date,
        totalAvailableHours: dayInfo.availableHours || 2,
        suggestions: [{
          topicId: 'cpp-basics',
          topicTitle: 'C++ Fundamentals',
          subtopics: [{
            index: 0,
            title: 'Review C++ basics',
            estimatedTime: 60,
            priority: 'high' as const,
            reason: 'Foundation review for programming skills'
          }],
          timeSlots: [{
            start: '09:00',
            end: '10:00',
            activity: 'Study: Review C++ basics'
          }]
        }],
        tips: ['Focus on understanding', 'Take breaks every hour']
      };
    }
    
    // Find incomplete subtopics
    const completedSubtopics = studyPlan?.progress.topicsProgress?.[selectedTopic.id]?.subtopicsProgress || [];
    const completedIndices = completedSubtopics.filter((sp: any) => sp.completed).map((sp: any) => sp.subtopicIndex);
    
    const incompleteSubtopics = selectedTopic.subtopics
      .map((subtopic: string, index: number) => ({ subtopic, index }))
      .filter(({ index }) => !completedIndices.includes(index))
      .slice(0, Math.max(1, Math.floor(dayInfo.availableHours / 2))); // Max subtopics based on available time
    
    if (incompleteSubtopics.length === 0) {
      // All subtopics completed, suggest revision
      const firstSubtopic = selectedTopic.subtopics[0];
      incompleteSubtopics.push({ subtopic: `Review: ${firstSubtopic}`, index: 0 });
    }
    
    const subtopicsToStudy = incompleteSubtopics.map(({ subtopic, index }) => ({
      index,
      title: subtopic,
      estimatedTime: Math.min(90, Math.floor((dayInfo.availableHours * 60) / incompleteSubtopics.length)),
      priority: (index === 0 ? 'high' : 'medium') as const,
      reason: index === 0 ? 'Next sequential topic to master' : 'Building on previous concepts'
    }));
    
    return {
      date,
      totalAvailableHours: dayInfo.availableHours || 2,
      suggestions: [{
        topicId: selectedTopic.id,
        topicTitle: selectedTopic.title,
        subtopics: subtopicsToStudy,
        timeSlots: generateSimpleTimeSlots(subtopicsToStudy)
      }],
      tips: [
        'Focus on understanding concepts thoroughly',
        'Practice with code examples for each topic',
        'Take notes for future reference',
        'Review previous concepts if needed'
      ]
    };
  };

  // Generate simple time slots for fallback
  const generateSimpleTimeSlots = (subtopics: any[]) => {
    const timeSlots = [];
    let currentTime = '09:00';
    
    subtopics.forEach((subtopic, index) => {
      const startTime = currentTime;
      const endTime = addMinutesToTime(startTime, subtopic.estimatedTime);
      
      timeSlots.push({
        start: startTime,
        end: endTime,
        activity: `Study: ${subtopic.title}`
      });
      
      // Add break between subtopics
      if (index < subtopics.length - 1) {
        const breakStart = endTime;
        const breakEnd = addMinutesToTime(breakStart, 10);
        timeSlots.push({
          start: breakStart,
          end: breakEnd,
          activity: 'Break'
        });
        currentTime = breakEnd;
      }
    });
    
    return timeSlots;
  };

  // Helper function to add minutes to time
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleSubtopicToggle = async (topicId: string, subtopicIndex: number, completed: boolean) => {
    await updateSubtopicProgress(topicId, subtopicIndex, completed);
    
    if (completed) {
      toast.success('✅ Subtopic completed! Great progress!');
      
      // Check if topic is now complete
      const topic = cppRoadmap.flatMap(w => w.topics).find(t => t.id === topicId);
      if (topic) {
        const currentProgress = studyPlan?.progress.topicsProgress?.[topicId];
        if (currentProgress?.subtopicsProgress) {
          const completedCount = currentProgress.subtopicsProgress.filter((sp: any) => sp.completed).length;
          const totalCount = topic.subtopics.length;
          
          if (completedCount === totalCount) {
            toast.success(`🎉 Topic "${topic.title}" completed! Excellent work!`, {
              duration: 5000
            });
          } else {
            const percentage = Math.round((completedCount / totalCount) * 100);
            toast(`📈 ${percentage}% complete for "${topic.title}"`, {
              icon: '📊',
              duration: 3000
            });
          }
        }
      }
    } else {
      toast.success('📝 Subtopic marked as incomplete');
    }
  };

  const getSubtopicProgress = (topicId: string, subtopicIndex: number): boolean => {
    if (!studyPlan?.progress.topicsProgress || !topicId) return false;
    
    const progress = studyPlan.progress.topicsProgress[topicId];
    if (!progress || !progress.subtopicsProgress || !Array.isArray(progress.subtopicsProgress)) {
      return false;
    }
    
    return progress.subtopicsProgress.some(sp => 
      sp && sp.subtopicIndex === subtopicIndex && sp.completed
    ) || false;
  };

  // Get topic completion percentage
  const getTopicCompletionPercentage = (topicId: string): number => {
    if (!studyPlan?.progress.topicsProgress || !topicId) return 0;
    
    const topic = cppRoadmap.flatMap(w => w.topics).find(t => t.id === topicId);
    if (!topic) return 0;
    
    const progress = studyPlan.progress.topicsProgress[topicId];
    if (!progress || !progress.subtopicsProgress || !Array.isArray(progress.subtopicsProgress)) {
      return 0;
    }
    
    const completedCount = progress.subtopicsProgress.filter(sp => sp && sp.completed).length;
    return Math.round((completedCount / topic.subtopics.length) * 100);
  };

  if (!studyPlan) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            AI Study Plan for {format(selectedDate, 'EEEE, MMMM d')}
          </h2>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              <span>Regenerate AI Plan</span>
            </>
          )}
        </button>
      </div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 mb-2">🤖 AI is analyzing your progress...</p>
          <p className="text-sm text-gray-500">Creating personalized study plan with smart prioritization</p>
        </div>
      ) : suggestions ? (
        <div className="space-y-6">
          {/* Enhanced Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Available Study Time</p>
                <p className="text-2xl font-bold text-blue-900">{suggestions.totalAvailableHours} hours</p>
                <p className="text-xs text-blue-500 mt-1">
                  {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? '🤖 AI-powered with smart prioritization' : '📝 Smart algorithm with topic tracking'}
                </p>
              </div>
              <div className="text-right">
                <Clock className="h-8 w-8 text-blue-600 mx-auto" />
                <p className="text-xs text-blue-600 mt-1">
                  {suggestions.suggestions.length} topic(s) planned
                </p>
              </div>
            </div>
          </div>

          {/* Study Suggestions */}
          <div className="space-y-4">
            {suggestions.suggestions.map((suggestion, suggestionIndex) => {
              const completionPercentage = getTopicCompletionPercentage(suggestion.topicId);
              const isUrgent = suggestion.topicTitle.includes('🚨');
              
              return (
                <div key={suggestion.topicId} className={`border rounded-lg ${isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <button
                    onClick={() => toggleTopic(suggestion.topicId)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className={`h-5 w-5 ${isUrgent ? 'text-red-500' : 'text-gray-400'}`} />
                      <div className="text-left">
                        <h3 className={`font-medium ${isUrgent ? 'text-red-900' : 'text-gray-900'}`}>
                          {suggestion.topicTitle}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-gray-500">
                            {suggestion.subtopics.length} subtopic(s) to study
                          </p>
                          {completionPercentage > 0 && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span className="text-xs text-green-600 font-medium">
                                {completionPercentage}% complete
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isUrgent && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Target className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>

                  {expandedTopics.includes(suggestion.topicId) && (
                    <div className="border-t px-4 py-3">
                      {/* Subtopics */}
                      <div className="space-y-3 mb-4">
                        {suggestion.subtopics.map((subtopic) => {
                          const isCompleted = getSubtopicProgress(suggestion.topicId, subtopic.index);
                          
                          return (
                            <div key={subtopic.index} className="flex items-start space-x-3">
                              <button
                                onClick={() => handleSubtopicToggle(
                                  suggestion.topicId,
                                  subtopic.index,
                                  !isCompleted
                                )}
                                disabled={isSyncing}
                                className="mt-0.5 transition-colors"
                              >
                                {isCompleted ? (
                                  <CheckSquare className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                              
                              <div className="flex-1">
                                <p className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {subtopic.title}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-gray-500">
                                    {subtopic.estimatedTime} min
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    subtopic.priority === 'high' 
                                      ? 'bg-red-100 text-red-700'
                                      : subtopic.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {subtopic.priority} priority
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{subtopic.reason}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Time Slots */}
                      {suggestion.timeSlots.length > 0 && (
                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">📅 Suggested Schedule</h4>
                          <div className="space-y-1">
                            {suggestion.timeSlots.map((slot, idx) => (
                              <div key={idx} className="flex items-center space-x-2 text-sm">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">{slot.start} - {slot.end}</span>
                                <span className="text-gray-600">{slot.activity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Enhanced Daily Tips */}
          {suggestions.tips.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Brain className="h-4 w-4 mr-2 text-blue-600" />
                AI Study Tips for Today
              </h3>
              <ul className="space-y-2">
                {suggestions.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start">
                    <span className="text-blue-500 mr-2 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Click "Generate AI Plan" to get personalized study suggestions</p>
          <button
            onClick={generateSuggestions}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Generate AI Study Plan
          </button>
        </div>
      )}
    </div>
  );
} 