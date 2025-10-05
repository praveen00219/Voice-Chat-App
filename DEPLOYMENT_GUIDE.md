# 🚀 Voice Chatbot Deployment Guide: Netlify + Render

This guide will help you deploy your voice-enabled chatbot application for **FREE** using:
- **Frontend (Next.js)**: Netlify
- **Backend (FastAPI)**: Render

## 📋 Prerequisites

1. GitHub account (for hosting your code)
2. Netlify account (free)
3. Render account (free)
4. Your project code pushed to GitHub

## 🎯 Free Tier Limits

### Netlify (Frontend)
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Automatic deployments from Git
- ✅ Custom domains
- ✅ SSL certificates

### Render (Backend)
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512MB RAM
- ✅ Automatic deployments from Git
- ✅ Custom domains
- ✅ SSL certificates

---

## 🔧 Phase 1: Prepare Your Repository

### Step 1: Push to GitHub
```bash
# If not already done, initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit - Voice Chatbot App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/voice-app.git
git push -u origin main
```

### Step 2: Create Environment Variables File
Create `backend/.env` (don't commit this):
```env
OPENAI_API_KEY=your_openai_api_key_here
USE_GROQ=false
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_ORIGIN=https://your-app-name.netlify.app
PORT=8000
```

---

## 🌐 Phase 2: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `voice-app` repository

### Step 3: Configure Backend Service
**Basic Settings:**
- **Name**: `voice-chatbot-backend`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Advanced Settings:**
- **Auto-Deploy**: `Yes`
- **Plan**: `Free`

### Step 4: Set Environment Variables in Render
In your Render dashboard, go to **Environment** tab and add:
```
OPENAI_API_KEY=your_actual_openai_key
USE_GROQ=false
GROQ_API_KEY=your_groq_key_if_using
PORT=8000
FRONTEND_ORIGIN=https://your-app-name.netlify.app
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://voice-chatbot-backend.onrender.com`

---

## 🎨 Phase 3: Deploy Frontend to Netlify

### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Site
1. Click **"New site from Git"**
2. Choose **GitHub**
3. Select your `voice-app` repository

### Step 3: Configure Frontend Build
**Build Settings:**
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/.next`
- **Node version**: `18` (in Environment variables)

### Step 4: Set Environment Variables in Netlify
In Site settings → Environment variables, add:
```
NEXT_PUBLIC_BACKEND_URL=https://voice-chatbot-backend.onrender.com
```

### Step 5: Deploy
1. Click **"Deploy site"**
2. Wait for build (2-5 minutes)
3. Note your frontend URL: `https://your-app-name.netlify.app`

---

## 🔗 Phase 4: Connect Frontend and Backend

### Step 1: Update Backend CORS
Your backend already has CORS configured, but let's ensure it works with Netlify:

The backend will automatically allow your Netlify domain once deployed.

### Step 2: Update Frontend Configuration
Your frontend will use the environment variable `NEXT_PUBLIC_BACKEND_URL` to connect to the backend.

### Step 3: Test the Connection
1. Visit your Netlify URL
2. Try recording a voice message
3. Check browser console for any errors
4. Check Render logs for backend errors

---

## 🔧 Phase 5: Custom Domain (Optional)

### For Netlify (Frontend)
1. Go to Site settings → Domain management
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate will be automatically provisioned

### For Render (Backend)
1. Go to your service settings
2. Add custom domain
3. Update DNS records
4. Update `FRONTEND_ORIGIN` environment variable

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Backend Not Starting
**Symptoms**: Render shows "Deploy failed"
**Solutions**:
- Check `requirements.txt` for all dependencies
- Verify `main.py` syntax
- Check Render logs for specific errors

#### 2. Frontend Build Failing
**Symptoms**: Netlify shows build errors
**Solutions**:
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors
- Verify Node.js version compatibility

#### 3. CORS Errors
**Symptoms**: Browser shows CORS policy errors
**Solutions**:
- Verify `FRONTEND_ORIGIN` in backend environment
- Check that frontend URL matches exactly
- Ensure backend is running and accessible

#### 4. Audio Not Working
**Symptoms**: Microphone not responding
**Solutions**:
- Ensure site is served over HTTPS (required for microphone access)
- Check browser permissions for microphone
- Verify audio recording in browser console

#### 5. Slow Response Times
**Symptoms**: Long delays in voice processing
**Solutions**:
- This is normal on free tiers due to cold starts
- Consider upgrading to paid plans for better performance
- Implement loading states in frontend

---

## 📊 Monitoring & Maintenance

### Render Monitoring
- Check service logs regularly
- Monitor resource usage
- Set up email alerts for downtime

### Netlify Monitoring
- Monitor build status
- Check bandwidth usage
- Review form submissions (if any)

### Performance Optimization
1. **Backend**: Implement caching for frequent queries
2. **Frontend**: Optimize bundle size
3. **Database**: Use connection pooling (when you add a database)

---

## 💰 Cost Breakdown (Free Tier)

### Netlify
- **Cost**: $0/month
- **Limits**: 100GB bandwidth, 300 build minutes
- **Suitable for**: Most personal/small business projects

### Render
- **Cost**: $0/month
- **Limits**: 750 hours/month (31 days × 24 hours = 744 hours)
- **Note**: Service sleeps after 15 minutes of inactivity (cold start ~30 seconds)

---

## 🎉 Success Checklist

- [ ] Backend deployed and accessible at Render URL
- [ ] Frontend deployed and accessible at Netlify URL
- [ ] Voice recording works in browser
- [ ] Speech-to-text conversion works
- [ ] LLM responses are generated
- [ ] Text-to-speech audio plays
- [ ] No CORS errors in browser console
- [ ] Custom domain configured (optional)

---

## 🔄 Updates & Redeployment

### Automatic Deployments
Both platforms will automatically redeploy when you push changes to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Update voice chatbot"
git push origin main
# Both Netlify and Render will automatically redeploy
```

### Manual Redeployments
- **Netlify**: Go to Deploys tab → Trigger deploy
- **Render**: Go to Deployments tab → Manual deploy

---

## 📞 Support Resources

### Netlify
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)

### Render
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

### Your Application
- Check logs in both platforms for debugging
- Test locally before deploying changes
- Use browser developer tools for frontend debugging

---

**🎊 Congratulations!** Your voice-enabled chatbot is now live on the internet with a professional setup, custom domain support, and automatic deployments!
