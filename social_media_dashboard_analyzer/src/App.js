// App.js
import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  Link,
  useLocation
} from "react-router-dom";

import Dashboard from "./components/Dashboard";
import SocialBuzz from "./components/SocialBuzz";
import Chatbot from "./components/Chatbot";
import Analysis from "./components/Analysis";
import TwitterEngagement from "./components/TwitterEngagement";
import YoutubeDashboard from "./components/YoutubeDashboard";
import Login from "./components/Login";
import SignUp from "./components/Signup";

import "./App.css";

// Layout Component (includes Header + Footer)
function Layout({ isAuthenticated, setIsAuthenticated }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-8 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Social Media Dashboard Analyzer
          </h1>
          <nav>
            <ul className="flex justify-center space-x-8">
              <li>
                <Link
                  to="/"
                  className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                    location.pathname === "/" ? "text-yellow-300" : ""
                  }`}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/analysis"
                  className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                    location.pathname === "/analysis" ? "text-yellow-300" : ""
                  }`}
                >
                  Analysis
                </Link>
              </li>
              <li>
                <Link
                  to="/social-buzz"
                  className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                    location.pathname === "/social-buzz" ? "text-yellow-300" : ""
                  }`}
                >
                  Social Buzz
                </Link>
              </li>
              <li>
                <Link
                  to="/chatbot"
                  className={`text-xl font-semibold hover:text-yellow-300 transition-colors ${
                    location.pathname === "/chatbot" ? "text-yellow-300" : ""
                  }`}
                >
                  Ask AI
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto mt-8 px-4">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Social Media Dashboard Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// Protected Route Wrapper
function ProtectedRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const router = createBrowserRouter(
    [
      {
        path: "/",
        element: <Layout isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "social-buzz", element: <SocialBuzz /> },
          { path: "chatbot", element: <Chatbot /> },
          { path: "twitter-engagement", element: <TwitterEngagement /> },
          { path: "youtube-dashboard", element: <YoutubeDashboard /> },
          {
            path: "analysis",
            element: (
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Analysis setIsAuthenticated={setIsAuthenticated} />
              </ProtectedRoute>
            )
          },
          {
            path: "login",
            element: <Login setIsAuthenticated={setIsAuthenticated} />
          },
          {
            path: "signup",
            element: <SignUp />
          }
        ]
      }
    ],
    {
      future: {
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }
    }
  );

  return <RouterProvider router={router} />;
}

export default App;
