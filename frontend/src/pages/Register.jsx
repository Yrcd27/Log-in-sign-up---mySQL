import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'


const Register = () => {
  // Initialize the navigate function from the useNavigate hook
  const navigate = useNavigate();

  const [values, setValues] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  };
 
  // State to track loading state and success/error messages
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset status and start loading
    setStatus({ loading: true, error: null, success: null });
    
    try {
      // Make API request to register - using relative URL for deployment compatibility
      const response = await api.post('/auth/register', values);
      
      // Show success message
      setStatus({ 
        loading: false, 
        error: null, 
        success: "Registration successful! Redirecting to login..." 
      });
      
      console.log("Registration successful:", response.data);
      
      // Wait 1.5 seconds before navigating to give user time to see success message
      setTimeout(() => {
        navigate('/login');  // Navigate to login page
      }, 1500);
      
    } catch (error) {
      // Handle errors from the API
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setStatus({ loading: false, error: errorMessage, success: null });
      console.error("Registration error:", error);
    }
  };
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="shadow-lg px-8 py-5 border w-96">
        <h2 className="text-lg font-bold mb-4">Register</h2>
        
        {/* Show success message if registration was successful */}
        {status.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{status.success}</span>
          </div>
        )}
        
        {/* Show error message if registration failed */}
        {status.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <span className="block sm:inline">{status.error}</span>
          </div>
        )}
        
        <form>
          <div className="mb-4">
            <label htmlFor="username" className='block text-gray-700'>Username:</label>
            <input 
              type="text" 
              placeholder='Enter username' 
              className='border rounded w-full py-2 px-3' 
              name="username" 
              onChange={handleChanges}
              disabled={status.loading} 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className='block text-gray-700'>Email:</label>
            <input 
              type="email" 
              placeholder='Enter email' 
              className='border rounded w-full py-2 px-3' 
              name="email" 
              onChange={handleChanges}
              disabled={status.loading} 
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className='block text-gray-700'>Password:</label>
            <input 
              type="password" 
              placeholder='Enter password' 
              className='border rounded w-full py-2 px-3' 
              name="password" 
              onChange={handleChanges}
              disabled={status.loading} 
            />
          </div>
          <button 
            className={`${status.loading ? 'bg-gray-400' : 'bg-green-600'} text-white py-2 px-4 rounded w-full`} 
            onClick={handleSubmit}
            disabled={status.loading}
          >
            {status.loading ? 'Registering...' : 'Submit'}
          </button>
        </form>
        <div className="text-center mt-4">
          <span>Already have account? </span>
          <Link to="/login" className="text-blue-600">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
