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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="text-6xl md:text-7xl mb-8 animate-pulse">🛡️</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 tracking-tight">AML Center</h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed px-2">Loading Anti-Money Laundering compliance system...</p>
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-orange-500"></div>
        </div>
        <div className="text-sm text-gray-500 font-medium">Please wait while we initialize your secure environment</div>
      </div>
    </div>
  );
}
