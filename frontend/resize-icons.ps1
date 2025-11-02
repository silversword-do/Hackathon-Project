# PowerShell script to resize app icons
# This script will create smaller versions of site-logo.png for Android app icons

$source = "public\site-logo.png"
$targetSizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

if (-not (Test-Path $source)) {
    Write-Host "Error: $source not found!" -ForegroundColor Red
    exit 1
}

# Check if ImageMagick is available
$magick = Get-Command magick -ErrorAction SilentlyContinue

if (-not $magick) {
    Write-Host "ImageMagick not found. Please install it or manually resize icons." -ForegroundColor Yellow
    Write-Host "You can install it with: choco install imagemagick" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternatively, you can manually resize site-logo.png using an image editor:" -ForegroundColor Yellow
    foreach ($size in $targetSizes.GetEnumerator()) {
        Write-Host "  $($size.Key): $($size.Value)x$($size.Value) pixels" -ForegroundColor Cyan
    }
    exit 0
}

Write-Host "Resizing app icons..." -ForegroundColor Green

foreach ($size in $targetSizes.GetEnumerator()) {
    $targetDir = "android\app\src\main\res\$($size.Key)"
    $targetSize = $size.Value
    
    if (-not (Test-Path $targetDir)) {
        Write-Host "Creating directory: $targetDir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    # Create icon with padding to ensure it fits well
    $padding = [math]::Round($targetSize * 0.1) # 10% padding
    $iconSize = $targetSize - ($padding * 2)
    
    $targets = @(
        "$targetDir\ic_launcher.png",
        "$targetDir\ic_launcher_foreground.png",
        "$targetDir\ic_launcher_round.png"
    )
    
    foreach ($target in $targets) {
        Write-Host "Creating $target ($targetSize x $targetSize)..." -ForegroundColor Cyan
        & magick convert $source -resize "${iconSize}x${iconSize}" -gravity center -extent "${targetSize}x${targetSize}" -background transparent $target
    }
}

Write-Host "Done! App icons have been resized." -ForegroundColor Green

