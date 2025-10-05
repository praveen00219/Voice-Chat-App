# Setup Guide - Voice-Enabled Chatbot

This guide will walk you through setting up the voice-enabled chatbot application step by step.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup](#quick-setup)
3. [Detailed Setup](#detailed-setup)
4. [Getting API Keys](#getting-api-keys)
5. [Troubleshooting](#troubleshooting)
6. [Testing](#testing)

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/)

### Optional
- **OpenAI API Key** - [Get Free Credits](https://platform.openai.com/signup)
- **Groq API Key** - [Free Sign Up](https://console.groq.com/)

## Quick Setup

### For Windows Users

1. **Open Command Prompt or PowerShell as Administrator**

2. **Navigate to project directory:**
```cmd
cd path\to\voice-app
```

3. **Setup Backend:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
notepad .env
```

4. **Setup Frontend (in new terminal):**
```cmd
cd path\to\voice-app\frontend
npm install
copy .env.local.example .env.local
```

5. **Start Backend:**
```cmd
cd path\to\voice-app\backend
venv\Scripts\activate
python main.py
```

6. **Start Frontend (in new terminal):**
```cmd
cd path\to\voice-app\frontend
npm run dev
```

7. **Open browser:** http://localhost:3000

### For macOS/Linux Users

1. **Open Terminal**

2. **Navigate to project directory:**
```bash
cd path/to/voice-app
```

3. **Setup Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
nano .env  # or use your preferred editor
```

4. **Setup Frontend (in new terminal):**
```bash
cd path/to/voice-app/frontend
npm install
cp .env.local.example .env.local
```

5. **Start Backend:**
```bash
cd path/to/voice-app/backend
source venv/bin/activate
python main.py
```

6. **Start Frontend (in new terminal):**
```bash
cd path/to/voice-app/frontend
npm run dev
```

7. **Open browser:** http://localhost:3000

## Detailed Setup

### Step 1: Backend Setup

#### 1.1 Create Virtual Environment

**Windows:**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal.

#### 1.2 Install Dependencies

```bash
pip install -r requirements.txt
```

If you encounter PyAudio installation issues:

**Windows:**
```cmd
pip install pipwin
pipwin install pyaudio
```

**macOS:**
```bash
brew install portaudio
pip install pyaudio
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install portaudio19-dev python3-pyaudio
pip install pyaudio
```

#### 1.3 Configure Environment

Create `.env` file in the `backend` directory:

```bash
# Copy template
cp .env.example .env

# Edit with your preferred editor
nano .env  # or vim, code, notepad, etc.
```

Add your API key (choose one option):

**Option A: OpenAI (Best Quality)**
```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
USE_GROQ=false
```

**Option B: Groq (Free & Fast)**
```env
USE_GROQ=true
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

**Option C: No API Key (Demo Mode)**
```env
# Leave both empty - app will run in fallback mode
OPENAI_API_KEY=
USE_GROQ=false
GROQ_API_KEY=
```

### Step 2: Frontend Setup

#### 2.1 Install Dependencies

```bash
cd frontend
npm install
```

If you encounter issues, try:
```bash
npm install --legacy-peer-deps
```

#### 2.2 Configure Environment

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Step 3: Running the Application

#### 3.1 Start Backend Server

**Terminal 1:**
```bash
cd backend
# Activate virtual environment first
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

#### 3.2 Start Frontend Server

**Terminal 2:**
```bash
cd frontend
npm run dev
```

You should see:
```
  ▲ Next.js 14.2.5
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

#### 3.3 Access Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Getting API Keys

### OpenAI API Key (Recommended)

1. Go to https://platform.openai.com/signup
2. Create an account or sign in
3. Navigate to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-`)
6. Add to `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

**Pricing:** $5 free credits for new accounts, then pay-as-you-go (~$0.002 per request)

### Groq API Key (Free Alternative)

1. Go to https://console.groq.com/
2. Create an account (sign up with Google/GitHub)
3. Navigate to https://console.groq.com/keys
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)
6. Add to `backend/.env`:
   ```env
   USE_GROQ=true
   GROQ_API_KEY=gsk_your-key-here
   ```

**Pricing:** Free tier with rate limits (perfect for development)

## Troubleshooting

### Microphone Not Working

**Issue:** Browser not detecting microphone

**Solutions:**
1. Grant microphone permissions in browser
2. Check system microphone settings
3. Try using HTTPS (some browsers require it)
4. Restart browser after granting permissions

### Backend Errors

**Issue:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Make sure virtual environment is activated
pip install -r requirements.txt
```

**Issue:** `Could not understand audio`

**Solutions:**
1. Speak more clearly and slowly
2. Record for at least 2-3 seconds
3. Reduce background noise
4. Check microphone input level
5. Try different audio format

**Issue:** `Port 8000 already in use`

**Solution:**
```bash
# Find and kill process using port 8000
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9

# Or change port in backend/.env:
PORT=8001
```

### Frontend Errors

**Issue:** `ECONNREFUSED` or `Network Error`

**Solutions:**
1. Ensure backend is running on port 8000
2. Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
3. Disable firewall temporarily
4. Check CORS settings in backend

**Issue:** `Module not found` errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

**Issue:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**
Backend should already have CORS configured. If issue persists:
1. Restart backend server
2. Clear browser cache
3. Try different browser

## Testing

### Test Backend

1. **Health Check:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "stt": "operational",
    "llm": "operational",
    "tts": "operational"
  }
}
```

2. **API Documentation:**

Visit http://localhost:8000/docs for interactive API documentation.

### Test Frontend

1. **Open Application:**
   - Navigate to http://localhost:3000
   - Should see voice chatbot interface

2. **Test Voice Recording:**
   - Click microphone button
   - Grant microphone permission
   - Speak clearly: "Hello, how are you?"
   - Click to stop recording
   - Wait for response

3. **Check Console:**
   - Open browser DevTools (F12)
   - Look for any errors in Console
   - Check Network tab for API calls

## Next Steps

1. **Customize UI:** Edit `frontend/components/VoiceChatbot.tsx`
2. **Add Features:** Modify backend logic in `backend/main.py`
3. **Deploy:** See main README for deployment instructions
4. **Secure:** Add authentication, rate limiting, etc.

## Getting Help

- Check the main [README.md](./README.md)
- Review [backend/README.md](./backend/README.md)
- Open an issue on GitHub
- Check API documentation at http://localhost:8000/docs

## Success Checklist

- [ ] Backend running without errors
- [ ] Frontend accessible at http://localhost:3000
- [ ] Microphone permissions granted
- [ ] Can record audio successfully
- [ ] Receives transcript of speech
- [ ] Gets AI response
- [ ] Hears audio playback

If all boxes are checked, congratulations! 🎉 Your voice chatbot is working!

