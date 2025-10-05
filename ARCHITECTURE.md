# Architecture Documentation

## System Overview

The Voice-Enabled Chatbot is built using a microservices architecture with a clear separation between frontend and backend concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Frontend (Next.js)                       │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Voice UI   │  │  Chat Display │  │ Audio Player │    │ │
│  │  │  Component   │  │   Component   │  │  Component   │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │         │                  ▲                  ▲            │ │
│  │         │                  │                  │            │ │
│  │         └──────────────────┴──────────────────┘            │ │
│  │                            │                                │ │
│  │                      Axios HTTP Client                      │ │
│  └────────────────────────────┼───────────────────────────────┘ │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                       HTTP POST (multipart/form-data)
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                    Backend Server (FastAPI)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     API Endpoint Layer                    │  │
│  │                  /api/voice-chat (POST)                   │  │
│  └────────────┬──────────────────────────────┬────────────────┘  │
│               │                              │                   │
│  ┌────────────▼────────┐      ┌─────────────▼────────┐         │
│  │   Request Handler   │      │  Response Builder    │         │
│  └────────────┬────────┘      └─────────────▲────────┘         │
│               │                              │                   │
│  ┌────────────▼──────────────────────────────┴────────────────┐ │
│  │                    Service Layer                            │ │
│  │                                                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │    Speech    │  │     LLM      │  │    Text      │    │ │
│  │  │   to Text    │  │   Service    │  │  to Speech   │    │ │
│  │  │   Service    │  │              │  │   Service    │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │ │
│  └─────────┼──────────────────┼──────────────────┼──────────┘  │
└────────────┼──────────────────┼──────────────────┼─────────────┘
             │                  │                  │
    ┌────────▼────────┐  ┌─────▼──────┐  ┌────────▼────────┐
    │  Google Speech  │  │  OpenAI    │  │   Google TTS    │
    │  Recognition    │  │    or      │  │     (gTTS)      │
    │      API        │  │   Groq     │  │                 │
    └─────────────────┘  └────────────┘  └─────────────────┘
```

## Component Details

### Frontend Components

#### 1. Next.js Application (`frontend/`)
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (useState, useRef, useEffect)

#### 2. VoiceChatbot Component
**Responsibilities:**
- Audio recording using Web Audio API
- Sending audio to backend
- Displaying chat messages
- Playing audio responses
- Managing UI state

**Key Features:**
- Real-time recording status
- Processing indicators
- Error handling with user-friendly messages
- Auto-scrolling chat interface
- Responsive design

#### 3. Audio Recording System
```typescript
MediaRecorder API → Blob Collection → FormData → HTTP POST
```

**Process:**
1. Request microphone permission
2. Start MediaRecorder
3. Collect audio chunks
4. Create blob on stop
5. Send to backend

### Backend Components

#### 1. FastAPI Application (`backend/main.py`)
- **Framework:** FastAPI
- **Server:** Uvicorn (ASGI)
- **Architecture:** Service-oriented design

#### 2. Service Layer

##### SpeechToTextService
**Technology:** Google Speech Recognition (free)

**Process:**
```python
Audio Bytes → AudioFile → Recognizer → Text Transcript
```

**Features:**
- Ambient noise adjustment
- Dynamic energy threshold
- Multiple audio format support

##### LLMService
**Technology:** OpenAI GPT / Groq API

**Process:**
```python
User Query → System Prompt + User Message → LLM → Response
```

**Features:**
- Multiple provider support (OpenAI, Groq)
- Fallback mode for demo
- Configurable model selection
- Temperature control

##### TextToSpeechService
**Technology:** gTTS (Google Text-to-Speech)

**Process:**
```python
Text → gTTS Engine → MP3 Audio → Base64 Encoding
```

**Features:**
- Language selection
- Accent control
- Speed adjustment
- Buffer-based audio generation

## Data Flow

### Request Flow (Voice Input)

```
1. User clicks microphone button
   └→ Frontend requests microphone permission

2. User speaks
   └→ MediaRecorder captures audio chunks

3. User stops recording
   └→ Audio chunks → Blob creation

4. Frontend sends audio
   └→ FormData with audio file
   └→ POST /api/voice-chat

5. Backend receives audio
   └→ SpeechToTextService.transcribe_audio()
   └→ Returns transcript

6. Backend queries LLM
   └→ LLMService.get_response(transcript)
   └→ Returns AI response

7. Backend generates speech
   └→ TextToSpeechService.synthesize_speech(response)
   └→ Returns MP3 audio

8. Backend sends response
   └→ JSON with transcript, response, and audio_base64

9. Frontend processes response
   └→ Displays messages in chat
   └→ Plays audio response
```

### Response Format

```json
{
  "transcript": "User's spoken text",
  "llm_response": "AI assistant's text response",
  "audio_base64": "base64_encoded_mp3_audio"
}
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with server-side rendering
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests
- **Lucide React**: Icon library
- **Web Audio API**: Browser audio recording

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server for async operations
- **SpeechRecognition**: Python library for STT
- **gTTS**: Google Text-to-Speech library
- **OpenAI SDK**: Official OpenAI/Groq client
- **Pydantic**: Data validation and settings

## API Specification

### POST /api/voice-chat

**Request:**
```
Content-Type: multipart/form-data

audio: <binary audio file>
```

**Response:**
```json
{
  "transcript": "string",
  "llm_response": "string",
  "audio_base64": "string"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad request (invalid audio, empty file)
- `500`: Internal server error

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "services": {
    "stt": "operational",
    "llm": "operational",
    "tts": "operational"
  },
  "config": {
    "llm_provider": "openai|groq|fallback",
    "model": "gpt-3.5-turbo|mixtral-8x7b-32768|fallback"
  }
}
```

## Security Considerations

### Implemented
1. **CORS Configuration**: Controlled cross-origin requests
2. **Environment Variables**: Sensitive data in .env files
3. **Input Validation**: Pydantic models for type checking
4. **Error Handling**: Safe error messages without exposing internals
5. **File Type Validation**: Audio file format verification

### Recommended for Production
1. **Rate Limiting**: Prevent API abuse
2. **Authentication**: JWT tokens or OAuth
3. **HTTPS**: Encrypted communication
4. **API Key Rotation**: Regular credential updates
5. **Input Sanitization**: Additional validation layers
6. **Logging**: Comprehensive audit trails
7. **Monitoring**: Performance and error tracking

## Scalability Considerations

### Current Architecture
- Synchronous processing
- Single instance deployment
- In-memory state

### Scaling Strategies

#### Horizontal Scaling
```
Load Balancer
    │
    ├─→ Backend Instance 1
    ├─→ Backend Instance 2
    └─→ Backend Instance 3
```

#### Optimization Options
1. **Caching**: Redis for frequent responses
2. **Queue System**: Celery for async processing
3. **CDN**: CloudFront for static assets
4. **Database**: PostgreSQL for persistent storage
5. **WebSockets**: Real-time streaming instead of polling

## Performance Metrics

### Current Performance
- **Audio Processing**: 1-3 seconds
- **LLM Response**: 2-5 seconds
- **TTS Generation**: 1-2 seconds
- **Total Response Time**: 4-10 seconds

### Bottlenecks
1. LLM API latency (network-dependent)
2. Audio format conversion
3. Sequential processing pipeline

### Optimization Opportunities
1. Parallel processing of audio chunks
2. Streaming LLM responses
3. Audio compression
4. Caching common queries
5. Edge computing for STT/TTS

## Deployment Architecture

### Development
```
localhost:3000 (Frontend) → localhost:8000 (Backend)
```

### Production (Recommended)
```
CDN (CloudFront)
    │
    └→ Frontend (Vercel/Netlify)
            │
            └→ Backend (AWS/Railway/Render)
                    │
                    ├→ OpenAI API
                    └→ Groq API
```

## Error Handling Strategy

### Frontend
1. **Network Errors**: Retry with exponential backoff
2. **Permission Errors**: User-friendly prompts
3. **Audio Errors**: Fallback to text input

### Backend
1. **STT Errors**: Return specific error messages
2. **LLM Errors**: Fallback to simple responses
3. **TTS Errors**: Continue without audio
4. **Validation Errors**: HTTP 400 with details

## Monitoring & Logging

### Current Logging
- Backend: Python logging module
- Frontend: Console logs
- Levels: INFO, ERROR

### Production Logging (Recommended)
1. **Structured Logging**: JSON format
2. **Log Aggregation**: ELK Stack or CloudWatch
3. **Metrics**: Prometheus + Grafana
4. **Error Tracking**: Sentry
5. **Performance**: New Relic or DataDog

## Future Enhancements

### Short-term
1. WebSocket support for streaming
2. Conversation history persistence
3. Multi-language support
4. Voice customization

### Long-term
1. Real-time translation
2. Emotion detection
3. Voice cloning
4. Multi-user support
5. Integration with other AI models

## Development Workflow

```
Developer → Git Commit → GitHub
                           │
                ┌──────────┴──────────┐
                │                     │
        CI/CD Pipeline          Code Review
                │                     │
        ┌───────┴────────┐           │
        │                │           │
    Run Tests    Build Docker        │
        │                │           │
        └───────┬────────┘           │
                │                     │
            Deploy to                 │
            Staging ←─────────────────┘
                │
            Manual Test
                │
            Deploy to
            Production
```

## Conclusion

This architecture provides a solid foundation for a voice-enabled chatbot with:
- Clear separation of concerns
- Modular service design
- Easy to extend and maintain
- Production-ready structure
- Scalability options

For detailed implementation, refer to the source code in respective directories.

