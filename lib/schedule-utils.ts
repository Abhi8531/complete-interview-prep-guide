import { DayConstraint, DayType, ScheduleConfig } from '@/types';
import { addDays, format, isWeekend, getDay, differenceInDays, startOfDay, isSameDay } from 'date-fns';
import { cppRoadmap, Topic } from '@/data/roadmap';

export interface DayInfo {
  date: Date;
  dateString: string;
  dayOfWeek: number;
  type: DayType;
  availableHours: number;
  isLabDay: boolean;
  constraint?: DayConstraint;
}

export function getDayType(date: Date, config: ScheduleConfig): DayType {
  const dateString = format(date, 'yyyy-MM-dd');
  
  // Check for explicit constraints
  const constraint = config.constraints.find(c => c.date === dateString);
  if (constraint) return constraint.type;
  
  // Check if weekend
  if (isWeekend(date)) return 'weekend';
  
  // Check if it's a lab day
  const dayName = format(date, 'EEEE').toLowerCase();
  if (config.defaultLabDays.includes(dayName)) return 'lab';
  
  // Default to college day
  return 'college';
}

export function getAvailableHours(dayInfo: DayInfo): number {
  switch (dayInfo.type) {
    case 'holiday':
    case 'weekend':
      return 8; // Full day available
    case 'college':
      return dayInfo.isLabDay ? 2 : 5; // 2 hours if lab day, 5 hours otherwise
    case 'lab':
      return 2; // Only 2 hours available on lab days
    case 'exam':
      return 0; // No study time during exams
    case 'available':
      return 8; // Full day available
    default:
      return 0;
  }
}

export function generateDayInfos(startDate: string, endDate: string, config: ScheduleConfig): DayInfo[] {
  const days: DayInfo[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = differenceInDays(end, start) + 1;
  
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    const dayName = format(date, 'EEEE').toLowerCase();
    const type = getDayType(date, config);
    const isLabDay = config.defaultLabDays.includes(dayName) && type === 'college';
    
    const dayInfo: DayInfo = {
      date,
      dateString,
      dayOfWeek,
      type,
      isLabDay,
      availableHours: 0,
      constraint: config.constraints.find(c => c.date === dateString),
    };
    
    dayInfo.availableHours = getAvailableHours(dayInfo);
    days.push(dayInfo);
  }
  
  return days;
}

export interface ScheduledTopic {
  topic: Topic;
  weekNumber: number;
  startDate: string;
  endDate: string;
  allocatedHours: number;
  daysAllocated: string[];
}

export function distributeTopicsAcrossDays(
  days: DayInfo[],
  topics: Topic[],
  weekNumbers: number[]
): ScheduledTopic[] {
  const scheduledTopics: ScheduledTopic[] = [];
  let currentDayIndex = 0;
  
  topics.forEach((topic, index) => {
    const weekNumber = weekNumbers[index];
    const requiredHours = topic.estimatedHours;
    let remainingHours = requiredHours;
    const allocatedDays: string[] = [];
    let startDate = '';
    
    // Find available days for this topic
    while (remainingHours > 0 && currentDayIndex < days.length) {
      const day = days[currentDayIndex];
      
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
      weekNumber,
      startDate,
      endDate,
      allocatedHours: requiredHours - remainingHours,
      daysAllocated: allocatedDays,
    });
  });
  
  return scheduledTopics;
}

export function calculateStudyStats(days: DayInfo[]) {
  const totalAvailableHours = days.reduce((sum, day) => sum + day.availableHours, 0);
  const totalDays = days.length;
  const studyDays = days.filter(day => day.availableHours > 0).length;
  const examDays = days.filter(day => day.type === 'exam').length;
  const holidays = days.filter(day => day.type === 'holiday').length;
  const weekends = days.filter(day => day.type === 'weekend').length;
  
  return {
    totalAvailableHours,
    totalDays,
    studyDays,
    examDays,
    holidays,
    weekends,
    averageHoursPerDay: totalAvailableHours / studyDays,
  };
}

export function getWeeklySchedule(scheduledTopics: ScheduledTopic[]): Map<number, ScheduledTopic[]> {
  const weeklyMap = new Map<number, ScheduledTopic[]>();
  
  scheduledTopics.forEach(scheduled => {
    const week = scheduled.weekNumber;
    if (!weeklyMap.has(week)) {
      weeklyMap.set(week, []);
    }
    weeklyMap.get(week)!.push(scheduled);
  });
  
  return weeklyMap;
}

export function getCurrentWeekNumber(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysDiff = differenceInDays(today, start);
  return Math.floor(daysDiff / 7) + 1;
}

export function getProgressPercentage(completedTopics: string[], allTopics: Topic[]): number {
  return Math.round((completedTopics.length / allTopics.length) * 100);
} 