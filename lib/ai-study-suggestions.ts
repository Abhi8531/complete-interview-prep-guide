import OpenAI from 'openai';
import { DailyStudySuggestion, DayInfo, ScheduleConfig } from '@/types';
import { cppRoadmap, Topic, getDailyStudyPlan } from '@/data/roadmap';
import { format, differenceInDays } from 'date-fns';

const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    })
  : null;

export interface DailyStudyRequest {
  date: string;
  dayInfo: DayInfo;
  config: ScheduleConfig;
  currentTopics: Topic[];
  completedSubtopics: Record<string, number[]>; // topicId -> completed subtopic indices
  recentProgress: {
    topicId: string;
    subtopicsCompleted: number[];
    date: string;
  }[];
}

// Enhanced topic tracking interfaces
export interface TopicCoverage {
  topicId: string;
  weekNumber: number;
  totalSubtopics: number;
  completedSubtopics: number;
  completionPercentage: number;
  isOnTrack: boolean;
  daysRemaining: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface WeeklyProgress {
  weekNumber: number;
  expectedTopics: string[];
  completedTopics: string[];
  inProgressTopics: string[];
  behindSchedule: boolean;
  completionPercentage: number;
}

export interface AISchedulingContext {
  currentWeek: number;
  totalWeeks: number;
  daysRemaining: number;
  topicCoverage: TopicCoverage[];
  weeklyProgress: WeeklyProgress[];
  urgentTopics: string[];
  completedTopics: string[];
}

export async function generateDailyStudySuggestions(
  request: DailyStudyRequest
): Promise<DailyStudySuggestion> {
  const { date, dayInfo, config, currentTopics, completedSubtopics, recentProgress } = request;
  
  // Get current week number from date
  const startDate = new Date(config.startDate);
  const currentDate = new Date(date);
  const weekNumber = Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const dayOfWeek = currentDate.getDay() || 7; // Make Sunday = 7
  
  // Create AI scheduling context for intelligent decision making
  const schedulingContext = createSchedulingContext(currentDate, config, completedSubtopics);
  
  // Use enhanced AI-powered topic selection
  const enhancedSuggestions = await generateEnhancedAISuggestions(
    request,
    schedulingContext,
    weekNumber,
    dayOfWeek
  );
  
  if (enhancedSuggestions) {
    return enhancedSuggestions;
  }
  
  // Get daily study plan from roadmap as fallback
  const dailyPlan = getDailyStudyPlan(weekNumber, dayOfWeek, dayInfo.availableHours);
  
  if (dailyPlan) {
    // Convert roadmap plan to our format with enhanced topic selection
    const suggestions = await enhanceRoadmapSuggestions(
      dailyPlan,
      currentTopics,
      completedSubtopics,
      schedulingContext,
      dayInfo,
      config
    );

    return {
      date,
      totalAvailableHours: dayInfo.availableHours,
      suggestions,
      tips: [
        ...dailyPlan.tips,
        ...getDaySpecificTips(dayInfo, weekNumber),
        ...getProgressTips(schedulingContext)
      ]
    };
  }

  // Enhanced fallback with AI-powered topic prioritization
  return generateIntelligentFallbackSuggestions(request, schedulingContext);
}

// Create comprehensive scheduling context for AI decision making
function createSchedulingContext(
  currentDate: Date,
  config: ScheduleConfig,
  completedSubtopics: Record<string, number[]>
): AISchedulingContext {
  const startDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);
  const currentWeek = Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const daysRemaining = differenceInDays(endDate, currentDate);
  
  // Calculate topic coverage for all topics
  const topicCoverage: TopicCoverage[] = [];
  const weeklyProgress: WeeklyProgress[] = [];
  const completedTopics: string[] = [];
  const urgentTopics: string[] = [];
  
  // Analyze each week's progress
  for (let week = 1; week <= totalWeeks; week++) {
    const weekTopics = cppRoadmap.find(w => w.weekNumber === week)?.topics || [];
    const expectedTopics = weekTopics.map(t => t.id);
    const completedWeekTopics: string[] = [];
    const inProgressTopics: string[] = [];
    
    weekTopics.forEach(topic => {
      const completed = completedSubtopics[topic.id] || [];
      const totalSubtopics = topic.subtopics.length;
      const completedCount = completed.length;
      const completionPercentage = (completedCount / totalSubtopics) * 100;
      
      // Determine if topic is on track based on current week
      const expectedProgressByNow = week <= currentWeek ? 100 : 0;
      const isOnTrack = completionPercentage >= expectedProgressByNow * 0.8; // 80% threshold
      
      // Calculate urgency level
      let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (week <= currentWeek) {
        if (completionPercentage < 50) urgencyLevel = 'critical';
        else if (completionPercentage < 80) urgencyLevel = 'high';
        else if (completionPercentage < 100) urgencyLevel = 'medium';
      } else if (week === currentWeek + 1) {
        if (completionPercentage < 20) urgencyLevel = 'medium';
      }
      
      const coverage: TopicCoverage = {
        topicId: topic.id,
        weekNumber: week,
        totalSubtopics,
        completedSubtopics: completedCount,
        completionPercentage,
        isOnTrack,
        daysRemaining,
        urgencyLevel
      };
      
      topicCoverage.push(coverage);
      
      if (completionPercentage === 100) {
        completedTopics.push(topic.id);
        completedWeekTopics.push(topic.id);
      } else if (completionPercentage > 0) {
        inProgressTopics.push(topic.id);
      }
      
      if (urgencyLevel === 'critical' || urgencyLevel === 'high') {
        urgentTopics.push(topic.id);
      }
    });
    
    const weekCompletion = expectedTopics.length > 0 
      ? (completedWeekTopics.length / expectedTopics.length) * 100 
      : 0;
    
    weeklyProgress.push({
      weekNumber: week,
      expectedTopics,
      completedTopics: completedWeekTopics,
      inProgressTopics,
      behindSchedule: week <= currentWeek && weekCompletion < 80,
      completionPercentage: weekCompletion
    });
  }
  
  return {
    currentWeek,
    totalWeeks,
    daysRemaining,
    topicCoverage,
    weeklyProgress,
    urgentTopics,
    completedTopics
  };
}

// Enhanced AI-powered topic selection
async function generateEnhancedAISuggestions(
  request: DailyStudyRequest,
  context: AISchedulingContext,
  weekNumber: number,
  dayOfWeek: number
): Promise<DailyStudySuggestion | null> {
  const { date, dayInfo, config, completedSubtopics } = request;
  
  // Prioritize topics based on urgency and completion status
  const prioritizedTopics = getPrioritizedTopics(context, weekNumber, dayInfo.availableHours);
  
  if (prioritizedTopics.length === 0) {
    return null;
  }
  
  const suggestions: DailyStudySuggestion['suggestions'] = [];
  let totalMinutesAvailable = dayInfo.availableHours * 60;
  
  for (const topicData of prioritizedTopics) {
    if (totalMinutesAvailable <= 0) break;
    
    const topic = cppRoadmap.flatMap(w => w.topics).find(t => t.id === topicData.topicId);
    if (!topic) continue;
    
    const completed = completedSubtopics[topic.id] || [];
    const incompleteSubtopics = topic.subtopics
      .map((subtopic, index) => ({ subtopic, index }))
      .filter(({ index }) => !completed.includes(index));
    
    if (incompleteSubtopics.length === 0) continue;
    
    // Smart subtopic selection based on urgency and available time
    const selectedSubtopics = selectOptimalSubtopics(
      incompleteSubtopics,
      totalMinutesAvailable,
      topicData.urgencyLevel,
      dayInfo.availableHours
    );
    
    if (selectedSubtopics.length === 0) continue;
    
    const subtopicsToStudy = selectedSubtopics.map(({ subtopic, index }) => {
      const estimatedTime = calculateSubtopicTime(
        dayInfo.availableHours,
        selectedSubtopics.length,
        topic
      );
      
    return {
        index,
        title: subtopic,
        estimatedTime,
        priority: getPriorityLevel(index, topic, topicData.urgencyLevel),
        reason: getEnhancedReason(subtopic, topicData, context)
      };
    });
    
    const totalTopicTime = subtopicsToStudy.reduce((sum, s) => sum + s.estimatedTime, 0);
    totalMinutesAvailable -= totalTopicTime;
    
    // Generate optimized time slots
    const timeSlots = generateOptimizedTimeSlots(subtopicsToStudy, dayInfo, config);
    
    suggestions.push({
      topicId: topic.id,
      topicTitle: topic.title,
      subtopics: subtopicsToStudy,
      timeSlots
    });
  }
  
  return {
    date,
    totalAvailableHours: dayInfo.availableHours,
    suggestions,
    tips: [
      ...getContextualTips(context, weekNumber),
      ...getDaySpecificTips(dayInfo, weekNumber),
      ...getProgressTips(context)
    ]
  };
}

// Get prioritized topics based on AI analysis
function getPrioritizedTopics(
  context: AISchedulingContext,
  currentWeek: number,
  availableHours: number
): Array<{topicId: string; urgencyLevel: string; priority: number}> {
  const prioritizedTopics: Array<{topicId: string; urgencyLevel: string; priority: number}> = [];
  
  // Calculate priority scores for all topics
  context.topicCoverage.forEach(coverage => {
    let priority = 0;
    
    // Urgency multiplier
    switch (coverage.urgencyLevel) {
      case 'critical': priority += 100; break;
      case 'high': priority += 75; break;
      case 'medium': priority += 50; break;
      case 'low': priority += 25; break;
    }
    
    // Week proximity bonus
    const weekDistance = Math.abs(coverage.weekNumber - currentWeek);
    priority += Math.max(0, 25 - weekDistance * 5);
    
    // Completion penalty (prioritize incomplete topics)
    priority += (100 - coverage.completionPercentage) * 0.5;
    
    // Behind schedule penalty
    if (!coverage.isOnTrack) {
      priority += 30;
    }
    
    prioritizedTopics.push({
      topicId: coverage.topicId,
      urgencyLevel: coverage.urgencyLevel,
      priority
    });
  });
  
  // Sort by priority and return top topics that fit available time
  return prioritizedTopics
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.max(1, Math.floor(availableHours / 2))); // Max 1 topic per 2 hours
}

// Select optimal subtopics based on time and urgency
function selectOptimalSubtopics(
  incompleteSubtopics: Array<{subtopic: string; index: number}>,
  availableMinutes: number,
  urgencyLevel: string,
  availableHours: number
): Array<{subtopic: string; index: number}> {
  const maxSubtopics = getMaxSubtopicsPerDay(availableHours);
  
  // For critical topics, prioritize more subtopics
  const adjustedMax = urgencyLevel === 'critical' 
    ? Math.min(maxSubtopics + 2, incompleteSubtopics.length)
    : maxSubtopics;
  
  // Select first incomplete subtopics (sequential learning)
  return incompleteSubtopics.slice(0, adjustedMax);
}

// Enhanced reason generation based on AI context
function getEnhancedReason(
  subtopic: string,
  topicData: {topicId: string; urgencyLevel: string},
  context: AISchedulingContext
): string {
  const baseReasons = {
    critical: [
      "🚨 Critical topic - significantly behind schedule",
      "⏰ Urgent completion required to stay on track",
      "🎯 Essential for upcoming week's foundation"
    ],
    high: [
      "⚡ High priority - needed for timely completion",
      "🔥 Important for maintaining study momentum",
      "📈 Key concept for upcoming topics"
    ],
    medium: [
      "📚 Scheduled for this week's focus",
      "🎓 Building foundation for advanced concepts",
      "✅ Progressing through planned curriculum"
    ],
    low: [
      "📖 Completing topic systematically",
      "🧠 Reinforcing fundamental concepts",
      "📝 Maintaining consistent progress"
    ]
  };
  
  const reasons = baseReasons[topicData.urgencyLevel as keyof typeof baseReasons] || baseReasons.medium;
  const selectedReason = reasons[Math.floor(Math.random() * reasons.length)];
  
  // Add context-specific information
  const weekInfo = context.currentWeek <= 30 
    ? ` (Week ${context.currentWeek}/30)`
    : '';
  
  return `${selectedReason}${weekInfo}`;
}

// Enhanced roadmap suggestions with AI prioritization
async function enhanceRoadmapSuggestions(
  dailyPlan: any,
  currentTopics: Topic[],
  completedSubtopics: Record<string, number[]>,
  context: AISchedulingContext,
  dayInfo: DayInfo,
  config: ScheduleConfig
): Promise<DailyStudySuggestion['suggestions']> {
  const suggestions: DailyStudySuggestion['suggestions'] = [];
  
  // Check if we need to prioritize urgent topics over planned topics
  const urgentTopicsForToday = context.urgentTopics.slice(0, 2); // Max 2 urgent topics per day
  
  if (urgentTopicsForToday.length > 0) {
    // Prioritize urgent topics
    for (const urgentTopicId of urgentTopicsForToday) {
      const urgentTopic = cppRoadmap.flatMap(w => w.topics).find(t => t.id === urgentTopicId);
      if (!urgentTopic) continue;
      
      const completed = completedSubtopics[urgentTopic.id] || [];
      const incompleteSubtopics = urgentTopic.subtopics
        .map((subtopic, index) => ({ subtopic, index }))
        .filter(({ index }) => !completed.includes(index))
        .slice(0, 2); // Max 2 subtopics per urgent topic
      
      if (incompleteSubtopics.length === 0) continue;
      
      const subtopicsToStudy = incompleteSubtopics.map(({ subtopic, index }) => ({
        index,
        title: subtopic,
        estimatedTime: Math.floor(dayInfo.availableHours * 30), // 30 min per urgent subtopic
        priority: 'high' as const,
        reason: `🚨 Urgent: Behind schedule for ${urgentTopic.title}`
      }));
      
      suggestions.push({
        topicId: urgentTopic.id,
        topicTitle: `🚨 ${urgentTopic.title} (Urgent)`,
        subtopics: subtopicsToStudy,
        timeSlots: generateOptimizedTimeSlots(subtopicsToStudy, dayInfo, config)
      });
    }
  }
  
  // Add planned topics if there's remaining time
  if (suggestions.length === 0 || dayInfo.availableHours > 4) {
    const plannedSuggestion = {
      topicId: currentTopics[0]?.id || `week-${context.currentWeek}`,
      topicTitle: dailyPlan.topic,
      subtopics: dailyPlan.subtopics.map((subtopic: any, index: number) => ({
        index,
        title: subtopic.title,
        estimatedTime: subtopic.estimatedTime,
        priority: subtopic.priority as 'high' | 'medium' | 'low',
        reason: getReasonForSubtopic(subtopic.title, subtopic.priority)
      })),
      timeSlots: generateTimeSlots(dailyPlan.subtopics, dayInfo, config)
    };
    
    suggestions.push(plannedSuggestion);
  }
  
  return suggestions;
}

// Generate intelligent fallback suggestions
function generateIntelligentFallbackSuggestions(
  request: DailyStudyRequest,
  context: AISchedulingContext
): DailyStudySuggestion {
  const { date, dayInfo, currentTopics, completedSubtopics } = request;
  
  // Use AI context to select best topics
  const prioritizedTopics = getPrioritizedTopics(context, context.currentWeek, dayInfo.availableHours);
        const suggestions: DailyStudySuggestion['suggestions'] = [];
        
  let totalMinutesAvailable = dayInfo.availableHours * 60;
  
  // Smart algorithm: Pick incomplete subtopics with AI priority
  for (const topicData of prioritizedTopics) {
    if (totalMinutesAvailable <= 0) break;
    
    const topic = cppRoadmap.flatMap(w => w.topics).find(t => t.id === topicData.topicId);
    if (!topic) continue;
    
          const completed = completedSubtopics[topic.id] || [];
          const incompleteSubtopics = topic.subtopics
            .map((subtopic, index) => ({ subtopic, index }))
            .filter(({ index }) => !completed.includes(index))
      .slice(0, getMaxSubtopicsPerDay(dayInfo.availableHours));
    
    if (incompleteSubtopics.length === 0) continue;
    
    const subtopicsToStudy = incompleteSubtopics.map(({ subtopic, index }) => {
      const estimatedTime = calculateSubtopicTime(dayInfo.availableHours, incompleteSubtopics.length, topic);
      const priority = getPriorityLevel(index, topic, topicData.urgencyLevel);
      
      return {
              index,
              title: subtopic,
        estimatedTime,
        priority,
        reason: getEnhancedReason(subtopic, topicData, context)
      };
    });
    
    const totalTopicTime = subtopicsToStudy.reduce((sum, s) => sum + s.estimatedTime, 0);
    totalMinutesAvailable -= totalTopicTime;
            
            suggestions.push({
              topicId: topic.id,
              topicTitle: topic.title,
              subtopics: subtopicsToStudy,
      timeSlots: generateOptimizedTimeSlots(subtopicsToStudy, dayInfo, request.config)
    });
  }
  
  // If no prioritized topics, fall back to current week topics
  if (suggestions.length === 0) {
    const fallbackTopic = currentTopics[0];
    if (fallbackTopic) {
      const completed = completedSubtopics[fallbackTopic.id] || [];
      const incompleteSubtopics = fallbackTopic.subtopics
        .map((subtopic, index) => ({ subtopic, index }))
        .filter(({ index }) => !completed.includes(index))
        .slice(0, 1);
      
      if (incompleteSubtopics.length > 0) {
        const { subtopic, index } = incompleteSubtopics[0];
        
        suggestions.push({
          topicId: fallbackTopic.id,
          topicTitle: fallbackTopic.title,
          subtopics: [{
            index,
            title: subtopic,
            estimatedTime: Math.min(90, dayInfo.availableHours * 60),
            priority: 'medium' as const,
            reason: 'Continuing with current week\'s topic'
          }],
          timeSlots: [{
            start: '09:00',
            end: '10:30',
            activity: `Study: ${subtopic}`
          }]
        });
      }
          }
        }
        
        return {
          date,
          totalAvailableHours: dayInfo.availableHours,
          suggestions,
    tips: [
      ...getContextualTips(context, context.currentWeek),
      ...getDaySpecificTips(dayInfo, context.currentWeek),
      ...getProgressTips(context)
    ]
  };
}

// Generate optimized time slots based on AI analysis
function generateOptimizedTimeSlots(
  subtopics: any[],
  dayInfo: DayInfo,
  config: ScheduleConfig
): any[] {
  const timeSlots = [];
  const availableSlots = calculateTimeSlots(dayInfo, config);
  
  let currentSlotIndex = 0;
  let currentTime = availableSlots[0]?.start || '09:00';
  
  for (let i = 0; i < subtopics.length; i++) {
    const subtopic = subtopics[i];
    
    // Check if we need to move to next time slot
    if (currentSlotIndex < availableSlots.length - 1) {
      const currentSlotEnd = availableSlots[currentSlotIndex].end;
      const projectedEnd = addMinutesToTime(currentTime, subtopic.estimatedTime);
      
      if (timeToMinutes(projectedEnd) > timeToMinutes(currentSlotEnd)) {
        currentSlotIndex++;
        currentTime = availableSlots[currentSlotIndex]?.start || currentTime;
      }
    }
    
    const startTime = currentTime;
    const endTime = addMinutesToTime(startTime, subtopic.estimatedTime);
    
    timeSlots.push({
      start: startTime,
      end: endTime,
      activity: `Study: ${subtopic.title}`
    });
    
    // Add intelligent break scheduling
    if (i < subtopics.length - 1) {
      const breakDuration = subtopic.estimatedTime > 60 ? 15 : 10;
      const breakStart = endTime;
      const breakEnd = addMinutesToTime(breakStart, breakDuration);
      
      timeSlots.push({
        start: breakStart,
        end: breakEnd,
        activity: 'Break'
      });
      
      currentTime = breakEnd;
    }
  }
  
  return timeSlots;
}

// Get contextual tips based on AI analysis
function getContextualTips(context: AISchedulingContext, weekNumber: number): string[] {
  const tips: string[] = [];
  
  // Progress-based tips
  if (context.urgentTopics.length > 0) {
    tips.push(`🚨 ${context.urgentTopics.length} topic(s) need urgent attention`);
  }
  
  const onTrackTopics = context.topicCoverage.filter(t => t.isOnTrack).length;
  const totalTopics = context.topicCoverage.length;
  const onTrackPercentage = (onTrackTopics / totalTopics) * 100;
  
  if (onTrackPercentage >= 80) {
    tips.push("✅ Great progress! You're on track with most topics");
  } else if (onTrackPercentage >= 60) {
    tips.push("⚡ Good progress, but focus on catching up with lagging topics");
  } else {
    tips.push("🎯 Need to accelerate - prioritize incomplete topics");
  }
  
  // Week-specific tips
  const weeksRemaining = 30 - weekNumber;
  if (weeksRemaining <= 5) {
    tips.push("🏃‍♂️ Final stretch! Focus on revision and mock tests");
  } else if (weeksRemaining <= 10) {
    tips.push("⏰ Time to intensify - prioritize weak areas");
  }
  
  return tips;
}

// Get progress-specific tips
function getProgressTips(context: AISchedulingContext): string[] {
  const tips: string[] = [];
  
  const criticalTopics = context.topicCoverage.filter(t => t.urgencyLevel === 'critical').length;
  const highPriorityTopics = context.topicCoverage.filter(t => t.urgencyLevel === 'high').length;
  
  if (criticalTopics > 0) {
    tips.push(`🚨 ${criticalTopics} critical topic(s) need immediate attention`);
  }
  
  if (highPriorityTopics > 0) {
    tips.push(`⚡ ${highPriorityTopics} high-priority topic(s) require focus`);
  }
  
  // Completion rate tip
  const completionRate = (context.completedTopics.length / context.topicCoverage.length) * 100;
  if (completionRate < 50) {
    tips.push("📈 Increase daily study time to meet completion goals");
  }
  
  return tips;
}

// Enhanced priority level calculation
function getPriorityLevel(
  index: number,
  topic: Topic,
  urgencyLevel?: string
): 'high' | 'medium' | 'low' {
  // Override with urgency level
  if (urgencyLevel === 'critical') return 'high';
  if (urgencyLevel === 'high') return 'high';
  
  // First subtopics are usually more important
  if (index === 0) return 'high';
  if (index <= 2) return 'medium';
  
  // Topic-specific priority
  if (topic.id.includes('programming') || topic.id.includes('algorithm')) {
    return index <= 3 ? 'high' : 'medium';
  }
  
  return 'low';
}

function getReasonForSubtopic(subtopicTitle: string, priority: string): string {
  const reasons = {
    high: [
      "Fundamental concept essential for understanding advanced topics",
      "Frequently asked in technical interviews",
      "Core building block for programming skills",
      "Critical for problem-solving abilities"
    ],
    medium: [
      "Important concept that builds on fundamentals",
      "Useful for solving complex problems",
      "Enhances programming proficiency",
      "Good preparation for advanced topics"
    ],
    low: [
      "Completes understanding of the topic",
      "Useful for comprehensive knowledge",
      "Good for interview preparation",
      "Rounds out programming skills"
    ]
  };
  
  const priorityReasons = reasons[priority as keyof typeof reasons] || reasons.medium;
  return priorityReasons[Math.floor(Math.random() * priorityReasons.length)];
}

function calculateTimeSlots(dayInfo: DayInfo, config: ScheduleConfig): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  
  switch (dayInfo.type) {
    case 'weekend':
    case 'holiday':
      // Full day available with proper breaks
      slots.push(
        { start: '09:00', end: '12:00' },
        { start: '14:00', end: '17:00' },
        { start: '19:00', end: '21:00' }
      );
      break;
    
    case 'college':
      if (dayInfo.isLabDay) {
        // Limited time - evening only
        slots.push({ start: '17:30', end: '19:30' });
      } else {
        // Morning and evening slots
        slots.push(
          { start: '07:00', end: '09:30' },
          { start: '17:00', end: '20:00' }
        );
      }
      break;
    
    case 'lab':
      // Evening study time
      slots.push({ start: '17:30', end: '19:30' });
      break;
    
    case 'exam':
      // Light study only
      slots.push({ start: '18:00', end: '19:00' });
      break;
    
    default:
      // Default flexible time
      slots.push({ start: '09:00', end: '12:00' });
  }
  
  return slots;
}

function generateTimeSlots(subtopics: any[], dayInfo: DayInfo, config: ScheduleConfig): any[] {
  const timeSlots = [];
  const availableSlots = calculateTimeSlots(dayInfo, config);
  
  let currentSlotIndex = 0;
  let currentTime = availableSlots[0]?.start || '09:00';
  
  for (let i = 0; i < subtopics.length; i++) {
    const subtopic = subtopics[i];
    
    // Check if we need to move to next time slot
    if (currentSlotIndex < availableSlots.length - 1) {
      const currentSlotEnd = availableSlots[currentSlotIndex].end;
      const projectedEnd = addMinutesToTime(currentTime, subtopic.estimatedTime);
      
      if (timeToMinutes(projectedEnd) > timeToMinutes(currentSlotEnd)) {
        currentSlotIndex++;
        currentTime = availableSlots[currentSlotIndex]?.start || currentTime;
      }
    }
    
    const startTime = currentTime;
    const endTime = addMinutesToTime(startTime, subtopic.estimatedTime);
    
    timeSlots.push({
      start: startTime,
      end: endTime,
      activity: `Study: ${subtopic.title}`
    });
    
    // Add break if not the last subtopic
    if (i < subtopics.length - 1) {
      const breakDuration = subtopic.estimatedTime > 60 ? 15 : 10;
      const breakStart = endTime;
      const breakEnd = addMinutesToTime(breakStart, breakDuration);
      
      timeSlots.push({
        start: breakStart,
        end: breakEnd,
        activity: 'Break'
      });
      
      currentTime = breakEnd;
    }
  }
  
  return timeSlots;
}

function getMaxSubtopicsPerDay(availableHours: number): number {
  if (availableHours >= 8) return 6;
  if (availableHours >= 6) return 4;
  if (availableHours >= 4) return 3;
  if (availableHours >= 2) return 2;
  return 1;
}

function calculateSubtopicTime(availableHours: number, subtopicCount: number, topic: Topic): number {
  const baseTime = Math.floor((availableHours * 60) / subtopicCount);
  
  // Adjust based on topic type
  if (topic.id.includes('programming') || topic.id.includes('cpp')) {
    return Math.min(120, baseTime); // More time for programming topics
  }
  if (topic.id.includes('algorithm') || topic.id.includes('data-structures')) {
    return Math.min(90, baseTime); // Moderate time for algorithms
  }
  if (topic.id.includes('aptitude') || topic.id.includes('reasoning')) {
    return Math.min(60, baseTime); // Less time for aptitude
  }
  
  return Math.min(90, baseTime);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function getDaySpecificTips(dayInfo: DayInfo, weekNumber: number): string[] {
  const tips = [];
  
  // Week-based tips
  if (weekNumber <= 4) {
    tips.push("Focus on understanding programming fundamentals thoroughly");
  } else if (weekNumber <= 8) {
    tips.push("Practice implementing data structures from scratch");
  } else if (weekNumber <= 12) {
    tips.push("Master object-oriented programming concepts");
  } else if (weekNumber <= 16) {
    tips.push("Implement and practice data structure operations");
  } else if (weekNumber <= 20) {
    tips.push("Solve algorithmic problems to build problem-solving skills");
  } else if (weekNumber <= 24) {
    tips.push("Understand system concepts and their applications");
  } else if (weekNumber <= 27) {
    tips.push("Practice aptitude questions with time constraints");
  } else {
    tips.push("Focus on mock tests and interview preparation");
  }
  
  // Day-specific tips
  switch (dayInfo.type) {
    case 'weekend':
    case 'holiday':
      tips.push(
        "Take advantage of extended time for complex topics",
        "Include practical coding exercises",
        "Review previous week's concepts"
      );
      break;
    case 'college':
      if (dayInfo.isLabDay) {
        tips.push(
          "Focus on quick revision and light topics",
          "Use short breaks for concept review"
        );
      } else {
        tips.push(
          "Morning: Study new concepts when mind is fresh",
          "Evening: Practice problems and revision"
        );
      }
      break;
    case 'exam':
      tips.push(
        "Light study only - avoid stressful topics",
        "Quick revision of familiar concepts"
      );
      break;
    default:
      tips.push("Maintain consistent study schedule");
  }
  
  return tips;
} 