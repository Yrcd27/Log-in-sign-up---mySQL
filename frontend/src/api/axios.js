import axios from 'axios';

// Create an instance of axios with a base URL
const instance = axios.create({
  // Use environment variables if available (for production), otherwise use localhost:3000
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export default instance;
