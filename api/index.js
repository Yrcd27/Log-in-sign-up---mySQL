import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Database connection function
const connectDatabase = async () => {
  try {
    console.log('Attempting database connection with:', {
      host: process.env.DB_HOST || 'Not set',
      user: process.env.DB_USER || 'Not set',
      database: process.env.DB_NAME || 'Not set',
      url: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
    
    // Create connection based on available credentials
    if (process.env.DATABASE_URL) {
      return await mysql.createConnection(process.env.DATABASE_URL);
    } else {
      return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Initialize Express app
const app = express();

// Apply middleware
app.use(cors({
  origin: '*'  // Allow all origins temporarily for debugging
}));
app.use(express.json());

// Debug endpoints to verify environment variables
app.get('/api/debug/env', (req, res) => {
  // Return full environment variable names but not values for security
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
    const connection = await connectDatabase();
    const [result] = await connection.query('SELECT 1 as test');
    await connection.end();
    res.status(200).json({ 
      status: 'Database connection successful',
      result: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ 
      status: 'Database connection failed',
      error: error.message,
      code: error.code,
      errno: error.errno
    });
  }
});

// Authentication routes directly implemented here
// Register route
app.post('/auth/register', async (req, res) => {
  const {username, email, password} = req.body;
  console.log('Register request received:', { username, email });
  
  try {
    const db = await connectDatabase();
    
    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      console.log('User already exists');
      await db.end();
      return res.status(409).json({message: "User already exists"});
    }

    // Hash password and create user
    const hashPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
      [username, email, hashPassword]);
    
    console.log('User registered successfully');
    await db.end();
    res.status(201).json({message: "User registered successfully"});
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      message: "Server error during registration", 
      error: err.message,
      code: err.code,
      errno: err.errno
    });
  }
});

// Login route
app.post('/auth/login', async (req, res) => {
  const {email, password} = req.body;
  console.log('Login request received for email:', email);
  
  try {
    const db = await connectDatabase();
    
    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      console.log('User not found');
      await db.end();
      return res.status(401).json({message: "Invalid email or password"});
    }
    
    const user = users[0];
    
    // Verify password
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) {
      console.log('Password mismatch');
      await db.end();
      return res.status(401).json({message: "Invalid email or password"});
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const {password: _, ...userWithoutPassword} = user;
    
    console.log('Login successful for user:', user.id);
    await db.end();
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
      token: token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error during login", 
      error: err.message,
      code: err.code,
      errno: err.errno
    });
  }
});

// Health check endpoint
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message
  });
});

// For Vercel serverless functions
const handler = async (req, res) => {
  return app(req, res);
};

export default handler;
