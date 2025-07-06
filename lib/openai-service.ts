import OpenAI from 'openai';
import { DayInfo, ScheduledTopic, generateDayInfos, calculateStudyStats } from './schedule-utils';
import { cppRoadmap, Topic } from '@/data/roadmap';
import { ScheduleConfig, DayConstraint } from '@/types';

// Initialize OpenAI client (API key should be set in environment variable)
const openai = process.env.NEXT_PUBLIC_OPENAI_API_KEY 
  ? new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // For demo purposes - in production, use API routes
    })
  : null;

export interface ScheduleGenerationRequest {
  config: ScheduleConfig;
  completedTopics: string[];
  currentProgress: number;
}

export interface ScheduledTopic {
  topic: Topic;
  weekNumber: number;
  startDate: string;
  endDate: string;
  allocatedHours: number;
  daysAllocated: string[];
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  completionPercentage?: number;
}

export interface ScheduleGenerationResponse {
  scheduledTopics: ScheduledTopic[];
  recommendations: string[];
  adjustments: string[];
  completionGuarantee?: {
    allTopicsCovered: boolean;
    expectedCompletionDate: string;
    riskFactors: string[];
    mitigationStrategies: string[];
  };
}

export interface TopicAnalysis {
  topicId: string;
  weekNumber: number;
  totalSubtopics: number;
  completedSubtopics: number;
  completionPercentage: number;
  isOnTrack: boolean;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  daysRemaining: number;
  estimatedCompletionDate: string;
}

export async function generateIntelligentSchedule(
  request: ScheduleGenerationRequest
): Promise<ScheduleGenerationResponse> {
  const { config, completedTopics } = request;
  
  console.log('Starting enhanced schedule generation with comprehensive topic analysis:', {
    completedTopics: completedTopics.length,
    constraints: config.constraints.length,
    labDays: config.defaultLabDays.length
  });
  
  // Generate day information based on current config
  const days = generateDayInfos(config.startDate, config.endDate, config);
  const stats = calculateStudyStats(days);
  
  // Get all topics from roadmap with detailed analysis
  const allTopics = cppRoadmap.flatMap(week => 
    week.topics.map(topic => ({
      ...topic,
      weekNumber: week.weekNumber
    }))
  );
  
  // Analyze topic completion status
  const topicAnalysis = analyzeTopicProgress(allTopics, completedTopics, config);
  
  // Filter remaining topics that need attention
  const remainingTopics = allTopics.filter(topic => {
    const analysis = topicAnalysis.find(a => a.topicId === topic.id);
    return analysis && analysis.completionPercentage < 100;
  });
  
  console.log('Topic analysis complete:', {
    totalTopics: allTopics.length,
    remainingTopics: remainingTopics.length,
    urgentTopics: topicAnalysis.filter(a => a.urgencyLevel === 'critical' || a.urgencyLevel === 'high').length
  });
  
  // Calculate total hours needed for remaining topics
  const totalHoursNeeded = remainingTopics.reduce((sum, topic) => sum + topic.estimatedHours, 0);
  
  // Try to use server-side API route first for AI optimization
  try {
    console.log('Attempting AI-powered schedule generation...');
    
    const response = await fetch('/api/generate-schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config,
        completedTopics,
        totalHoursNeeded,
        totalAvailableHours: stats.totalAvailableHours,
        remainingTopics,
        constraints: config.constraints,
        labDays: config.defaultLabDays,
        topicAnalysis,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('AI schedule generation successful');
        
        const aiResponse = result.data;
        
        // Create scheduled topics based on AI recommendations
        const topicMap = new Map(remainingTopics.map(t => [t.id, t]));
        const orderedTopics = aiResponse.topicOrder
          .map((id: string) => topicMap.get(id))
          .filter((t: Topic | undefined): t is Topic => t !== undefined);
        
        // Distribute topics across available days with AI priority
        const scheduledTopics = distributeTopicsWithIntelligentPriority(
          days,
          orderedTopics,
          topicAnalysis,
          aiResponse.priorityGroups
        );
        
        // Generate comprehensive completion guarantee
        const completionGuarantee = generateCompletionGuarantee(
          scheduledTopics,
          days,
          topicAnalysis,
          config
        );
        
        // Generate enhanced recommendations
        const enhancedRecommendations = [
          ...aiResponse.recommendations,
          generateProgressRecommendation(completedTopics.length, allTopics.length),
          generateTimeRecommendation(totalHoursNeeded, stats.totalAvailableHours),
          generateCoverageRecommendation(topicAnalysis),
        ];
        
        const enhancedAdjustments = [
          ...aiResponse.adjustments,
          generateConstraintAdjustment(config.constraints.length),
          generateLabDayAdjustment(config.defaultLabDays.length),
          generateUrgencyAdjustment(topicAnalysis),
        ];
        
        return {
          scheduledTopics,
          recommendations: enhancedRecommendations,
          adjustments: enhancedAdjustments,
          completionGuarantee,
        };
      }
    }
  } catch (error) {
    console.log('AI API not available, using enhanced fallback algorithm');
  }
  
  // Enhanced fallback with intelligent prioritization
  return generateEnhancedIntelligentFallbackSchedule(
    days,
    remainingTopics,
    config,
    completedTopics,
    topicAnalysis
  );
}

// Analyze topic progress and urgency
function analyzeTopicProgress(
  allTopics: Array<Topic & {weekNumber: number}>,
  completedTopics: string[],
  config: ScheduleConfig
): TopicAnalysis[] {
  const currentDate = new Date();
  const startDate = new Date(config.startDate);
  const endDate = new Date(config.endDate);
  const currentWeek = Math.ceil((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  return allTopics.map(topic => {
    const isCompleted = completedTopics.includes(topic.id);
    const completionPercentage = isCompleted ? 100 : 0; // Could be enhanced with subtopic data
    
    // Determine if topic is on track
    const expectedProgressByNow = topic.weekNumber <= currentWeek ? 100 : 0;
    const isOnTrack = completionPercentage >= expectedProgressByNow * 0.8; // 80% threshold
    
    // Calculate urgency level
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (topic.weekNumber <= currentWeek) {
      // Past or current week topics
      if (completionPercentage < 50) urgencyLevel = 'critical';
      else if (completionPercentage < 80) urgencyLevel = 'high';
      else if (completionPercentage < 100) urgencyLevel = 'medium';
    } else if (topic.weekNumber === currentWeek + 1) {
      // Next week topics
      if (completionPercentage < 20) urgencyLevel = 'medium';
    } else if (topic.weekNumber <= currentWeek + 2) {
      // Near future topics
      urgencyLevel = 'low';
    }
    
    // Calculate days remaining
    const topicEndDate = new Date(startDate.getTime() + (topic.weekNumber * 7 * 24 * 60 * 60 * 1000));
    const daysRemaining = Math.max(0, Math.ceil((topicEndDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)));
    
    return {
      topicId: topic.id,
      weekNumber: topic.weekNumber,
      totalSubtopics: topic.subtopics.length,
      completedSubtopics: isCompleted ? topic.subtopics.length : 0,
      completionPercentage,
      isOnTrack,
      urgencyLevel,
      daysRemaining,
      estimatedCompletionDate: topicEndDate.toISOString().split('T')[0]
    };
  });
}

// Distribute topics with intelligent priority based on analysis
function distributeTopicsWithIntelligentPriority(
  days: DayInfo[],
  topics: Array<Topic & {weekNumber: number}>,
  topicAnalysis: TopicAnalysis[],
  priorityGroups?: any
): ScheduledTopic[] {
  const scheduledTopics: ScheduledTopic[] = [];
  let currentDayIndex = 0;
  
  // Sort topics by intelligent priority
  const sortedTopics = [...topics].sort((a, b) => {
    const aAnalysis = topicAnalysis.find(ta => ta.topicId === a.id);
    const bAnalysis = topicAnalysis.find(ta => ta.topicId === b.id);
    
    if (!aAnalysis || !bAnalysis) return 0;
    
    // Priority scoring system
    const getScore = (analysis: TopicAnalysis) => {
      let score = 0;
      
      // Urgency multiplier
      switch (analysis.urgencyLevel) {
        case 'critical': score += 1000; break;
        case 'high': score += 750; break;
        case 'medium': score += 500; break;
        case 'low': score += 250; break;
      }
      
      // Week proximity bonus (prioritize current and near weeks)
      const currentWeek = Math.ceil((new Date().getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      const weekDistance = Math.abs(analysis.weekNumber - currentWeek);
      score += Math.max(0, 100 - weekDistance * 10);
      
      // Completion penalty (prioritize incomplete topics)
      score += (100 - analysis.completionPercentage) * 2;
      
      // Behind schedule penalty
      if (!analysis.isOnTrack) {
        score += 200;
      }
      
      return score;
    };
    
    return getScore(bAnalysis) - getScore(aAnalysis);
  });
  
  // Distribute topics across available days
  sortedTopics.forEach(topic => {
    const analysis = topicAnalysis.find(ta => ta.topicId === topic.id);
    const requiredHours = topic.estimatedHours;
    let remainingHours = requiredHours;
    const allocatedDays: string[] = [];
    let startDate = '';
    
    // Prioritize high-value study days for critical topics
    const isCritical = analysis?.urgencyLevel === 'critical' || analysis?.urgencyLevel === 'high';
    
    while (remainingHours > 0 && currentDayIndex < days.length) {
      const day = days[currentDayIndex];
      
      // Skip low-value days for critical topics if possible
      if (isCritical && day.availableHours < 3 && currentDayIndex < days.length - 30) {
        currentDayIndex++;
        continue;
      }
      
      if (day.availableHours > 0) {
        const hoursToAllocate = Math.min(remainingHours, day.availableHours);
        
        if (!startDate) {
          startDate = day.dateString;
        }
        
        allocatedDays.push(day.dateString);
        remainingHours -= hoursToAllocate;
      }
      
      currentDayIndex++;
    }
    
    const endDate = allocatedDays[allocatedDays.length - 1] || startDate;
    
    scheduledTopics.push({
      topic,
      weekNumber: topic.weekNumber,
      startDate,
      endDate,
      allocatedHours: requiredHours - remainingHours,
      daysAllocated: allocatedDays,
      urgencyLevel: analysis?.urgencyLevel || 'low',
      completionPercentage: analysis?.completionPercentage || 0,
    });
  });
  
  return scheduledTopics;
}

// Generate completion guarantee analysis
function generateCompletionGuarantee(
  scheduledTopics: ScheduledTopic[],
  days: DayInfo[],
  topicAnalysis: TopicAnalysis[],
  config: ScheduleConfig
): ScheduleGenerationResponse['completionGuarantee'] {
  const totalHoursNeeded = scheduledTopics.reduce((sum, st) => sum + st.topic.estimatedHours, 0);
  const totalHoursAllocated = scheduledTopics.reduce((sum, st) => sum + st.allocatedHours, 0);
  const stats = calculateStudyStats(days);
  
  const allTopicsCovered = totalHoursAllocated >= totalHoursNeeded * 0.95; // 95% threshold
  
  // Calculate expected completion date
  const lastScheduledDate = scheduledTopics.reduce((latest, st) => {
    return st.endDate > latest ? st.endDate : latest;
  }, config.startDate);
  
  // Identify risk factors
  const riskFactors: string[] = [];
  const mitigationStrategies: string[] = [];
  
  if (totalHoursNeeded > stats.totalAvailableHours) {
    riskFactors.push('⚠️ Total study hours needed exceed available time');
    mitigationStrategies.push('📈 Increase daily study hours or extend timeline');
  }
  
  const criticalTopics = topicAnalysis.filter(ta => ta.urgencyLevel === 'critical').length;
  if (criticalTopics > 0) {
    riskFactors.push(`🚨 ${criticalTopics} critical topic(s) behind schedule`);
    mitigationStrategies.push('⚡ Prioritize critical topics in daily study plans');
  }
  
  const constraintDays = config.constraints.filter(c => c.type === 'exam' || c.type === 'holiday').length;
  if (constraintDays > 20) {
    riskFactors.push('📅 High number of constraint days may impact schedule');
    mitigationStrategies.push('🎯 Optimize remaining study days for maximum efficiency');
  }
  
  if (allTopicsCovered) {
    mitigationStrategies.push('✅ Current schedule ensures all topics will be covered');
    mitigationStrategies.push('📊 Maintain consistent daily progress to stay on track');
  } else {
    mitigationStrategies.push('⏰ Consider extending study timeline or increasing daily hours');
    mitigationStrategies.push('🎯 Focus on high-priority topics first');
  }
  
  return {
    allTopicsCovered,
    expectedCompletionDate: lastScheduledDate,
    riskFactors,
    mitigationStrategies
  };
}

// Enhanced fallback schedule generation
function generateEnhancedIntelligentFallbackSchedule(
  days: DayInfo[],
  topics: Array<Topic & {weekNumber: number}>,
  config: ScheduleConfig,
  completedTopics: string[],
  topicAnalysis: TopicAnalysis[]
): ScheduleGenerationResponse {
  console.log('Generating enhanced intelligent fallback schedule');
  
  // Distribute topics with intelligent priority
  const scheduledTopics = distributeTopicsWithIntelligentPriority(
    days,
    topics,
    topicAnalysis
  );
  
  const stats = calculateStudyStats(days);
  const totalHoursNeeded = topics.reduce((sum, t) => sum + t.estimatedHours, 0);
  
  // Generate completion guarantee
  const completionGuarantee = generateCompletionGuarantee(
    scheduledTopics,
    days,
    topicAnalysis,
    config
  );
  
  // Generate intelligent recommendations
  const recommendations = [
    generateProgressRecommendation(completedTopics.length, topics.length + completedTopics.length),
    generateTimeRecommendation(totalHoursNeeded, stats.totalAvailableHours),
    generateCoverageRecommendation(topicAnalysis),
    '🎯 Schedule optimized with intelligent topic prioritization',
    '📈 Focus on urgent topics to maintain timeline'
  ];
  
  const adjustments = [
    generateConstraintAdjustment(config.constraints.length),
    generateLabDayAdjustment(config.defaultLabDays.length),
    generateUrgencyAdjustment(topicAnalysis),
    generateTimeAdjustment(totalHoursNeeded, stats.totalAvailableHours),
    '💡 Add OpenAI API key for AI-powered schedule optimization'
  ];
  
  return {
    scheduledTopics,
    recommendations,
    adjustments,
    completionGuarantee,
  };
}

// Helper functions for generating specific recommendations
export function generateProgressRecommendation(completed: number, total: number): string {
  const percentage = Math.round((completed / total) * 100);
  if (percentage >= 80) return `✅ Excellent progress! ${percentage}% topics completed`;
  if (percentage >= 60) return `📈 Good progress: ${percentage}% completed, keep it up!`;
  if (percentage >= 40) return `⚡ Steady progress: ${percentage}% done, maintain momentum`;
  if (percentage >= 20) return `🎯 Building momentum: ${percentage}% completed, stay focused`;
  return `🚀 Starting strong: ${percentage}% completed, great beginning!`;
}

export function generateTimeRecommendation(needed: number, available: number): string {
  const ratio = needed / available;
  if (ratio <= 0.8) return `⏰ Time allocation looks good: ${needed}h needed vs ${available}h available`;
  if (ratio <= 1.0) return `⚡ Tight schedule: ${needed}h needed vs ${available}h available - stay focused`;
  return `🚨 Time challenge: ${needed}h needed vs ${available}h available - consider optimization`;
}

export function generateCoverageRecommendation(topicAnalysis: TopicAnalysis[]): string {
  const onTrackTopics = topicAnalysis.filter(ta => ta.isOnTrack).length;
  const totalTopics = topicAnalysis.length;
  const percentage = Math.round((onTrackTopics / totalTopics) * 100);
  
  if (percentage >= 90) return `🎯 Excellent coverage: ${percentage}% of topics on track`;
  if (percentage >= 70) return `📊 Good coverage: ${percentage}% on track, focus on lagging topics`;
  if (percentage >= 50) return `⚡ Moderate coverage: ${percentage}% on track, need acceleration`;
  return `🚨 Coverage needs attention: ${percentage}% on track, prioritize urgent topics`;
}

export function generateConstraintAdjustment(constraintCount: number): string {
  if (constraintCount === 0) return '📅 No constraints - maximum flexibility for scheduling';
  if (constraintCount <= 5) return `📋 ${constraintCount} constraint(s) - minimal impact on schedule`;
  if (constraintCount <= 15) return `⚠️ ${constraintCount} constraint(s) - moderate schedule adjustments needed`;
  return `🚨 ${constraintCount} constraint(s) - significant schedule optimization required`;
}

export function generateLabDayAdjustment(labDayCount: number): string {
  if (labDayCount === 0) return '🎓 No lab days - full study time available on college days';
  if (labDayCount <= 2) return `🔬 ${labDayCount} lab day(s) per week - schedule adjusted for limited time`;
  return `⚗️ ${labDayCount} lab day(s) per week - significant time optimization needed`;
}

export function generateUrgencyAdjustment(topicAnalysis: TopicAnalysis[]): string {
  const criticalCount = topicAnalysis.filter(ta => ta.urgencyLevel === 'critical').length;
  const highCount = topicAnalysis.filter(ta => ta.urgencyLevel === 'high').length;
  
  if (criticalCount === 0 && highCount === 0) return '✅ No urgent topics - maintaining steady progress';
  if (criticalCount === 0) return `⚡ ${highCount} high-priority topic(s) - focus needed`;
  return `🚨 ${criticalCount} critical + ${highCount} high-priority topic(s) - immediate attention required`;
}

export function generateTimeAdjustment(needed: number, available: number): string {
  const efficiency = (needed / available) * 100;
  if (efficiency <= 70) return '⏰ Schedule has good time buffer for flexibility';
  if (efficiency <= 90) return '⚡ Schedule is well-optimized with minimal buffer';
  if (efficiency <= 100) return '🎯 Schedule is tightly packed - maintain consistency';
  return '🚨 Schedule exceeds available time - optimization critical';
}

function getPriorityScore(topicId: string, priorityGroups: any): number {
  if (priorityGroups?.critical?.includes(topicId)) return 3;
  if (priorityGroups?.high?.includes(topicId)) return 2;
  if (priorityGroups?.medium?.includes(topicId)) return 1;
  return 0;
} 