# Project Structure

Complete overview of the Voice-Enabled Chatbot project files and directories.

## Directory Tree

```
voice-app/
├── 📁 frontend/                      # Next.js Frontend Application
│   ├── 📁 app/
│   │   ├── layout.tsx               # Root layout component
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Global styles
│   ├── 📁 components/
│   │   └── VoiceChatbot.tsx         # Main chatbot component
│   ├── package.json                 # Node.js dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── next.config.js               # Next.js configuration
│   ├── tailwind.config.ts           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── .eslintrc.json              # ESLint configuration
│   ├── .gitignore                  # Git ignore rules
│   ├── .env.local.example          # Environment template
│   └── Dockerfile                   # Docker configuration
│
├── 📁 backend/                       # FastAPI Backend Server
│   ├── main.py                      # Main server application
│   ├── requirements.txt             # Python dependencies
│   ├── setup.py                     # Setup helper script
│   ├── .env.example                # Environment template
│   ├── .gitignore                  # Git ignore rules
│   ├── Dockerfile                   # Docker configuration
│   └── README.md                    # Backend documentation
│
├── 📄 README.md                     # Main project documentation
├── 📄 QUICKSTART.md                 # Quick start guide
├── 📄 SETUP_GUIDE.md                # Detailed setup instructions
├── 📄 ARCHITECTURE.md               # Technical architecture docs
├── 📄 PROJECT_STRUCTURE.md          # This file
├── 📄 .gitignore                    # Root git ignore
├── 📄 docker-compose.yml            # Docker Compose configuration
├── 🚀 start.sh                      # Linux/macOS startup script
└── 🚀 start.bat                     # Windows startup script
```

## File Descriptions

### Frontend Files

#### Core Application
- **`app/layout.tsx`**: Root layout with metadata and font configuration
- **`app/page.tsx`**: Main home page that renders the VoiceChatbot component
- **`app/globals.css`**: Global CSS styles with Tailwind directives
- **`components/VoiceChatbot.tsx`**: Main chatbot UI component (500+ lines)
  - Voice recording functionality
  - Chat message display
  - Audio playback
  - State management
  - Error handling

#### Configuration Files
- **`package.json`**: Dependencies and scripts
  - next: 14.2.5
  - react: 18.3.1
  - axios: HTTP client
  - lucide-react: Icons
  - tailwindcss: Styling
  
- **`tsconfig.json`**: TypeScript compiler settings
- **`next.config.js`**: Next.js framework configuration
- **`tailwind.config.ts`**: Tailwind CSS customization
- **`postcss.config.js`**: PostCSS processing
- **`.eslintrc.json`**: Code linting rules

#### Deployment Files
- **`.env.local.example`**: Environment variable template
- **`Dockerfile`**: Container configuration for deployment
- **`.gitignore`**: Files to exclude from version control

### Backend Files

#### Core Application
- **`main.py`**: FastAPI server application (500+ lines)
  - `SpeechToTextService`: Google Speech Recognition integration
  - `LLMService`: OpenAI/Groq API integration
  - `TextToSpeechService`: gTTS integration
  - API endpoints and request handling
  - Error handling and logging
  - CORS configuration

#### Configuration Files
- **`requirements.txt`**: Python dependencies
  - fastapi: Web framework
  - uvicorn: ASGI server
  - SpeechRecognition: STT library
  - gTTS: TTS library
  - openai: LLM client
  - python-multipart: File upload support

- **`setup.py`**: Automated setup script
  - Checks Python version
  - Creates .env file
  - Installs dependencies
  - Validates configuration

#### Deployment Files
- **`.env.example`**: Environment variable template
  - OPENAI_API_KEY
  - USE_GROQ / GROQ_API_KEY
  - PORT
  
- **`Dockerfile`**: Container configuration
- **`.gitignore`**: Python-specific ignore rules
- **`README.md`**: Backend-specific documentation

### Documentation Files

#### User Guides
- **`README.md`**: Main project documentation
  - Features overview
  - Architecture diagram
  - Installation instructions
  - API documentation
  - Troubleshooting guide
  
- **`QUICKSTART.md`**: Fast setup guide (5 minutes)
  - Minimal steps to get started
  - Common commands
  - Basic troubleshooting
  
- **`SETUP_GUIDE.md`**: Detailed setup instructions
  - Step-by-step process
  - Platform-specific instructions
  - API key setup
  - Comprehensive troubleshooting

#### Technical Documentation
- **`ARCHITECTURE.md`**: Technical architecture
  - System design
  - Component details
  - Data flow diagrams
  - Technology stack
  - Security considerations
  - Scalability strategies
  
- **`PROJECT_STRUCTURE.md`**: This file
  - Directory tree
  - File descriptions
  - Module responsibilities

### Utility Files

#### Startup Scripts
- **`start.sh`**: Bash script for Linux/macOS
  - Checks dependencies
  - Starts backend and frontend
  - Handles cleanup on exit
  
- **`start.bat`**: Batch script for Windows
  - Opens separate terminal windows
  - Starts both servers
  - User-friendly output

#### Deployment
- **`docker-compose.yml`**: Multi-container setup
  - Backend service configuration
  - Frontend service configuration
  - Network and volume setup
  - Health checks

#### Version Control
- **`.gitignore`**: Root-level ignore rules
  - Node modules
  - Python cache
  - Environment files
  - Build outputs

## Module Responsibilities

### Frontend Modules

#### VoiceChatbot Component
**Location:** `frontend/components/VoiceChatbot.tsx`

**Responsibilities:**
- 🎤 Audio Recording
  - Request microphone permission
  - Start/stop MediaRecorder
  - Collect audio chunks
  
- 💬 Chat Management
  - Display message history
  - Format timestamps
  - Auto-scroll to latest
  
- 🔊 Audio Playback
  - Decode base64 audio
  - Play AI response
  - Handle playback errors
  
- 📡 API Communication
  - Send audio to backend
  - Receive and parse responses
  - Handle network errors
  
- 🎨 UI State Management
  - Recording status
  - Processing indicators
  - Error messages
  - Loading states

### Backend Modules

#### SpeechToTextService
**Location:** `backend/main.py` (lines ~60-110)

**Responsibilities:**
- 🎙️ Audio transcription
- 📊 Ambient noise adjustment
- 🔧 Audio format conversion
- ❌ Error handling

**Technology:** Google Speech Recognition API

#### LLMService
**Location:** `backend/main.py` (lines ~112-180)

**Responsibilities:**
- 🤖 LLM query handling
- 🔄 Multi-provider support (OpenAI/Groq)
- 💬 Fallback responses
- ⚙️ Model configuration

**Technology:** OpenAI SDK (compatible with Groq)

#### TextToSpeechService
**Location:** `backend/main.py` (lines ~182-220)

**Responsibilities:**
- 🔊 Speech synthesis
- 🎵 Audio format handling
- 📦 Base64 encoding
- ❌ Error recovery

**Technology:** gTTS (Google Text-to-Speech)

## Configuration Management

### Environment Variables

#### Frontend
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

#### Backend
```env
# LLM Configuration
OPENAI_API_KEY=sk-proj-...
USE_GROQ=false
GROQ_API_KEY=gsk_...

# Server
PORT=8000
```

## Code Statistics

### Frontend
- **Total Lines:** ~800
- **TypeScript Files:** 4
- **Components:** 1 main component
- **Dependencies:** 10+

### Backend
- **Total Lines:** ~600
- **Python Files:** 2
- **Services:** 3 core services
- **API Endpoints:** 3
- **Dependencies:** 15+

### Documentation
- **Total Lines:** ~2,000+
- **Markdown Files:** 5
- **Code Examples:** 50+

## Development Workflow

```
1. Edit Code
   ├── Frontend: frontend/components/VoiceChatbot.tsx
   └── Backend: backend/main.py

2. Test Locally
   ├── Run: ./start.sh or start.bat
   └── Visit: http://localhost:3000

3. Build
   ├── Frontend: npm run build
   └── Backend: docker build

4. Deploy
   ├── Frontend: Vercel/Netlify
   └── Backend: Railway/Render/Fly.io
```

## Key Features by File

### VoiceChatbot.tsx
- ✅ Real-time audio recording
- ✅ Beautiful gradient UI
- ✅ Message history with timestamps
- ✅ Error handling with user feedback
- ✅ Processing indicators
- ✅ Responsive design
- ✅ Dark mode support

### main.py
- ✅ RESTful API endpoints
- ✅ Multi-service architecture
- ✅ Comprehensive logging
- ✅ Error handling
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ API documentation (auto-generated)

## Future Additions

Potential new files to add:

- `tests/` - Unit and integration tests
- `docs/` - Additional documentation
- `.github/workflows/` - CI/CD pipelines
- `migrations/` - Database migrations
- `monitoring/` - Monitoring configuration
- `scripts/` - Utility scripts

## Conclusion

This project structure follows industry best practices:
- ✅ Clear separation of concerns
- ✅ Modular architecture
- ✅ Comprehensive documentation
- ✅ Easy deployment
- ✅ Production-ready setup

Total project size: ~1,500 lines of code + 2,000+ lines of documentation.

