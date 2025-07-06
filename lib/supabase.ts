import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only create Supabase client if both URL and key are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface DBStudyPlan {
  id: string;
  user_id: string;
  config: any;
  created_at: string;
  updated_at: string;
}

export interface DBProgress {
  id: string;
  study_plan_id: string;
  topic_id: string;
  subtopic_index?: number;
  completed: boolean;
  completed_at?: string;
  notes?: string;
}

export interface DBStudySession {
  id: string;
  study_plan_id: string;
  date: string;
  topic_id: string;
  subtopic_indices?: number[];
  planned_hours: number;
  actual_hours?: number;
  completed: boolean;
  ai_suggestions?: any;
}

export interface DBConstraint {
  id: string;
  study_plan_id: string;
  date: string;
  type: string;
  description?: string;
} 