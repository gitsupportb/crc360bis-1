@echo off
echo 🧪 Testing BCP2S Container Services...
echo.

REM Wait for services to start
echo ⏳ Waiting for services to initialize (30 seconds)...
timeout /t 30 >nul

echo 🔍 Testing all services...
echo.

REM Test Main Dashboard
echo Testing Main Dashboard (Port 3000)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:3000/api/health
echo.

REM Test Rep Watch
echo Testing Rep Watch (Port 3010)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:3010/
echo.

REM Test Documents Service
echo Testing Documents Service (Port 3003)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:3003/
echo.

REM Test Calculs Service
echo Testing Calculs Service (Port 3005)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:3005/
echo.

REM Test AML Service
echo Testing AML Service (Port 5000)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:5000/
echo.

REM Test AMMC Service
echo Testing AMMC Service (Port 8080)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:8080/admin/
echo.

REM Test BAM Service
echo Testing BAM Service (Port 8000)...
curl -s -o nul -w "Status: %%{http_code} - Response Time: %%{time_total}s\n" http://localhost:8000/
echo.

echo ✅ Service testing completed!
echo.
echo 📊 Container Status:
docker ps --filter "name=bcp2s"

pause
