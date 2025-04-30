import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SocialBuzz from './components/SocialBuzz';
import Chatbot from './components/Chatbot';
import Analysis from './components/Analysis';
import TwitterEngagement from './components/TwitterEngagement';
import YoutubeDashboard from './components/YoutubeDashboard';
import Login from './components/Login'; 
import SignUp from './components/Signup'; 
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if there's a token on load to verify if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);  // Set authentication status based on token
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />

        <main className="container mx-auto mt-8 px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/social-buzz" element={<SocialBuzz />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/twitter-engagement" element={<TwitterEngagement />} />
            <Route path="/youtube-dashboard" element={<YoutubeDashboard />} />
            <Route 
              path="/analysis" 
              element={isAuthenticated ? <Analysis setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
            />
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white py-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2024 Social Media Dashboard Analyzer. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Header() {
  const location = useLocation();  // Using useLocation() inside the component that has Router context

  return (
    <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Social Media Dashboard Analyzer</h1>
        <nav>
          <ul className="flex justify-center space-x-8">
            <li>
              <Link
                to="/"
                className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                  location.pathname === '/' ? 'text-yellow-300' : ''
                }`}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/analysis"
                className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                  location.pathname === '/analysis' ? 'text-yellow-300' : ''
                }`}
              >
                Analysis
              </Link>
            </li>
            <li>
              <Link
                to="/social-buzz"
                className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                  location.pathname === '/social-buzz' ? 'text-yellow-300' : ''
                }`}
              >
                Social Buzz
              </Link>
            </li>
            <li>
              <Link
                to="/chatbot"
                className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                  location.pathname === '/chatbot' ? 'text-yellow-300' : ''
                }`}
              >
                Ask AI
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default App;
