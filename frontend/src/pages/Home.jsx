import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    // Check if user is logged in when component mounts
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsLoggedIn(true);
        setUsername(user.username || user.email);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUsername("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <header className="flex justify-between items-center mb-8 p-4 bg-white shadow rounded">
          <h1 className="text-3xl text-blue-600 font-bold">My App</h1>
          
          <div className="space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-gray-600">Welcome, {username}!</span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
                <Link 
                  to="/success" 
                  className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </header>
        
        <main className="bg-white shadow rounded p-8">
          <h2 className="text-2xl mb-4">Welcome to our Authentication Demo</h2>
          <p className="mb-4">
            This is a simple demonstration of a login/register system using React, Express, MySQL, and JWT.
          </p>
          <p>
            {!isLoggedIn ? 
              "Please login or register to access your dashboard." : 
              "You're logged in! Check out your dashboard."}
          </p>
        </main>
      </div>
    </div>
  );
};

export default Home;
