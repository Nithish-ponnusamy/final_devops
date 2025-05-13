// router.js
import React, { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import Dashboard from './components/Dashboard';
import SocialBuzz from './components/SocialBuzz';
import Chatbot from './components/Chatbot';
import Analysis from './components/Analysis';
import TwitterEngagement from './components/TwitterEngagement';
import YoutubeDashboard from './components/YoutubeDashboard';
import Login from './components/Login';
import SignUp from './components/Signup';
import Layout from './components/Layout'; // ✅ Shared header + footer layout

// Auth wrapper
const ProtectedRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  return token ? element : <Navigate to="/login" />;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/social-buzz', element: <SocialBuzz /> },
      { path: '/chatbot', element: <Chatbot /> },
      { path: '/twitter-engagement', element: <TwitterEngagement /> },
      { path: '/youtube-dashboard', element: <YoutubeDashboard /> },
      { path: '/analysis', element: <ProtectedRoute element={<Analysis />} /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <SignUp /> },
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

export default router;
