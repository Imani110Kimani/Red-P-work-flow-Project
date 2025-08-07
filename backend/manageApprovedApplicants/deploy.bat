@echo off
REM Deployment script for manageApprovedApplicants Azure Function
REM Usage: deploy.bat [function-app-name]

if "%1"=="" (
    echo Usage: deploy.bat [function-app-name]
    echo Example: deploy.bat redp-student-management
    exit /b 1
)

set FUNCTION_APP_NAME=%1

echo ====================================
echo Deploying to Azure Function App: %FUNCTION_APP_NAME%
echo ====================================

echo.
echo 1. Installing dependencies...
pip install -r requirements.txt

echo.
echo 2. Publishing function to Azure...
func azure functionapp publish %FUNCTION_APP_NAME%

echo.
echo ====================================
echo Deployment completed!
echo ====================================
echo.
echo Your functions are now available at:
echo - https://%FUNCTION_APP_NAME%.azurewebsites.net/api/initStudent
echo - https://%FUNCTION_APP_NAME%.azurewebsites.net/api/populateStudent
echo.
echo Remember to configure the AZURE_STORAGE_CONNECTION_STRING environment variable
echo in your Azure Function App settings if not already done.
echo.
pause
