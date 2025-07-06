-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Study Plans table
CREATE TABLE study_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress tracking table (for topics and subtopics)
CREATE TABLE progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  subtopic_index INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(study_plan_id, topic_id, subtopic_index)
);

-- Study sessions table
CREATE TABLE study_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  topic_id TEXT NOT NULL,
  subtopic_indices INTEGER[],
  planned_hours DECIMAL(3,1) NOT NULL,
  actual_hours DECIMAL(3,1),
  completed BOOLEAN DEFAULT FALSE,
  ai_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(study_plan_id, date, topic_id)
);

-- Constraints table
CREATE TABLE constraints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(study_plan_id, date)
);

-- Create indexes
CREATE INDEX idx_progress_study_plan ON progress(study_plan_id);
CREATE INDEX idx_progress_topic ON progress(topic_id);
CREATE INDEX idx_sessions_study_plan ON study_sessions(study_plan_id);
CREATE INDEX idx_sessions_date ON study_sessions(date);
CREATE INDEX idx_constraints_study_plan ON constraints(study_plan_id);
CREATE INDEX idx_constraints_date ON constraints(date);

-- Row Level Security
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;

-- Policies (adjust based on your auth strategy)
CREATE POLICY "Users can view their own study plans" ON study_plans
  FOR ALL USING (true); -- Adjust based on auth

CREATE POLICY "Users can view their own progress" ON progress
  FOR ALL USING (true); -- Adjust based on auth

CREATE POLICY "Users can view their own sessions" ON study_sessions
  FOR ALL USING (true); -- Adjust based on auth

CREATE POLICY "Users can view their own constraints" ON constraints
  FOR ALL USING (true); -- Adjust based on auth 