# 🚀 Complete Deployment Guide

## Complete Interview Prep - 30 Week AI-Powered Study Plan

This guide will walk you through deploying your Complete Interview Preparation app to production with GitHub, Vercel, and Supabase.

---

## 📋 Prerequisites

Before starting, ensure you have:
- [Git](https://git-scm.com/) installed
- [GitHub](https://github.com) account
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) account
- [OpenAI API Key](https://platform.openai.com/api-keys) (optional, for enhanced AI features)

---

## 🔧 Step 1: Prepare Your Project

### 1.1 Initialize Git Repository

```bash
# Navigate to your project directory
cd cpp-interview-prep

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Complete Interview Prep with AI Study Plans"
```

### 1.2 Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` with your actual values (we'll get these in later steps):
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=your_actual_openai_key
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_key
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   ```

---

## 📱 Step 2: Upload to GitHub

### 2.1 Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `cpp-interview-prep`
   - **Description**: `AI-Powered 30-Week Complete Interview Preparation Study Plan`
   - **Visibility**: Public (recommended) or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### 2.2 Connect Local Repository to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cpp-interview-prep.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2.3 Verify Upload

1. Refresh your GitHub repository page
2. You should see all your project files uploaded
3. Verify that the `.env.local` file is NOT visible (it should be ignored)

---

## 🗄️ Step 3: Set Up Supabase Database

### 3.1 Create Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: `cpp-interview-prep`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

### 3.2 Get Supabase Credentials

1. In your Supabase dashboard, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### 3.3 Set Up Database Schema

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New query"
3. Copy and paste the following schema:

```sql
-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress table
CREATE TABLE IF NOT EXISTS progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    subtopic_index INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(study_plan_id, topic_id, subtopic_index)
);

-- Create constraints table
CREATE TABLE IF NOT EXISTS constraints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('holiday', 'exam', 'college', 'lab', 'weekend', 'available')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(study_plan_id, date)
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    study_plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    topic_id TEXT NOT NULL,
    subtopic_indices INTEGER[],
    planned_hours DECIMAL(4,2),
    actual_hours DECIMAL(4,2),
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    ai_suggestions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_study_plan_id ON progress(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_progress_topic_id ON progress(topic_id);
CREATE INDEX IF NOT EXISTS idx_constraints_study_plan_id ON constraints(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_constraints_date ON constraints(date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_study_plan_id ON study_sessions(study_plan_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);

-- Enable Row Level Security (RLS)
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later)
CREATE POLICY "Allow all operations on study_plans" ON study_plans FOR ALL USING (true);
CREATE POLICY "Allow all operations on progress" ON progress FOR ALL USING (true);
CREATE POLICY "Allow all operations on constraints" ON constraints FOR ALL USING (true);
CREATE POLICY "Allow all operations on study_sessions" ON study_sessions FOR ALL USING (true);
```

4. Click "Run" to execute the schema
5. You should see "Success. No rows returned" message

### 3.4 Verify Database Setup

1. Go to "Table Editor" in Supabase
2. You should see 4 tables: `study_plans`, `progress`, `constraints`, `study_sessions`
3. All tables should be empty initially

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Connect GitHub to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Click "Import Git Repository"
4. If GitHub isn't connected, click "Connect GitHub Account"
5. Find your `cpp-interview-prep` repository and click "Import"

### 4.2 Configure Deployment Settings

1. **Project Name**: `cpp-interview-prep` (or your preferred name)
2. **Framework Preset**: Next.js (should be auto-detected)
3. **Root Directory**: `./` (leave as default)
4. **Build Command**: `npm run build` (leave as default)
5. **Output Directory**: `.next` (leave as default)

### 4.3 Add Environment Variables

In the "Environment Variables" section, add:

```
NEXT_PUBLIC_SUPABASE_URL = [your Supabase project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your Supabase anon key]
NEXT_PUBLIC_OPENAI_API_KEY = [your OpenAI API key] (optional)
```

### 4.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete (2-3 minutes)
3. You'll get a URL like: `https://cpp-interview-prep-xxxxx.vercel.app`

---

## 🔑 Step 5: Get OpenAI API Key (Optional but Recommended)

### 5.1 Create OpenAI Account

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up or sign in
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Copy the key (it starts with `sk-...`)

### 5.2 Add Credits

1. Go to "Billing" section
2. Add payment method
3. Add $5-10 credits (should last months for this app)

### 5.3 Update Environment Variables

1. In Vercel dashboard, go to your project
2. Go to "Settings" → "Environment Variables"
3. Add or update:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY = [your OpenAI API key]
   ```
4. Redeploy your app (go to "Deployments" → "..." → "Redeploy")

---

## ✅ Step 6: Test Your Deployment

### 6.1 Basic Functionality Test

1. Visit your Vercel URL
2. The app should load without errors
3. Try creating a study plan
4. Check if data persists after page refresh

### 6.2 Database Connection Test

1. Mark a few subtopics as complete
2. Refresh the page
3. Verify that your progress is saved
4. Check Supabase dashboard to see data in tables

### 6.3 AI Features Test

1. Generate a daily study plan
2. Try the AI schedule optimization
3. If you have OpenAI key, you should see enhanced AI features
4. Without OpenAI key, smart fallback should work

---

## 🔧 Step 7: Custom Domain (Optional)

### 7.1 Purchase Domain

1. Buy a domain from providers like Namecheap, GoDaddy, etc.
2. Example: `cpp-interview-prep.com`

### 7.2 Configure in Vercel

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 24 hours)

---

## 📊 Step 8: Monitor and Maintain

### 8.1 Set Up Analytics

1. In Vercel dashboard, enable "Analytics"
2. Monitor user engagement and performance
3. Check for errors in "Functions" tab

### 8.2 Database Monitoring

1. In Supabase, monitor "Database" usage
2. Check "Logs" for any errors
3. Set up backup schedules if needed

### 8.3 Regular Updates

```bash
# To update your deployment:
git add .
git commit -m "Update: description of changes"
git push origin main
# Vercel will auto-deploy the changes
```

---

## 🆘 Troubleshooting

### Common Issues:

1. **Build Errors**: Check Vercel function logs
2. **Database Connection**: Verify Supabase credentials
3. **AI Not Working**: Check OpenAI API key and credits
4. **Slow Loading**: Enable Vercel Analytics to identify bottlenecks

### Support Resources:

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 Congratulations!

Your Cmplete Interview Prep app is now live! Share the URL with friends and start your 30-week journey to placement success.

**Your app features:**
- ✅ 30-week structured curriculum
- ✅ AI-powered daily study plans
- ✅ Progress tracking with persistence
- ✅ Smart topic prioritization
- ✅ Completion guarantee system
- ✅ Mobile-responsive design

---

## 📞 Need Help?

If you encounter any issues during deployment, feel free to:
1. Check the troubleshooting section above
2. Review the official documentation links
3. Contact support through the respective platforms

**Happy studying and best of luck with your placements! 🚀** 