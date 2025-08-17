import express from 'express'
import {connectdatabase} from '../lib/db.js' 
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async (req, res) => {
    const {username, email, password} = req.body;
    try{
        const db = await connectdatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?' , [email])
        if(rows.length > 0) {
            return res.status(409).json({message: "User already exists"})
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashPassword]);
        res.status(201).json({message: "User registered successfully"});
    } catch(err) {
        console.error("Registration error:", err);
        res.status(500).json({message: "Server error during registration", error: err.message})
    }
})

// Login route to authenticate users
router.post('/login', async (req, res) => {
    // Extract email and password from request body
    const {email, password} = req.body;
    
    try {
        // Connect to the database
        const db = await connectdatabase();
        
        // Search for the user with the provided email
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        // If no user is found with that email
        if(users.length === 0) {
            return res.status(401).json({message: "Invalid email or password"});
        }
        
        const user = users[0];
        
        // Compare the provided password with the stored hash
        const match = await bcrypt.compare(password, user.password);
        
        if(!match) {
            return res.status(401).json({message: "Invalid email or password"});
        }
        
        // Don't include password in the response
        const {password: _, ...userWithoutPassword} = user;
        
        // Generate a JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },  // Payload data
            process.env.JWT_SECRET || 'default_jwt_secret',  // Secret key
            { expiresIn: '24h' }  // Token expiration time
        );
        
        // Return success with user info and token
        res.status(200).json({
            message: "Login successful",
            user: userWithoutPassword,
            token: token
        });
    } catch(err) {
        console.error("Login error:", err);
        res.status(500).json({message: "Server error during login", error: err.message});
    }
});

export default router;