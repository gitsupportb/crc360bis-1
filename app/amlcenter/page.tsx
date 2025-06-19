"use client";

import { useEffect } from 'react';

export default function AMLCenterPage() {
  useEffect(() => {
    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDevelopment) {
      // In development, redirect to the integrated server
      window.location.replace('http://localhost:3000/amlcenter');
    } else {
      // In production, use the API route that renders the EJS template
      window.location.replace('/api/aml/render-page');
    }
  }, []);

  // Show loading while redirecting
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
