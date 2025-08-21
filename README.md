# Speech Recognition App

A full-stack application that allows users to record speech, store it in a database, and compare speeches to find matching words.

## Features

- **User Authentication**: Sign up and login functionality
- **Speech Recording**: Record reference and comparison speeches using Web Speech API
- **Speech Storage**: Store speeches in MongoDB database
- **Speech Comparison**: Compare speeches and find matching/missing words
- **Real-time Results**: See comparison results with match percentage
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React, JavaScript, Tailwind CSS
- **Backend**: Flask, Python
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Speech Recognition**: Web Speech API

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- MongoDB (running on localhost:27017)

### Backend Setup

1. Install Python dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Start MongoDB service on your system

3. Run the MongoDB setup script:
\`\`\`bash
mongosh < scripts/mongodb-setup.js
\`\`\`

4. Start the Flask server:
\`\`\`bash
python scripts/flask-backend.py
\`\`\`

The backend will run on `http://localhost:5000`

### Frontend Setup

1. The React app is already configured in this project
2. Make sure your browser supports Web Speech API (Chrome, Edge, Safari)
3. Allow microphone permissions when prompted

## Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Record Reference Speech**: Switch to "Reference Speech" tab and record your base speech
3. **Record Comparison Speech**: Switch to "Comparison Speech" tab and record speech to compare
4. **View Results**: See which words are present/missing and the match percentage
5. **View History**: Check all your saved speeches in the history section

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `POST /api/speeches` - Save speech
- `GET /api/speeches` - Get user speeches
- `POST /api/compare` - Compare speeches

## Example Usage

1. Record reference speech: "Hey I am a boy"
2. Record comparison speech: "I am a woman"
3. Results will show:
   - Present words: ["I", "am", "a"]
   - Missing words: ["Hey", "boy"]
   - New words: ["woman"]
   - Match percentage: 60%

## Security Features

- Password hashing using Werkzeug
- JWT token authentication
- CORS protection
- Input validation and sanitization

## Browser Compatibility

- Chrome (recommended)
- Edge
- Safari
- Firefox (limited speech recognition support)

Note: Web Speech API requires HTTPS in production environments.
