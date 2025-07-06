# Supabase Setup Guide

This guide will help you set up Supabase for persistent data storage across devices.

## 🚀 Quick Setup

### Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New project"
5. Fill in:
   - Project name: `cpp-interview-prep`
   - Database password: (generate a strong password)
   - Region: (choose closest to you)
6. Click "Create new project"

### Step 2: Get Your API Keys

1. Once project is created, go to Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

### Step 3: Create Database Tables

1. Go to SQL Editor in Supabase dashboard
2. Click "New query"
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run"

### Step 4: Update Your .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

## 📊 Database Schema

The app uses these tables:

### study_plans

- Stores main configuration and settings
- One plan per user

### progress

- Tracks completion of topics and subtopics
- Links to study_plans

### study_sessions

- Stores daily study suggestions from AI
- Tracks planned vs actual hours

### constraints

- Stores holidays, exam periods, etc.
- Links to study_plans

## 🔐 Security

By default, Row Level Security (RLS) is enabled but policies are permissive. For production:

1. Enable authentication in Supabase
2. Update RLS policies to check user IDs
3. Implement proper user authentication

## 🧪 Testing Database Connection

1. Start your app: `npm run dev`
2. Open browser console (F12)
3. Check for any Supabase errors
4. Try marking a topic complete - it should persist
5. Refresh the page - progress should remain

## 🔄 Data Sync Features

With Supabase configured:

- ✅ Progress syncs across devices
- ✅ Constraints persist between sessions
- ✅ Study plans accessible from anywhere
- ✅ Real-time updates (if multiple tabs open)

## 🚨 Troubleshooting

### "Invalid API Key" Error

- Double-check your .env.local file
- Ensure no extra spaces in keys
- Restart dev server after changing .env.local

### "Table not found" Error

- Run the schema.sql in SQL Editor
- Check if tables were created in Table Editor

### Data Not Persisting

- Check browser console for errors
- Verify Supabase URL is correct
- Ensure RLS policies allow access

## 🎯 Optional: Local Development

For offline development without Supabase:

1. Comment out Supabase keys in .env.local
2. App will use local state (won't persist)
3. Re-enable when ready to sync

## 📱 Multi-Device Setup

To access from multiple devices:

1. Deploy to Vercel (see main README)
2. Use same Supabase project
3. Access from any device with internet
4. Progress syncs automatically!

## 🔮 Future Enhancements

Consider adding:

- User authentication
- Multiple study plans per user
- Sharing progress with mentors
- Export/import functionality
