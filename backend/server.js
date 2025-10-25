import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { TwitterApi } from 'twitter-api-v2';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'twitter-api-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 }
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sattvadoshi:Sattva%40123@userdatabase.lastvy7.mongodb.net/KJ?retryWrites=true&w=majority&appName=UserDataBase')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twitterTokens: {
    accessToken: String,
    refreshToken: String
  }
});

const User = mongoose.model('User', userSchema);

// Twitter API config
const clientId = process.env.TWITTER_CLIENT_ID || '';
const clientSecret = process.env.TWITTER_CLIENT_SECRET || '';
const callbackUrl = process.env.CALLBACK_URL || 'http://localhost:5000/auth/callback';

// Initialize Twitter API client
const twitterClient = new TwitterApi({ clientId, clientSecret });

// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login first.' });
};

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword
    });
    
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Set user session
    req.session.userId = user._id;
    
    // If user has Twitter tokens, add them to session
    if (user.twitterTokens?.accessToken) {
      req.session.accessToken = user.twitterTokens.accessToken;
      req.session.refreshToken = user.twitterTokens.refreshToken;
    }
    
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Logout user
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Generate authentication link
app.get('/twitter/login', isAuthenticated, async (req, res) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackUrl, 
    { scope: ['tweet.read', 'users.read', 'offline.access'] }
  );

  // Store state and codeVerifier in session
  req.session.codeVerifier = codeVerifier;
  req.session.state = state;
  
  res.json({ url, state });
});

// Handle OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { state, code } = req.query;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send('Please login to your account first');
  }

  if (!code || state !== req.session.state) {
    return res.status(400).send('Invalid Request: Authorization failed');
  }

  try {
    // Exchange authorization code for access token
    const { accessToken, refreshToken } = await twitterClient.loginWithOAuth2({
      code: code.toString(),
      codeVerifier: req.session.codeVerifier,
      redirectUri: callbackUrl
    });

    // Save tokens to session
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    // Save tokens to user document in MongoDB
    await User.findByIdAndUpdate(userId, {
      twitterTokens: { accessToken, refreshToken }
    });

    res.send('Twitter authentication successful! You can now fetch user data.');
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.status(500).send('Authentication failed.');
  }
});

// Fetch authenticated user details
app.get('/twitter/user', isAuthenticated, async (req, res) => {
  if (!req.session.accessToken) {
    return res.status(401).json({ error: 'Twitter not connected. Please connect your Twitter account first.' });
  }

  try {
    const client = new TwitterApi(req.session.accessToken);
    const user = await client.v2.me();
    res.json(user.data);
  } catch (error) {
    console.error('❌ Error fetching Twitter user:', error);
    
    // Handle expired token
    if (error.code === 401) {
      try {
        // Try to refresh the token
        const { client: refreshedClient, accessToken, refreshToken } = await twitterClient.refreshOAuth2Token(req.session.refreshToken);
        
        // Update tokens
        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        
        // Update in database
        await User.findByIdAndUpdate(req.session.userId, {
          twitterTokens: { accessToken, refreshToken }
        });
        
        // Try fetching user again
        const user = await refreshedClient.v2.me();
        return res.json(user.data);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return res.status(401).json({ error: 'Session expired. Please reconnect your Twitter account.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to fetch Twitter user', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});