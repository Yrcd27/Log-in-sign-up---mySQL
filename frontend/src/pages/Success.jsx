import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const Success = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in (token exists)
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      // If no token found, redirect to login
      navigate('/login');
      return;
    }
    
    try {
      // Parse the stored user data
      setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Error parsing user data:", error);
      // If user data is corrupt, clear everything and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [navigate]);
  
  const handleLogout = () => {
    // Clear the stored token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect to home page
    navigate('/');
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="bg-green-100 border border-green-400 text-green-700 px-8 py-6 rounded-lg shadow-md max-w-md">
        <h1 className="text-2xl font-bold mb-4">Successfully Logged In!</h1>
        <p className="mb-4">
          Welcome back, <strong>{user.username || user.email}</strong>!
        </p>
        <p className="mb-6">You have successfully logged into your account.</p>
        <div className="flex justify-between">
          <button 
            onClick={handleLogout}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
          <Link 
            to="/"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
