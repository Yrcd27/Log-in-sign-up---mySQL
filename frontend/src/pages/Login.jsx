import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  // Initialize navigation function
  const navigate = useNavigate();
  
  // State for form values
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  
  // State for tracking loading and error states
  const [status, setStatus] = useState({
    loading: false,
    error: null
  });
  
  // Handle form input changes
  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Start loading and reset any errors
    setStatus({ loading: true, error: null });
    
    try {
      // Make API request to login
      const response = await axios.post('http://localhost:3000/auth/login', values);
      
      // Extract token and user data from response
      const { token, user } = response.data;
      
      // Store token in localStorage for persistent auth
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Navigate to success page
      navigate('/success');
      
    } catch (error) {
      // Extract error message from response or use a default
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";
      setStatus({ loading: false, error: errorMessage });
      console.error("Login error:", error);
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="shadow-lg px-8 py-5 border w-96">
        <h2 className="text-lg font-bold mb-4">Login</h2>
        
        {/* Show error message if login failed */}
        {status.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{status.error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className='block text-gray-700'>Email:</label>
            <input 
              type="email" 
              name="email"
              placeholder='Enter email' 
              className='border rounded w-full py-2 px-3'
              value={values.email}
              onChange={handleChange}
              disabled={status.loading}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className='block text-gray-700'>Password:</label>
            <input 
              type="password" 
              name="password"
              placeholder='Enter password' 
              className='border rounded w-full py-2 px-3'
              value={values.password}
              onChange={handleChange}
              disabled={status.loading}
              required
            />
          </div>
          <button 
            type="submit"
            className={`${status.loading ? 'bg-gray-400' : 'bg-green-600'} text-white py-2 px-4 rounded w-full`}
            disabled={status.loading}
          >
            {status.loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="text-center mt-4">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-blue-600">Register</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
