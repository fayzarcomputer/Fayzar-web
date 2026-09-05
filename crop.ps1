Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\Admin\.gemini\antigravity-ide\brain\f8605eba-179f-4243-a8cf-b40d90fb73c5\.user_uploaded\media_1788599171121.png"
$src = [System.Drawing.Bitmap]::FromFile($imgPath)
$w = $src.Width
$h = $src.Height
$cropX = [int]($w * 0.52)
$cropW = $w - $cropX
$cropRect = New-Object System.Drawing.Rectangle($cropX, 0, $cropW, $h)
$dest = $src.Clone($cropRect, $src.PixelFormat)
$outPath = "C:\Users\Admin\.gemini\antigravity-ide\scratch\handwritten_only.png"
$dest.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Dispose()
$src.Dispose()
Write-Host "Done cropping: $cropW x $h"
