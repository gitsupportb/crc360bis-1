@echo off
echo.
echo ========================================
echo   BCP Securities Services Dashboard
echo   File Listing Refresh Tool
echo ========================================
echo.

echo 🔄 Refreshing file listing...
python generate-file-listing.py

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ File listing updated successfully!
    echo 📋 You can now refresh the dashboard to see updated files.
    echo.
    echo 💡 To see changes in the dashboard:
    echo    1. Open complete_dashboard.html
    echo    2. Go to File Browser tab
    echo    3. Click the Refresh button
    echo.
) else (
    echo.
    echo ❌ Error updating file listing!
    echo Please check that Python is installed and the script is working.
    echo.
)

pause
