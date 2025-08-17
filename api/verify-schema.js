import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const verifySchema = async () => {
  console.log('Starting database schema verification...');
  
  try {
    // Create connection with SSL options
    const sslOptions = { rejectUnauthorized: false };
    let connection;
    
    if (process.env.DATABASE_URL) {
      console.log('Using DATABASE_URL for connection');
      connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: sslOptions
      });
    } else {
      console.log('Using individual credentials for connection');
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: sslOptions
      });
    }
    
    console.log('Connected to database successfully');
    
    // Check if users table exists
    const [tables] = await connection.query('SHOW TABLES LIKE "users"');
    
    if (tables.length === 0) {
      console.log('Users table not found, creating it...');
      
      // Create users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Users table created successfully');
    } else {
      console.log('Users table already exists');
      
      // Check table structure
      const [columns] = await connection.query('DESCRIBE users');
      console.log('Users table structure:', columns.map(col => `${col.Field} (${col.Type})`).join(', '));
    }
    
    // Close connection
    await connection.end();
    console.log('Schema verification completed successfully');
    
  } catch (error) {
    console.error('Error during schema verification:', error);
    process.exit(1);
  }
};

// Run the verification
verifySchema();
