import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createTable() {
  try {
    // Create the connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // SQL query to create the users table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute the query
    const [result] = await pool.query(createTableQuery);
    console.log('Table created successfully:', result);
    
    // Close the connection
    await pool.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

createTable();
