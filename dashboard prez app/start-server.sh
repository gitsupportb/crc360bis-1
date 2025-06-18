#!/bin/bash

echo ""
echo "🏦 BCP Securities Services - Local Development Server"
echo "===================================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python is not installed or not in PATH"
        echo "💡 Please install Python 3.x"
        echo ""
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "🐍 Python found, starting server..."
echo ""

# Start the Python server
$PYTHON_CMD serve.py

echo ""
echo "👋 Server stopped"
