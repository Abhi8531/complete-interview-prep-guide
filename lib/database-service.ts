import { supabase } from './supabase';
import { StudyPlan, DayConstraint, TopicProgress, StudySession } from '@/types';

export class DatabaseService {
  private static instance: DatabaseService;
  private userId: string;

  private constructor() {
    // Generate or get user ID (in production, use proper auth)
    this.userId = this.getOrCreateUserId();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private getOrCreateUserId(): string {
    const stored = localStorage.getItem('cpp_prep_user_id');
    if (stored) return stored;
    
    const newId = crypto.randomUUID();
    localStorage.setItem('cpp_prep_user_id', newId);
    return newId;
  }

  // Study Plan operations
  async getOrCreateStudyPlan(defaultPlan: StudyPlan): Promise<StudyPlan> {
    // If Supabase is not configured, return default plan
    if (!supabase) {
      console.log('Supabase not configured, using local storage only');
      return defaultPlan;
    }

    try {
      // Check if plan exists
      const { data: existing, error: fetchError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (existing) {
        // Load related data
        const plan = await this.loadFullStudyPlan(existing.id);
        return plan;
      }

      // Create new plan
      const { data: newPlan, error: createError } = await supabase
        .from('study_plans')
        .insert({
          user_id: this.userId,
          config: defaultPlan.config,
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        ...defaultPlan,
        id: newPlan.id,
        userId: this.userId,
        createdAt: newPlan.created_at,
        updatedAt: newPlan.updated_at,
      };
    } catch (error) {
      console.error('Error in getOrCreateStudyPlan:', error);
      return defaultPlan; // Fallback to local
    }
  }

  // Update entire study plan
  async updateStudyPlan(studyPlan: StudyPlan): Promise<void> {
    if (!supabase) {
      console.log('Supabase not configured, changes saved locally only');
      return; // Skip if Supabase not configured
    }
    
    try {
      console.log('Updating study plan in database:', {
        id: studyPlan.id,
        userId: studyPlan.userId,
        labDays: studyPlan.config.defaultLabDays,
        constraintsCount: studyPlan.config.constraints.length
      });

      // Update the main study plan record
      const { error: updateError } = await supabase
        .from('study_plans')
        .update({ 
          config: studyPlan.config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studyPlan.id);

      if (updateError) {
        console.error('Error updating study plan:', updateError);
        throw updateError;
      }

      // Update constraints if they exist
      if (studyPlan.config.constraints && studyPlan.config.constraints.length > 0) {
        // First, remove all existing constraints for this plan
        await supabase
          .from('constraints')
          .delete()
          .eq('study_plan_id', studyPlan.id);

        // Then insert the new constraints
        const constraintRecords = studyPlan.config.constraints.map(constraint => ({
          study_plan_id: studyPlan.id,
          date: constraint.date,
          type: constraint.type,
          description: constraint.description,
        }));

        const { error: constraintError } = await supabase
          .from('constraints')
          .insert(constraintRecords);

        if (constraintError) {
          console.error('Error updating constraints:', constraintError);
        }
      }

      console.log('Study plan updated successfully in database');
    } catch (error) {
      console.error('Error updating study plan:', error);
      // Don't throw error to allow graceful degradation
    }
  }

  private async loadFullStudyPlan(planId: string): Promise<StudyPlan> {
    const [planData, progress, sessions, constraints] = await Promise.all([
      supabase.from('study_plans').select('*').eq('id', planId).single(),
      supabase.from('progress').select('*').eq('study_plan_id', planId),
      supabase.from('study_sessions').select('*').eq('study_plan_id', planId),
      supabase.from('constraints').select('*').eq('study_plan_id', planId),
    ]);

    if (planData.error) throw planData.error;

    // Build progress object
    const topicsProgress: Record<string, TopicProgress> = {};
    const completedTopics: string[] = [];

    if (progress.data) {
      progress.data.forEach(p => {
        if (!topicsProgress[p.topic_id]) {
          topicsProgress[p.topic_id] = {
            topicId: p.topic_id,
            completed: false,
            subtopicsProgress: [],
          };
        }

        if (p.subtopic_index !== null) {
          topicsProgress[p.topic_id].subtopicsProgress.push({
            subtopicIndex: p.subtopic_index,
            completed: p.completed,
            completedAt: p.completed_at,
          });
        } else {
          topicsProgress[p.topic_id].completed = p.completed;
          topicsProgress[p.topic_id].completedAt = p.completed_at;
          if (p.completed) completedTopics.push(p.topic_id);
        }
      });
    }

    // Build constraints
    const constraintsList: DayConstraint[] = constraints.data?.map(c => ({
      date: c.date,
      type: c.type,
      description: c.description,
    })) || [];

    // Update config with constraints
    const config = {
      ...planData.data.config,
      constraints: constraintsList,
    };

    return {
      id: planData.data.id,
      userId: planData.data.user_id,
      config,
      progress: {
        completedTopics,
        topicsProgress,
        currentWeek: 1, // Calculate based on dates
        totalHoursStudied: 0, // Calculate from sessions
        totalProblemsSolved: 0,
        lastUpdated: new Date().toISOString(),
      },
      sessions: sessions.data || [],
      createdAt: planData.data.created_at,
      updatedAt: planData.data.updated_at,
    };
  }

  // Progress operations
  async updateTopicProgress(planId: string, topicId: string, completed: boolean): Promise<void> {
    if (!supabase) return; // Skip if Supabase not configured
    
    try {
      await supabase
        .from('progress')
        .upsert({
          study_plan_id: planId,
          topic_id: topicId,
          subtopic_index: null,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });
    } catch (error) {
      console.error('Error updating topic progress:', error);
    }
  }

  async updateSubtopicProgress(
    planId: string, 
    topicId: string, 
    subtopicIndex: number, 
    completed: boolean
  ): Promise<void> {
    if (!supabase) return; // Skip if Supabase not configured
    
    try {
      await supabase
        .from('progress')
        .upsert({
          study_plan_id: planId,
          topic_id: topicId,
          subtopic_index: subtopicIndex,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        });
    } catch (error) {
      console.error('Error updating subtopic progress:', error);
    }
  }

  // Constraint operations
  async addConstraint(planId: string, constraint: DayConstraint): Promise<void> {
    if (!supabase) return; // Skip if Supabase not configured
    
    try {
      await supabase
        .from('constraints')
        .upsert({
          study_plan_id: planId,
          date: constraint.date,
          type: constraint.type,
          description: constraint.description,
        });
    } catch (error) {
      console.error('Error adding constraint:', error);
    }
  }

  async removeConstraint(planId: string, date: string): Promise<void> {
    if (!supabase) return; // Skip if Supabase not configured
    
    try {
      await supabase
        .from('constraints')
        .delete()
        .eq('study_plan_id', planId)
        .eq('date', date);
    } catch (error) {
      console.error('Error removing constraint:', error);
    }
  }

  // Study session operations
  async saveStudySession(planId: string, session: StudySession): Promise<void> {
    if (!supabase) return; // Skip if Supabase not configured
    
    try {
      await supabase
        .from('study_sessions')
        .upsert({
          study_plan_id: planId,
          date: session.date,
          topic_id: session.topicId,
          subtopic_indices: session.subtopicIndices,
          planned_hours: session.plannedHours,
          actual_hours: session.actualHours,
          completed: session.completed,
          ai_suggestions: session.aiSuggestions,
        });
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  }

  async getStudySessionsForDate(planId: string, date: string): Promise<StudySession[]> {
    if (!supabase) return []; // Return empty array if Supabase not configured
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('study_plan_id', planId)
        .eq('date', date);

      if (error) throw error;

      return data.map(s => ({
        id: s.id,
        date: s.date,
        topicId: s.topic_id,
        subtopicIndices: s.subtopic_indices,
        plannedHours: s.planned_hours,
        actualHours: s.actual_hours,
        completed: s.completed,
        notes: s.notes,
        aiSuggestions: s.ai_suggestions,
      }));
    } catch (error) {
      console.error('Error getting study sessions:', error);
      return [];
    }
  }

  // Update study plan config (legacy method - keeping for backward compatibility)
  async updateConfig(planId: string, config: any): Promise<void> {
    if (!supabase) return; // Skip if Supabase not configured
    
    try {
      await supabase
        .from('study_plans')
        .update({ 
          config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  }
} 