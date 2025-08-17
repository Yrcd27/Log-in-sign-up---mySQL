import mysql from 'mysql2/promise';

// In serverless environments, we should create a new connection for each request
// since the function instances are ephemeral
export const connectdatabase = async () => {
    try {
        // Debug log to see what environment variables are available
        console.log('Connection attempt with:', {
            usingUrl: !!process.env.DATABASE_URL,
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            // Don't log the full password for security
            passwordProvided: !!process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        // For production, we'll use a connection string from environment variables
        if (process.env.DATABASE_URL) {
            const connection = await mysql.createConnection({
                uri: process.env.DATABASE_URL,
                // Add these options to handle Vercel serverless environment
                connectTimeout: 60000, // 60 seconds
                ssl: {
                    rejectUnauthorized: false // For some cloud database services
                }
            });
            console.log('Database connected using connection string');
            return connection;
        }
        
        // For local development, we'll use individual credentials
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            // Add these options to handle Vercel serverless environment
            connectTimeout: 60000 // 60 seconds
        });
        console.log('Database connected using individual credentials');
        return connection;
    } catch (error) {
        console.error('Error connecting to database:', error);
        // Add more detailed error information
        const errorDetails = {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlMessage: error.sqlMessage,
            sqlState: error.sqlState,
            fatal: error.fatal
        };
        console.error('Error details:', JSON.stringify(errorDetails));
        throw error;
    }
}