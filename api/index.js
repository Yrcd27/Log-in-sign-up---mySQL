import express from 'express';
import cors from 'cors';
import authRouter from '../server/routes/authRoutes.js';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors({
  origin: '*'  // Allow all origins temporarily for debugging
}));
app.use(express.json());

// Debug endpoints to verify environment variables
app.get('/api/debug/env', (req, res) => {
  const envVars = {
    dbHost: process.env.DB_HOST ? 'Set' : 'Not set',
    dbUser: process.env.DB_USER ? 'Set' : 'Not set',
    dbPassword: process.env.DB_PASSWORD ? 'Set' : 'Not set',
    dbName: process.env.DB_NAME ? 'Set' : 'Not set',
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Not set',
    nodeEnv: process.env.NODE_ENV || 'Not set'
  };
  res.status(200).json(envVars);
});

// Test database connection
app.get('/api/debug/db', async (req, res) => {
  try {
    let connection;
    if (process.env.DATABASE_URL) {
      connection = await mysql.createConnection(process.env.DATABASE_URL);
    } else {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
    }
    await connection.query('SELECT 1');
    await connection.end();
    res.status(200).json({ status: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? null : error.stack
    });
  }
});

// Set up routes
app.use('/auth', authRouter);

// Health check endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? null : err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// For Vercel serverless functions
const handler = async (req, res) => {
  // Handle with Express
  return app(req, res);
};

// Export for serverless use
export default handler;
