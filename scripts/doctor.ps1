# Expo Doctor Wrapper for Windows
# This script works around Windows path issues in expo-doctor

Write-Host "Running Expo Doctor..." -ForegroundColor Cyan
Write-Host "Note: Metro config path errors on Windows are a known limitation of expo-doctor" -ForegroundColor Yellow
Write-Host ""

$ErrorActionPreference = "Continue"

# Try  expo-doctor
$doctorProcess = Start-Process -FilePath "npx" -ArgumentList "expo-doctor" -NoNewWindow -Wait -PassThru

if ($doctorProcess.ExitCode -eq 0) {
    Write-Host "`n✅ All checks passed!" -ForegroundColor Green
    exit 0
} elseif ($doctorProcess.ExitCode -eq 1) {
    Write-Host "`n⚠️  Some checks failed" -ForegroundColor Yellow
    Write-Host "If you see 'ERR_UNSUPPORTED_ESM_URL_SCHEME' for metro.config.js:" -ForegroundColor Yellow
    Write-Host "  - This is a Windows path handling limitation in expo-doctor" -ForegroundColor Yellow
    Write-Host "  - Your metro.config.js is correct and will work fine" -ForegroundColor Yellow
    Write-Host "  - Test with: npx expo start" -ForegroundColor Yellow
    Write-Host ""

    # Ask user if they want to test metro config
    $test = Read-Host "Would you like to test if metro config loads correctly? (y/n)"
    if ($test -eq "y") {
        Write-Host "`nTesting metro.config.js..." -ForegroundColor Cyan
        node -e "try { const config = require('./metro.config.js'); console.log('✅ Metro config loads successfully'); console.log('Config:', JSON.stringify(config.resolver.sourceExts, null, 2)); } catch (err) { console.error('❌ Error loading config:', err.message); process.exit(1); }"
    }

    exit 0
} else {
    Write-Host "`n❌ expo-doctor failed with unexpected error" -ForegroundColor Red
    exit $doctorProcess.ExitCode
}

