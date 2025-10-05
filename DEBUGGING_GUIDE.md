# Debugging Guide - Voice Chat Audio Issues

## Recent Updates ✅

I've just added comprehensive logging and better audio handling. Here's what changed:

### Frontend Improvements:
1. ✅ Better audio quality settings (16kHz, mono, noise suppression)
2. ✅ Console logging for audio recording and conversion
3. ✅ Better error messages
4. ✅ Automatic MIME type detection

### Backend Improvements:
1. ✅ Detailed logging for each step
2. ✅ Better error messages
3. ✅ File format validation
4. ✅ Audio duration logging

## How to Debug Your Issue

### Step 1: Check Browser Console

Open Developer Tools (F12) and check the Console tab. You should see:

```
Recording with MIME type: audio/webm
Audio recorded: {size: XXXXX, type: "audio/webm"}
Converted to WAV: XXXXX bytes
Sending audio to backend: {size: XXXXX, type: "audio/wav"}
```

**If you see an error at "Audio conversion failed":**
- The Web Audio API can't decode your audio format
- Try a different browser (Chrome works best)
- The recording might be too short or empty

### Step 2: Check Backend Logs

Look at your backend terminal. You should see:

```
INFO: Received audio file: recording.wav, content_type: audio/wav
INFO: Audio file size: XXXXX bytes
INFO: Attempting to transcribe audio, size: XXXXX bytes
INFO: Audio source opened, duration: ~Xs
INFO: Audio recorded from source, attempting recognition...
INFO: Transcription successful: [your text]...
```

**Common Issues:**

#### Issue: "Invalid audio file format"
- The WAV conversion failed
- Try recording for longer (3+ seconds)
- Speak loudly and clearly

#### Issue: "Could not understand audio"
- Audio is too quiet
- Background noise is too loud
- Recording is too short
- Try speaking louder and closer to microphone

#### Issue: "Audio source opened, duration: ~0s"
- Recording was empty or too short
- Record for at least 2-3 seconds
- Check microphone is working

### Step 3: Test Recording Duration

The app needs you to:
1. **Click microphone** 🎤
2. **Wait 1 second** for recording to stabilize
3. **Speak clearly for 3-5 seconds**
4. **Click to stop**

❌ **Too short**: "Hello" (< 1 second)  
✅ **Good**: "Hello, how are you doing today?" (3-5 seconds)

### Step 4: Test Your Microphone

Before using the app, test your microphone:

**Windows:**
- Settings → System → Sound → Input → Test microphone

**macOS:**
- System Preferences → Sound → Input → Check input level

**Browser:**
- Make sure you granted microphone permission
- Try: https://www.onlinemictest.com/

## Quick Fixes

### Fix 1: Record Longer
```
Minimum: 2-3 seconds
Optimal: 3-5 seconds
Maximum: No limit (but LLM has token limits)
```

### Fix 2: Speak Louder
- Get closer to microphone (6-12 inches)
- Speak clearly and at normal volume
- Avoid background noise

### Fix 3: Try Different Browser
Best to Worst:
1. **Chrome** (best Web Audio API support)
2. Edge (Chromium-based)
3. Firefox (good)
4. Safari (can have issues)

### Fix 4: Check Audio Settings
The app records at:
- Sample Rate: 16kHz
- Channels: Mono (1)
- Bit Depth: 16-bit

If your microphone doesn't support these, it may fail.

### Fix 5: Restart Servers
If all else fails:

```bash
# Stop both servers (Ctrl+C)

# Restart backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate
python main.py

# Restart frontend (new terminal)
cd frontend
npm run dev
```

## Expected Behavior

### ✅ Successful Flow:
1. Click mic → "Recording..." appears
2. Speak for 3-5 seconds
3. Click to stop → "Processing..." appears
4. Your text appears in chat
5. AI response appears
6. Audio plays automatically

### ❌ Error Flow:
1. Click mic → "Recording..." appears
2. Speak too quietly or briefly
3. Click to stop → "Processing..." appears
4. Error: "Could not understand audio"

## Advanced Debugging

### Check WAV Conversion in Console:

```javascript
// Open browser console and paste:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const recorder = new MediaRecorder(stream);
    console.log('Supported types:', [
      'audio/wav',
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus'
    ].filter(type => MediaRecorder.isTypeSupported(type)));
  });
```

### Test Backend Directly:

```bash
# Record a test file with your system
# Then test the endpoint:
curl -X POST http://localhost:8000/api/voice-chat \
  -F "audio=@test.wav"
```

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Could not understand audio" | Speech unclear or too quiet | Speak louder, closer to mic |
| "Invalid audio file format" | WAV conversion failed | Try different browser |
| "Failed to convert audio" | Web Audio API issue | Use Chrome browser |
| "Empty audio file received" | No audio recorded | Check mic permissions |
| "Speech recognition service unavailable" | Google API down | Wait and retry |

## Still Not Working?

### Checklist:
- [ ] Recording for 3+ seconds
- [ ] Speaking clearly and loudly
- [ ] Using Chrome browser
- [ ] Microphone permission granted
- [ ] Microphone working in other apps
- [ ] Both servers running
- [ ] No errors in backend logs
- [ ] Audio size > 10KB

### If ALL above are checked:

1. Check backend logs for exact error
2. Check browser console for conversion errors
3. Try recording with your phone/different device
4. Ensure you're on http://localhost:3000 (not 3001)

## Need More Help?

The logs will show exactly where the failure occurs:
- **Frontend error**: Browser console
- **Backend error**: Terminal with backend

Share the exact error message and logs for specific help!

---

**Pro Tip**: The most common issue is **recording too briefly**. Always speak for at least 3 seconds!
