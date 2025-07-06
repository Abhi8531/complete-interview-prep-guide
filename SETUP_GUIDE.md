# Setup Guide - Complete Interview Prep App

## 🔑 Setting Up Your OpenAI API Key

### Step 1: Get an OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key (it starts with `sk-`)

### Step 2: Create the Environment File

1. In the `cpp-interview-prep` folder, create a new file named `.env.local`
2. Add the following content:

```
# OpenAI API Key for intelligent schedule generation
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here

# Supabase configuration for data persistence
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. Replace the placeholders with your actual keys
4. Save the file

**Note**: The `.env.local` file is already in `.gitignore`, so it won't be committed to git.

## 🚀 Running the App Locally

### Step 1: Install Dependencies

Open a terminal in the `cpp-interview-prep` directory and run:

```bash
npm install
```

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Open the App

Open your browser and go to: http://localhost:3000

## ✅ Testing Checklist

### 1. **Initial Load Test**

- [ ] App loads without errors
- [ ] Dashboard shows with initial stats
- [ ] Calendar displays correctly

### 2. **Navigation Test**

- [ ] Click through all tabs: Overview, Schedule, Topics, Constraints
- [ ] Each tab loads its content properly

### 3. **Schedule Calendar Test**

- [ ] Click on different dates
- [ ] Try adding a constraint (holiday/exam)
- [ ] Verify the day type changes color

### 4. **Topics Test**

- [ ] Expand/collapse weeks
- [ ] Mark some topics as complete
- [ ] Check if progress updates

### 5. **Constraints Test**

- [ ] Add lab days
- [ ] Add holiday constraints
- [ ] Add exam period

### 6. **AI Features Test (with API Key)**

- [ ] Click "Regenerate Schedule" button
- [ ] Check if you get recommendations
- [ ] Verify no errors in console

### 7. **AI Features Test (without API Key)**

- [ ] Remove/comment out the API key
- [ ] Click "Regenerate Schedule"
- [ ] Should still work with fallback logic

## 🐛 Troubleshooting

### Common Issues:

1. **"Module not found" errors**

   ```bash
   npm install
   ```

2. **Port 3000 already in use**

   ```bash
   # Run on different port
   npm run dev -- -p 3001
   ```

3. **OpenAI API errors**

   - Check if your API key is valid
   - Ensure you have credits in your OpenAI account
   - Check the browser console for detailed errors

4. **Blank page or loading issues**
   - Clear browser cache
   - Check browser console for errors
   - Try incognito/private mode

## 📊 What to Expect

### Without OpenAI API Key:

- All features work except AI optimization
- Basic schedule distribution based on available hours
- No personalized recommendations

### With OpenAI API Key:

- Intelligent topic prioritization
- Smart schedule optimization
- Personalized study recommendations
- Better distribution of critical topics

## 🔍 Checking Browser Console

1. Open Developer Tools (F12 or right-click → Inspect)
2. Go to Console tab
3. Look for any red error messages
4. Check Network tab for failed API calls

## 💡 Quick Test Flow

1. **Start the app**
2. **Click on "Topics" tab** → Mark "C++ Fundamentals" as complete
3. **Go to "Constraints" tab** → Add a holiday for next week
4. **Click "Regenerate Schedule"** → See if it works
5. **Go back to "Overview"** → Check if progress updated

If all these work, your app is running perfectly!
