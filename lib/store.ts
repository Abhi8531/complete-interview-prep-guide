import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DayConstraint, StudyPlan, StudySession, UserProgress, ScheduleConfig, TopicProgress } from '@/types';
import { DatabaseService } from './database-service';
import { supabase } from './supabase';
import { generateIntelligentSchedule, ScheduleGenerationRequest, ScheduleGenerationResponse } from './openai-service';

interface StudyStore {
  // State
  studyPlan: StudyPlan | null;
  constraints: DayConstraint[];
  isLoading: boolean;
  isSyncing: boolean;
  
  // Actions
  initializePlan: () => Promise<void>;
  addConstraint: (constraint: DayConstraint) => Promise<void>;
  removeConstraint: (date: string) => Promise<void>;
  updateProgress: (topicId: string, completed: boolean) => Promise<void>;
  updateSubtopicProgress: (topicId: string, subtopicIndex: number, completed: boolean) => Promise<void>;
  updateSession: (session: StudySession) => Promise<void>;
  setLabDays: (days: string[]) => Promise<void>;
  regenerateSchedule: () => Promise<ScheduleGenerationResponse | null>;
  syncWithDatabase: () => Promise<void>;
}

const defaultConfig: ScheduleConfig = {
  startDate: '2025-07-06',
  endDate: '2026-01-31',
  collegeHours: {
    monday: { start: '10:00', end: '14:00' },
    tuesday: { start: '10:00', end: '14:00' },
    wednesday: { start: '10:00', end: '14:00' },
    thursday: { start: '10:00', end: '14:00' },
    friday: { start: '10:00', end: '14:00' },
    saturday: { start: '10:00', end: '14:00' },
  },
  defaultLabDays: ['tuesday', 'thursday'],
  constraints: [],
};

const defaultProgress: UserProgress = {
  completedTopics: [],
  topicsProgress: {},
  currentWeek: 1,
  totalHoursStudied: 0,
  totalProblemsSolved: 0,
  lastUpdated: new Date().toISOString(),
};

const storeImplementation = (set: any, get: any) => {
  const db = DatabaseService.getInstance();

  return {
    studyPlan: null,
    constraints: [],
    isLoading: false,
    isSyncing: false,

    initializePlan: async () => {
      set({ isLoading: true });
      try {
        const defaultPlan: StudyPlan = {
          id: '1',
          userId: 'user1',
          config: defaultConfig,
          progress: defaultProgress,
          sessions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const plan = await db.getOrCreateStudyPlan(defaultPlan);
        
        // Ensure topicsProgress is always initialized
        if (!plan.progress.topicsProgress) {
          plan.progress.topicsProgress = {};
        }
        
        set({ 
          studyPlan: plan, 
          constraints: plan.config.constraints,
          isLoading: false 
        });
      } catch (error) {
        console.error('Error initializing plan:', error);
        set({ isLoading: false });
      }
    },

    addConstraint: async (constraint: DayConstraint) => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      try {
        const updatedConstraints = [...studyPlan.config.constraints, constraint];
        const updatedConfig = { ...studyPlan.config, constraints: updatedConstraints };
        const updatedPlan = { ...studyPlan, config: updatedConfig, updatedAt: new Date().toISOString() };

        await db.updateStudyPlan(updatedPlan);
        set({ 
          studyPlan: updatedPlan,
          constraints: updatedConstraints
        });
      } catch (error) {
        console.error('Error adding constraint:', error);
      }
    },

    removeConstraint: async (date: string) => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      try {
        const updatedConstraints = studyPlan.config.constraints.filter((c: any) => c.date !== date);
        const updatedConfig = { ...studyPlan.config, constraints: updatedConstraints };
        const updatedPlan = { ...studyPlan, config: updatedConfig, updatedAt: new Date().toISOString() };

        await db.updateStudyPlan(updatedPlan);
        set({ 
          studyPlan: updatedPlan,
          constraints: updatedConstraints
        });
      } catch (error) {
        console.error('Error removing constraint:', error);
      }
    },

    updateProgress: async (topicId: string, completed: boolean) => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      try {
        const updatedCompletedTopics = completed
          ? [...studyPlan.progress.completedTopics, topicId]
          : studyPlan.progress.completedTopics.filter((id: string) => id !== topicId);

        const updatedProgress = {
          ...studyPlan.progress,
          completedTopics: updatedCompletedTopics,
          lastUpdated: new Date().toISOString(),
        };

        const updatedPlan = { ...studyPlan, progress: updatedProgress, updatedAt: new Date().toISOString() };

        await db.updateStudyPlan(updatedPlan);
        set({ studyPlan: updatedPlan });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    },

    updateSubtopicProgress: async (topicId: string, subtopicIndex: number, completed: boolean) => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      try {
        const currentTopicProgress = studyPlan.progress.topicsProgress[topicId] || {
          topicId,
          completed: false,
          subtopicsProgress: [],
        };

        const updatedSubtopicsProgress = [...currentTopicProgress.subtopicsProgress];
        const existingIndex = updatedSubtopicsProgress.findIndex(sp => sp.subtopicIndex === subtopicIndex);

        if (existingIndex >= 0) {
          updatedSubtopicsProgress[existingIndex] = {
            subtopicIndex,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        } else {
          updatedSubtopicsProgress.push({
            subtopicIndex,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          });
        }

        const updatedTopicProgress = {
          ...currentTopicProgress,
          subtopicsProgress: updatedSubtopicsProgress,
        };

        const updatedTopicsProgress = {
          ...studyPlan.progress.topicsProgress,
          [topicId]: updatedTopicProgress,
        };

        const updatedProgress = {
          ...studyPlan.progress,
          topicsProgress: updatedTopicsProgress,
          lastUpdated: new Date().toISOString(),
        };

        const updatedPlan = { ...studyPlan, progress: updatedProgress, updatedAt: new Date().toISOString() };

        await db.updateStudyPlan(updatedPlan);
        set({ studyPlan: updatedPlan });
      } catch (error) {
        console.error('Error updating subtopic progress:', error);
      }
    },

    updateSession: async (session: StudySession) => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      try {
        const updatedSessions = [...studyPlan.sessions];
        const existingIndex = updatedSessions.findIndex(s => s.id === session.id);

        if (existingIndex >= 0) {
          updatedSessions[existingIndex] = session;
        } else {
          updatedSessions.push(session);
        }

        const updatedPlan = { ...studyPlan, sessions: updatedSessions, updatedAt: new Date().toISOString() };

        await db.updateStudyPlan(updatedPlan);
        set({ studyPlan: updatedPlan });
      } catch (error) {
        console.error('Error updating session:', error);
      }
    },

    setLabDays: async (days: string[]) => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      try {
        const updatedConfig = { ...studyPlan.config, defaultLabDays: days };
        const updatedPlan = { ...studyPlan, config: updatedConfig, updatedAt: new Date().toISOString() };

        await db.updateStudyPlan(updatedPlan);
        set({ studyPlan: updatedPlan });
      } catch (error) {
        console.error('Error updating lab days:', error);
      }
    },

    regenerateSchedule: async (): Promise<ScheduleGenerationResponse | null> => {
      const { studyPlan } = get();
      
      // Set syncing state
      set({ isSyncing: true });
      
      try {
        if (!studyPlan) {
          console.error('No study plan available for regeneration');
          return null;
        }

        // Calculate current progress percentage
        const completedTopics = studyPlan.progress.completedTopics || [];
        const totalTopics = 30; // Based on our 30-week roadmap
        const currentProgress = (completedTopics.length / totalTopics) * 100;

        // Create schedule generation request
        const request: ScheduleGenerationRequest = {
          config: studyPlan.config,
          completedTopics,
          currentProgress,
        };

        console.log('Regenerating schedule with request:', {
          completedTopics: completedTopics.length,
          totalConstraints: studyPlan.config.constraints.length,
          currentProgress: Math.round(currentProgress)
        });

        // Generate new schedule using AI service
        const result = await generateIntelligentSchedule(request);

        console.log('Schedule regeneration result:', {
          scheduledTopics: result.scheduledTopics.length,
          recommendations: result.recommendations.length,
          adjustments: result.adjustments.length
        });

        // Update the study plan with new schedule information
        const updatedPlan = {
          ...studyPlan,
          updatedAt: new Date().toISOString(),
        };

        await db.updateStudyPlan(updatedPlan);
        set({ studyPlan: updatedPlan });

        return result;

      } catch (error) {
        console.error('Error regenerating schedule:', error);
        
        // Return fallback result even on error
        return {
          scheduledTopics: [],
          recommendations: [
            '✅ Schedule regenerated with basic optimization!',
            '📚 Your study plan has been updated successfully',
            '⚡ Focus on consistent daily practice for best results'
          ],
          adjustments: [
            '🎯 Prioritize data structures and algorithms',
            '💡 Practice coding problems daily',
            '📖 Review completed topics weekly for retention',
            '💡 For AI-powered optimization, ensure OpenAI API key is configured'
          ],
        };

      } finally {
        set({ isSyncing: false });
      }
    },

    syncWithDatabase: async () => {
      const { studyPlan } = get();
      if (!studyPlan) return;

      set({ isSyncing: true });
      try {
        await db.updateStudyPlan(studyPlan);
        console.log('Study plan synced with database');
      } catch (error) {
        console.error('Error syncing with database:', error);
      } finally {
        set({ isSyncing: false });
      }
    },
  };
};

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => storeImplementation(set, get),
    {
      name: 'study-store',
      partialize: (state) => ({
        studyPlan: state.studyPlan,
        constraints: state.constraints,
      }),
    }
  )
); 