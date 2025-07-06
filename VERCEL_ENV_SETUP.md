# 🔧 Vercel Environment Variables Setup Guide

## Complete Interview Prep Platform - Environment Variables Configuration

This guide shows you **exactly** how to add environment variables to your Vercel deployment.

## 🚀 Quick Fix for Deployment Error

If you're getting the error:

```
Environment Variable "NEXT_PUBLIC_OPENAI_API_KEY" references Secret "openai_api_key", which does not exist.
```

**✅ This has been fixed!** The `vercel.json` file has been updated to remove the secret references.

## 📝 Environment Variables Setup

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel project dashboard**

   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your deployed project

2. **Navigate to Settings**

   - Click on the "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Add Variables One by One**

   **For OpenAI Integration (Optional):**

   ```
   Name: NEXT_PUBLIC_OPENAI_API_KEY
   Value: sk-your-actual-openai-api-key-here
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   **For Supabase Integration (Optional):**

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project.supabase.co
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

   ```
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your-supabase-anon-key
   Environments: ✅ Production ✅ Preview ✅ Development
   ```

4. **Save and Redeploy**
   - Click "Save" for each variable
   - Go to "Deployments" tab
   - Click "Redeploy" on the latest deployment

### Option 2: Via Vercel CLI

1. **Install and Login**

   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Navigate to your project directory**

   ```bash
   cd complete-interview-prep-guide
   ```

3. **Add Environment Variables**

   ```bash
   # Add OpenAI API Key (optional)
   vercel env add NEXT_PUBLIC_OPENAI_API_KEY
   # When prompted, enter your OpenAI API key
   # Select environments: Production, Preview, Development

   # Add Supabase URL (optional)
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # When prompted, enter your Supabase URL

   # Add Supabase Anon Key (optional)
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # When prompted, enter your Supabase anon key
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## 🔑 Getting API Keys

### OpenAI API Key (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### Supabase Keys (Optional)

1. Go to [Supabase](https://supabase.com/)
2. Create a new project or select existing
3. Go to "Settings" → "API"
4. Copy the "Project URL" and "anon public" key

## ✅ Verification

After adding environment variables:

1. **Check in Vercel Dashboard**

   - Go to Settings → Environment Variables
   - Verify all variables are listed
   - Ensure they're enabled for all environments

2. **Test the Deployment**
   - Visit your deployed app
   - Check browser console for any API key related errors
   - Test AI features (if OpenAI key added)
   - Test data sync (if Supabase keys added)

## 🚨 Important Notes

### Required vs Optional

- **✅ The app works perfectly WITHOUT any environment variables**
- **🚀 Environment variables only enable enhanced features:**
  - OpenAI: AI-powered study recommendations
  - Supabase: Cloud data synchronization

### Security Best Practices

- **Never commit API keys to your repository**
- **Use environment variables for all sensitive data**
- **All client-side variables must start with `NEXT_PUBLIC_`**
- **Regenerate keys if accidentally exposed**

### Common Issues & Solutions

**Issue**: Variables not working after deployment
**Solution**:

- Ensure variable names start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check capitalization and spelling

**Issue**: Build failing with environment variable errors
**Solution**:

- Remove any secret references from `vercel.json`
- Add variables through dashboard instead

**Issue**: API features not working
**Solution**:

- Verify API keys are correct and have necessary permissions
- Check browser console for detailed error messages

## 🎯 Expected Behavior

### Without Environment Variables:

- ✅ Full 30-week study roadmap
- ✅ Progress tracking
- ✅ Schedule management
- ✅ Local data storage
- ✅ All core functionality

### With OpenAI API Key:

- ✅ All above features +
- 🤖 AI-powered study recommendations
- 🧠 Intelligent topic prioritization
- 📈 Smart schedule optimization

### With Supabase Keys:

- ✅ All above features +
- ☁️ Cloud data synchronization
- 💾 Cross-device data persistence
- 🔄 Automatic backup

## 🚀 Deploy Now!

Your app is ready to deploy with or without environment variables. The choice is yours!

```bash
# Deploy immediately (works without any environment variables)
vercel --prod

# Or add environment variables first for enhanced features
# Then deploy
```

**Happy coding! 🎉**
