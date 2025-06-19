"use client";

import { useEffect, useState } from 'react';

export default function AMLCenterPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      // In development, the integrated server handles /amlcenter directly
      // But we need to avoid infinite redirect, so check if we're already on the right path
      if (window.location.pathname === '/amlcenter' && !window.location.search) {
        // We're on the Next.js page, redirect to the Express route
        window.location.replace('http://localhost:3000/amlcenter');
      }
    } else {
      // In production, we need to handle this differently
      // For now, show an error message explaining the situation
      setError('AML Center requires the integrated server to be running. Please contact your administrator.');
      setIsLoading(false);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold mb-4">AML Center</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            The AML Center requires the full Express.js server to be running with all its features including:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-4">
            <li>• PDF and XML file processing</li>
            <li>• Excel matching algorithms</li>
            <li>• Database operations</li>
            <li>• File upload handling</li>
          </ul>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Show loading while redirecting in development
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🛡️</div>
        <h1 className="text-2xl font-bold mb-2">AML Center</h1>
        <p className="text-gray-600 mb-4">Loading AML Center...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
