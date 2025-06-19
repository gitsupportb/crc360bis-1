"use client";

import { useEffect } from 'react';

export default function AMLCenterPage() {
  useEffect(() => {
    // In development, redirect to the Express server
    if (process.env.NODE_ENV === 'development') {
      window.location.href = 'http://localhost:3001/amlcenter';
    }
  }, []);

  // For production, show the AML Center interface directly
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🛡️</div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AML Center</h1>
                  <p className="text-sm text-gray-600">Sanctions List Matching Tool</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  ← Back to Main Menu
                </a>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Upload Sanctions Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-xl mr-3">📤</div>
                <h2 className="text-lg font-semibold">Upload Sanctions Data</h2>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm text-gray-600 mb-3">PDF Format</p>
                  <p className="text-xs text-gray-500 mb-3">Click to select UN Sanctions PDF</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Upload PDF File
                  </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm text-gray-600 mb-3">XML Format</p>
                  <p className="text-xs text-gray-500 mb-3">Click to select UN Sanctions XML</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Upload XML File
                  </button>
                </div>
              </div>
            </div>

            {/* Match with Excel Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-xl mr-3">🔍</div>
                <h2 className="text-lg font-semibold">Match with Excel Data</h2>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">⚠️</div>
                  <div>
                    <p className="font-medium text-yellow-800">Sanctions Data Required</p>
                    <p className="text-sm text-yellow-700">Please upload sanctions data first to enable matching.</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center opacity-50">
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm text-gray-600 mb-3">Excel File Upload</p>
                <p className="text-xs text-gray-500 mb-3">Upload Excel file with names to match</p>
                <button className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
                  Select Excel File
                </button>
              </div>
            </div>

            {/* Search Functionality */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-xl mr-3">🔎</div>
                <h2 className="text-lg font-semibold">Search Database</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Search across all fields..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Filter by ID"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Filter by name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Search
                </button>
              </div>
            </div>

            {/* View Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-xl mr-3">📊</div>
                <h2 className="text-lg font-semibold">View Data</h2>
              </div>

              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-600 mb-2">No sanctions data loaded</p>
                <p className="text-sm text-gray-500">Upload PDF or XML files to view data here</p>
              </div>
            </div>

          </div>

          {/* Additional Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Client Space */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-xl mr-3">👥</div>
                <h2 className="text-lg font-semibold">Client Space</h2>
              </div>

              <p className="text-gray-600 mb-4">Upload client risk assessment data for analysis</p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-3xl mb-2">📈</div>
                <p className="text-sm text-gray-600 mb-3">Risk Assessment Upload</p>
                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Upload Client Data
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="text-xl mr-3">📈</div>
                <h2 className="text-lg font-semibold">Statistics</h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sanctions Entries:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-semibold">Never</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Matches Found:</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // For development mode, show loading message while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🛡️</div>
        <h1 className="text-2xl font-bold mb-2">AML Center</h1>
        <p className="text-gray-600 mb-4">Redirecting to development server...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
