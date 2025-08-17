import express from 'express';
import cors from 'cors';
import authRouter from '../server/routes/authRoutes.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors({
  // Allow all origins in development, restrict in production
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true
}));
app.use(express.json());

// Set up routes
app.use('/auth', authRouter);

// Health check endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Export for serverless use
export default app;
