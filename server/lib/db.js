import mysql from 'mysql2/promise';

// In serverless environments, we should create a new connection for each request
// since the function instances are ephemeral
export const connectdatabase = async () => {
    try {
        // For production, we'll use a connection string from environment variables
        if (process.env.DATABASE_URL) {
            return await mysql.createConnection(process.env.DATABASE_URL);
        }
        
        // For local development, we'll use individual credentials
        return await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    } catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}