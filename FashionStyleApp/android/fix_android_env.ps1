# Script sủa lỗi môi trường Android sau khi chuyển ổ đĩa (C: sang D:)
# Lưu ý: Chạy lệnh này từ thư mục "android"

Write-Host "Set Environment Variables for this session..." -ForegroundColor Green
$env:ANDROID_HOME = "D:\Android\Sdk"
$env:ANDROID_AVD_HOME = "D:\.android\avd"
$env:GRADLE_USER_HOME = "D:\.gradle"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"

Write-Host "Cleaning Project Caches..." -ForegroundColor Cyan
Remove-Item -Path ".gradle", "build", "app/build" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Verifying SDK items..." -ForegroundColor Yellow
$sdkBuildTools = "D:\Android\Sdk\build-tools\35.0.0"
if (Test-Path $sdkBuildTools) {
    Write-Host "Build-Tools 35.0.0 found at $sdkBuildTools"
} else {
    Write-Warning "Build-Tools 35.0.0 NOT found! Please check D:\Android\Sdk\build-tools"
}

Write-Host "Running Gradle Clean..." -ForegroundColor Magenta
.\gradlew.bat clean

Write-Host "Done! Please try 'npm run android' to start your app." -ForegroundColor Green
