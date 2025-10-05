@echo off
REM Voice Chatbot Startup Script (Windows)
REM This script starts both backend and frontend servers

echo ================================
echo   Voice Chatbot - Starting...
echo ================================
echo.

REM Check if backend venv exists
if not exist "backend\venv" (
    echo ERROR: Backend virtual environment not found
    echo Please run setup first:
    echo   cd backend
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    exit /b 1
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo ERROR: Frontend dependencies not installed
    echo Please run setup first:
    echo   cd frontend
    echo   npm install
    exit /b 1
)

echo [OK] Dependencies found
echo.

REM Start backend in new window
echo Starting backend server...
start "Voice Chatbot - Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in new window
echo Starting frontend server...
start "Voice Chatbot - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================
echo   Both servers are starting!
echo ================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the servers
echo.

pause

