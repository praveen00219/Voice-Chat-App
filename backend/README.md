# Voice Chatbot Backend

FastAPI-based backend for the voice-enabled chatbot with Speech-to-Text, LLM, and Text-to-Speech capabilities.

## Features

- **Speech-to-Text (STT)**: Google Speech Recognition (free)
- **Large Language Model**: OpenAI GPT or Groq (with fallback mode)
- **Text-to-Speech (TTS)**: Google Text-to-Speech (gTTS)

## Setup Instructions

### Prerequisites

- Python 3.11 or higher
- pip package manager
- Microphone access (for recording)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your API keys:

**Option 1: Use OpenAI (Recommended)**
```env
OPENAI_API_KEY=your_openai_api_key_here
USE_GROQ=false
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

**Option 2: Use Groq (Free, Fast Alternative)**
```env
USE_GROQ=true
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from: https://console.groq.com/keys

**Option 3: No API Key (Fallback Mode)**

The application will work without API keys but with limited functionality using simple keyword-based responses.

### Running the Server

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### POST /api/voice-chat

Process voice input and return AI response with audio.

**Request:**
- `audio`: Audio file (multipart/form-data)

**Response:**
```json
{
  "transcript": "User's speech converted to text",
  "llm_response": "AI assistant's response",
  "audio_base64": "Base64 encoded audio response"
}
```

### GET /health

Health check endpoint returning service status.

## Docker Deployment

Build and run using Docker:

```bash
docker build -t voice-chatbot-backend .
docker run -p 8000:8000 --env-file .env voice-chatbot-backend
```

## Troubleshooting

### PyAudio Installation Issues

**Windows:**
```bash
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
sudo apt-get install portaudio19-dev python3-pyaudio
pip install pyaudio
```

### Speech Recognition Errors

If you get "Could not understand audio" errors:
- Ensure the audio is clear and not too short
- Check that the audio format is supported
- Try speaking more slowly and clearly

## Technology Stack

- **FastAPI**: Modern, fast web framework
- **SpeechRecognition**: Python library for STT
- **gTTS**: Google Text-to-Speech
- **OpenAI API**: For advanced language model responses
- **Groq API**: Fast alternative LLM provider

## License

MIT License

