import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
