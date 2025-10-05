"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Mic, MicOff, Send, Volume2, Loader2, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function VoiceChatbot() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const convertToWav = async (audioBlob: Blob): Promise<Blob> => {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Read the blob as array buffer
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Convert to WAV format
    const wavBuffer = audioBufferToWav(audioBuffer);
    
    return new Blob([wavBuffer], { type: "audio/wav" });
  };

  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // "RIFF" chunk descriptor
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // "fmt " sub-chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // size
    setUint16(1); // PCM format
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels); // byte rate
    setUint16(buffer.numberOfChannels * 2); // block align
    setUint16(16); // bits per sample

    // "data" sub-chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // chunk length

    // Write audio data
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    offset = pos;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  };

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      // Try to use audio/wav if supported, otherwise fall back to webm
      let mimeType = "audio/webm";
      const supportedTypes = [
        "audio/wav",
        "audio/webm",
        "audio/webm;codecs=opus",
        "audio/ogg;codecs=opus"
      ];
      
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log("Recording with MIME type:", mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log("Audio recorded:", {
          size: audioBlob.size,
          type: audioBlob.type,
        });
        
        // Convert to WAV format before sending
        try {
          const wavBlob = await convertToWav(audioBlob);
          console.log("Converted to WAV:", wavBlob.size, "bytes");
          await sendAudioToBackend(wavBlob);
        } catch (conversionError) {
          console.error("Audio conversion failed:", conversionError);
          setError("Failed to convert audio. Please try again or use a different browser.");
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Failed to access microphone. Please ensure microphone permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log("Sending audio to backend:", {
        size: audioBlob.size,
        type: audioBlob.type,
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.wav");

      const response = await axios.post(`${BACKEND_URL}/api/voice-chat`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "json",
      });

      console.log("Backend response received");
      const { transcript, llm_response, audio_base64 } = response.data;

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        text: transcript,
        sender: "user",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: llm_response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

      // Play audio response
      if (audio_base64) {
        playAudioResponse(audio_base64);
      }

    } catch (err) {
      console.error("Error processing audio:", err);
      if (axios.isAxiosError(err)) {
        const errorDetail = err.response?.data?.detail || "Failed to process audio. Please try again.";
        console.error("Backend error detail:", errorDetail);
        setError(errorDetail);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = (audioBase64: string) => {
    try {
      const audioData = `data:audio/mpeg;base64,${audioBase64}`;
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioData);
      audioRef.current = audio;
      
      audio.play().catch(err => {
        console.error("Error playing audio:", err);
        setError("Failed to play audio response. Please check your audio settings.");
      });

    } catch (err) {
      console.error("Error creating audio:", err);
      setError("Failed to create audio response.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Voice-Enabled Chatbot
          </h1>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          Click the microphone to start speaking with AI
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white dark:bg-gray-800 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <Volume2 className="w-20 h-20 mb-4 opacity-50" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm mt-2">Start a conversation by recording your voice</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-6 py-3 shadow-md ${
                  message.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                <p className="text-sm font-medium mb-1 opacity-75">
                  {message.sender === "user" ? "You" : "AI Assistant"}
                </p>
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mx-6 mt-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Recording Status */}
      {isRecording && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-lg mx-6 mt-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium">Recording... {formatTime(recordingTime)}</p>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 px-4 py-3 rounded-lg mx-6 mt-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p className="text-sm font-medium">Processing your message...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`
              relative p-6 rounded-full transition-all duration-300 shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 active:scale-95"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 active:scale-95"
              }
              ${!isProcessing && "hover:shadow-xl"}
            `}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
            
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            )}
          </button>
        </div>
        
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isRecording ? "Click to stop recording" : "Click to start recording"}
        </p>
      </div>
    </div>
  );
}

