Add-Type -AssemblyName System.Drawing

$source = "C:\Users\ADMIN\.gemini\antigravity-ide\brain\b568ba90-e00d-41f3-8a02-06a51fae6dc9\pwa_icon_1780037287993.png"
$destDir = "d:\fishing saas\public\icons"

if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Output "Created icons directory: $destDir"
}

function Resize-Image {
    param(
        [string]$SourcePath,
        [string]$DestPath,
        [int]$Width,
        [int]$Height
    )
    $srcImg = [System.Drawing.Image]::FromFile($SourcePath)
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    
    $g.DrawImage($srcImg, 0, 0, $Width, $Height)
    $bmp.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $srcImg.Dispose()
}

Resize-Image -SourcePath $source -DestPath "$destDir\icon-192x192.png" -Width 192 -Height 192
Write-Output "Created icon-192x192.png successfully!"

Resize-Image -SourcePath $source -DestPath "$destDir\icon-512x512.png" -Width 512 -Height 512
Write-Output "Created icon-512x512.png successfully!"
