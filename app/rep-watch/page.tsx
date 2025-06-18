"use client";

import { useEffect } from "react";

export default function RepWatchPage() {
  useEffect(() => {
    // Redirect to the comprehensive reporting dashboard
    window.location.href = '/rep-watch-dashboard.html';
  }, []);

  // Show a loading message while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Rep Watch Dashboard</h2>
        <p className="text-gray-600">Redirecting to the comprehensive reporting interface...</p>
      </div>
    </div>
  );
}
