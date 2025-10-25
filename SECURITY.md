# SocialSphere

## Important: Environment Setup

This project uses environment variables for sensitive information like API keys and credentials.

### Setup Instructions

1. **Backend Setup**:
   ```bash
   cd backend
   
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your actual API keys
   # DO NOT commit the .env file to git
   ```

2. **Firebase Setup**:
   - Download your Firebase Admin SDK JSON file from the Firebase Console
   - Save it as `backend/mern-blog-248bd-firebase-adminsdk-5c6fo-45cd88f808.json`
   - This file is automatically ignored by git for security

3. **Required Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key
   - `STABILITY_API_KEY`: Your Stability AI API key
   - `TWITTER_CONSUMER_KEY`: Twitter API consumer key
   - `TWITTER_CONSUMER_SECRET`: Twitter API consumer secret
   - `TWITTER_ACCESS_TOKEN_KEY`: Twitter API access token
   - `TWITTER_ACCESS_TOKEN_SECRET`: Twitter API access token secret

### Security Notes

⚠️ **NEVER commit the following files**:
- `.env`
- `*firebase-adminsdk*.json`
- Any files containing API keys or credentials

These files are already included in `.gitignore`.
