import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation();

  return (
    <>
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

      <main className="container mx-auto mt-8 px-4">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto text-center">
          <p>&copy; 2024 Social Media Dashboard Analyzer. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Layout;
