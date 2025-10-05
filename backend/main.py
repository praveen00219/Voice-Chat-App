"""
Voice-Enabled Chatbot Backend
FastAPI server with Speech-to-Text, LLM, and Text-to-Speech integration
"""

from dotenv import load_dotenv
load_dotenv()

import os
import base64
import logging
from typing import Optional
from io import BytesIO

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Import speech and LLM libraries
from gtts import gTTS
from openai import OpenAI

APP_NAME = "Voice Chat Backend"

# Configure CORS for local dev; adjust for production as needed
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Voice Chatbot API",
    description="Backend API for voice-enabled chatbot with STT, LLM, and TTS",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://127.0.0.1:3000"], # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_GROQ = os.getenv("USE_GROQ", "false").lower() == "true"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# print("OPENAI_API_KEY :", OPENAI_API_KEY)
# print("USE_GROQ :", USE_GROQ)
# print("GROQ_API_KEY :", GROQ_API_KEY)

# Initialize OpenAI client for Whisper (speech-to-text)
whisper_client = None
if OPENAI_API_KEY:
    try:
        whisper_client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("OpenAI Whisper client initialized")
    except Exception as e:
        logger.warning(f"Failed to initialize Whisper client: {e}")

# Initialize LLM client (can work with OpenAI or Groq)
openai_client = None
try:
    if USE_GROQ and GROQ_API_KEY:
        openai_client = OpenAI(
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1"
        )
        logger.info("Groq client initialized for LLM")
    elif OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("OpenAI client initialized for LLM")
    else:
        logger.warning("No API key provided. Using fallback LLM responses.")
except Exception as e:
    logger.error(f"Failed to initialize LLM client: {e}")
    logger.warning("Using fallback LLM responses.")
    openai_client = None


class VoiceResponse(BaseModel):
    """Response model for voice chat endpoint"""
    transcript: str
    llm_response: str
    audio_base64: Optional[str] = None


class SpeechToTextService:
    """Service for converting speech to text using OpenAI Whisper API"""
    
    def __init__(self, whisper_client_instance=None):
        self.whisper_client = whisper_client_instance
    
    def transcribe_audio(self, audio_file: bytes) -> str:
        """
        Transcribe audio file to text using OpenAI Whisper API
        
        Args:
            audio_file: Audio file in bytes (WAV format)
            
        Returns:
            Transcribed text
            
        Raises:
            Exception: If transcription fails
        """
        try:
            logger.info(f"Attempting to transcribe audio, size: {len(audio_file)} bytes")
            
            if not self.whisper_client:
                raise Exception("OpenAI API key not configured. Please add your OpenAI API key to use speech recognition.")
            
            # Use OpenAI Whisper API
            logger.info("Using OpenAI Whisper API for transcription...")
            audio_buffer = BytesIO(audio_file)
            audio_buffer.name = "audio.wav"
            
            transcription = self.whisper_client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_buffer,
                language="en",
                response_format="text"
            )
            
            text = transcription.strip()
            
            if not text:
                logger.error("Whisper returned empty transcription")
                raise Exception("Could not understand the audio. Please speak clearly and ensure your microphone is working.")
            
            logger.info(f"Whisper transcription successful: {text[:100]}...")
            return text
            
        except Exception as e:
            logger.error(f"Transcription error: {type(e).__name__}: {e}")
            if "API key" in str(e).lower() or "authentication" in str(e).lower():
                raise Exception("OpenAI API key is invalid or not configured. Please check your API key.")
            raise Exception(f"Failed to transcribe audio: {str(e)}")


class LLMService:
    """Service for querying Large Language Models"""
    
    def __init__(self, client: Optional[OpenAI] = None):
        self.client = client
        self.model = "gpt-3.5-turbo" if not USE_GROQ else "mixtral-8x7b-32768"
    
    def get_response(self, user_query: str) -> str:
        """
        Get response from LLM
        
        Args:
            user_query: User's question/query
            
        Returns:
            LLM's response
        """
        try:
            if self.client:
                # Use OpenAI or Groq API
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a helpful, friendly AI assistant. Provide clear, concise, and accurate responses."
                        },
                        {
                            "role": "user",
                            "content": user_query
                        }
                    ],
                    max_tokens=500,
                    temperature=0.7,
                )
                llm_response = response.choices[0].message.content.strip()
                logger.info(f"LLM response generated: {llm_response[:50]}...")
                return llm_response
            else:
                # Fallback response when no API key is configured
                return self._get_fallback_response(user_query)
                
        except Exception as e:
            logger.error(f"LLM error: {e}")
            return self._get_fallback_response(user_query)
    
    def _get_fallback_response(self, query: str) -> str:
        """
        Provide a fallback response when LLM is unavailable
        
        Args:
            query: User's query
            
        Returns:
            Fallback response
        """
        query_lower = query.lower()
        
        # Simple keyword-based responses
        if any(word in query_lower for word in ["hello", "hi", "hey"]):
            return "Hello! I'm your AI assistant. How can I help you today?"
        elif any(word in query_lower for word in ["how are you", "how do you do"]):
            return "I'm doing great, thank you for asking! I'm here to help you with any questions you have."
        elif any(word in query_lower for word in ["name", "who are you"]):
            return "I'm an AI voice assistant, designed to help answer your questions and have conversations with you."
        elif any(word in query_lower for word in ["bye", "goodbye", "see you"]):
            return "Goodbye! It was nice talking to you. Have a great day!"
        else:
            return f"I heard you say: '{query}'. I'm a demo chatbot. To enable full AI capabilities, please configure an OpenAI or Groq API key."


class TextToSpeechService:
    """Service for converting text to speech"""
    
    def __init__(self):
        self.language = "en"
        self.tld = "com"  # Top-level domain for accent (com = US English)
    
    def synthesize_speech(self, text: str) -> bytes:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert
            
        Returns:
            Audio data in bytes (MP3 format)
            
        Raises:
            Exception: If synthesis fails
        """
        try:
            # Create gTTS object
            tts = gTTS(text=text, lang=self.language, tld=self.tld, slow=False)
            
            # Save to BytesIO buffer
            audio_buffer = BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            
            audio_bytes = audio_buffer.read()
            logger.info(f"Audio synthesis successful, size: {len(audio_bytes)} bytes")
            return audio_bytes
            
        except Exception as e:
            logger.error(f"TTS error: {e}")
            raise Exception(f"Failed to synthesize speech: {str(e)}")


# Initialize services
stt_service = SpeechToTextService(whisper_client)
llm_service = LLMService(openai_client)
tts_service = TextToSpeechService()


@app.get("/")
async def root():
    """Root endpoint for health check"""
    return {
        "status": "healthy",
        "service": "Voice Chatbot API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "stt": "operational",
            "llm": "operational" if openai_client else "fallback_mode",
            "tts": "operational"
        },
        "config": {
            "llm_provider": "groq" if USE_GROQ else "openai" if OPENAI_API_KEY else "fallback",
            "model": llm_service.model if openai_client else "fallback"
        }
    }


@app.post("/api/test-audio")
async def test_audio(audio: UploadFile = File(...)):
    """Test endpoint to debug audio file issues"""
    try:
        audio_bytes = await audio.read()
        
        # Check file info
        info = {
            "filename": audio.filename,
            "content_type": audio.content_type,
            "size": len(audio_bytes),
            "first_bytes": audio_bytes[:44].hex() if len(audio_bytes) >= 44 else audio_bytes.hex(),
            "whisper_available": whisper_client is not None
        }
        
        return info
    except Exception as e:
        return {"error": str(e)}


@app.post("/api/voice-chat", response_model=VoiceResponse)
async def voice_chat(audio: UploadFile = File(...)):
    """
    Main endpoint for voice chat
    
    Process flow:
    1. Receive audio file
    2. Convert speech to text (STT)
    3. Query LLM with text
    4. Convert LLM response to speech (TTS)
    5. Return transcript, response text, and audio
    
    Args:
        audio: Audio file uploaded by user
        
    Returns:
        VoiceResponse containing transcript, LLM response, and audio
    """
    try:
        logger.info(f"Received audio file: {audio.filename}, content_type: {audio.content_type}")
        
        # Read audio file
        audio_bytes = await audio.read()
        
        if len(audio_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file received")
        
        logger.info(f"Audio file size: {len(audio_bytes)} bytes")
        
        # Step 1: Convert audio to text (STT)
        try:
            transcript = stt_service.transcribe_audio(audio_bytes)
        except Exception as e:
            logger.error(f"STT failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        
        # Step 2: Get LLM response
        try:
            llm_response = llm_service.get_response(transcript)
        except Exception as e:
            logger.error(f"LLM failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        # Step 3: Convert response to speech (TTS)
        try:
            audio_response = tts_service.synthesize_speech(llm_response)
            audio_base64 = base64.b64encode(audio_response).decode('utf-8')
        except Exception as e:
            logger.error(f"TTS failed: {e}")
            # Continue without audio if TTS fails
            audio_base64 = None
        
        return VoiceResponse(
            transcript=transcript,
            llm_response=llm_response,
            audio_base64=audio_base64
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in voice_chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")


if __name__ == "__main__":
    # Run server
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

