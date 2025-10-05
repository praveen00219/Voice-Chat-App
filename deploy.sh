#!/bin/bash

# Voice Chatbot Deployment Script for Netlify + Render
# This script helps prepare your project for deployment

echo "🚀 Voice Chatbot Deployment Preparation Script"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if .env file exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Creating from example..."
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from example"
    echo "📝 Please edit backend/.env with your actual API keys"
fi

# Check if all required files exist
echo "🔍 Checking deployment files..."

files=(
    "frontend/netlify.toml"
    "backend/render.yaml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "DEPLOYMENT_GUIDE.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Add deployment configs'"
echo "   git push origin main"
echo ""
echo "2. Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "3. Deploy Backend to Render:"
echo "   - Go to render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'backend'"
echo ""
echo "4. Deploy Frontend to Netlify:"
echo "   - Go to netlify.com"
echo "   - Create new site from Git"
echo "   - Connect your GitHub repo"
echo "   - Set base directory to 'frontend'"
echo ""
echo "🎉 Happy deploying!"
