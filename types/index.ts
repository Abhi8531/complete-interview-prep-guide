export type DayType = 'college' | 'holiday' | 'lab' | 'exam' | 'available' | 'weekend';

export interface DayConstraint {
  date: string; // ISO date string
  type: DayType;
  description?: string;
}

export interface DayInfo {
  date: Date;
  dateString: string;
  dayOfWeek: number;
  type: DayType;
  availableHours: number;
  isLabDay: boolean;
  constraint?: DayConstraint;
}

export interface SubtopicProgress {
  subtopicIndex: number;
  completed: boolean;
  completedAt?: string;
}

export interface TopicProgress {
  topicId: string;
  completed: boolean;
  completedAt?: string;
  subtopicsProgress: SubtopicProgress[];
}

export interface StudySession {
  id: string;
  date: string;
  topicId: string;
  subtopicIndices?: number[];
  plannedHours: number;
  actualHours?: number;
  completed: boolean;
  notes?: string;
  aiSuggestions?: DailyStudySuggestion;
}

export interface DailyStudySuggestion {
  date: string;
  totalAvailableHours: number;
  suggestions: {
    topicId: string;
    topicTitle: string;
    subtopics: {
      index: number;
      title: string;
      estimatedTime: number; // in minutes
      priority: 'high' | 'medium' | 'low';
      reason: string;
    }[];
    timeSlots: {
      start: string; // e.g., "09:00"
      end: string; // e.g., "10:30"
      activity: string;
    }[];
  }[];
  tips: string[];
}

export interface UserProgress {
  completedTopics: string[];
  topicsProgress: Record<string, TopicProgress>;
  currentWeek: number;
  totalHoursStudied: number;
  totalProblemsSolved: number;
  lastUpdated: string;
}

export interface ScheduleConfig {
  startDate: string; // 2025-07-06
  endDate: string; // 2026-01-31
  collegeHours: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday: { start: string; end: string };
  };
  defaultLabDays: string[]; // ['tuesday', 'thursday']
  constraints: DayConstraint[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  config: ScheduleConfig;
  progress: UserProgress;
  sessions: StudySession[];
  createdAt: string;
  updatedAt: string;
} 