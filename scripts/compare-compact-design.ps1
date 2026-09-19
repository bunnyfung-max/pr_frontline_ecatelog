# Preserve both captures; normalize only the small scrollbar-related frame difference.
Add-Type -AssemblyName System.Drawing
$projectDir = Split-Path -Parent $PSScriptRoot
$before = [System.Drawing.Image]::FromFile((Join-Path $projectDir 'qa/compact-home-before.png'))
$after = [System.Drawing.Image]::FromFile((Join-Path $projectDir 'qa/compact-home-after.png'))
$frameWidth = $after.Width
$frameHeight = $after.Height
$comparison = [System.Drawing.Bitmap]::new($frameWidth * 2 + 20, $frameHeight + 36)
$graphics = [System.Drawing.Graphics]::FromImage($comparison)
$font = [System.Drawing.Font]::new('Arial', 14)
try {
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawString('Before: oversized layout at 16:9', $font, [System.Drawing.Brushes]::Black, 10, 5)
    $graphics.DrawString('After: compact layout at 16:9', $font, [System.Drawing.Brushes]::Black, $frameWidth + 30, 5)
    $graphics.DrawImage($before, [System.Drawing.Rectangle]::new(0, 36, $frameWidth, $frameHeight))
    $graphics.DrawImage($after, [System.Drawing.Rectangle]::new($frameWidth + 20, 36, $frameWidth, $frameHeight))
    $comparison.Save((Join-Path $projectDir 'qa/compact-home-comparison.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    $focus = [System.Drawing.Bitmap]::new(2020, 206)
    $focusGraphics = [System.Drawing.Graphics]::FromImage($focus)
    try {
        $focusGraphics.Clear([System.Drawing.Color]::White)
        $focusGraphics.DrawString('Before: search control (original pixels)', $font, [System.Drawing.Brushes]::Black, 10, 5)
        $focusGraphics.DrawString('After: search control (original pixels)', $font, [System.Drawing.Brushes]::Black, 1030, 5)
        $focusGraphics.DrawImage($before, [System.Drawing.Rectangle]::new(0, 36, 1000, 170), [System.Drawing.Rectangle]::new(40, 260, 1000, 170), [System.Drawing.GraphicsUnit]::Pixel)
        $focusGraphics.DrawImage($after, [System.Drawing.Rectangle]::new(1020, 36, 1000, 170), [System.Drawing.Rectangle]::new(40, 145, 1000, 170), [System.Drawing.GraphicsUnit]::Pixel)
        $focus.Save((Join-Path $projectDir 'qa/compact-controls-comparison.png'), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $focusGraphics.Dispose()
        $focus.Dispose()
    }
    Write-Output "Before $($before.Width)x$($before.Height); after $($after.Width)x$($after.Height); comparison $($comparison.Width)x$($comparison.Height)"
} finally {
    $font.Dispose()
    $graphics.Dispose()
    $comparison.Dispose()
    $before.Dispose()
    $after.Dispose()
}
