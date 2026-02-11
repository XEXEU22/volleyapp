@echo off
echo ====================================
echo VolleyApp - Installation and Startup
echo ====================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: npm install failed!
        echo Make sure Node.js is installed and in your PATH.
        echo Download from: https://nodejs.org/
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
)

echo Starting VolleyApp...
echo.
echo The app will open at: http://localhost:3000
echo Press Ctrl+C to stop the server.
echo.
npm run dev
pause
