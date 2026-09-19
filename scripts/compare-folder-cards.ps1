# Match component width rather than scaling a full desktop screenshot.
Add-Type -AssemblyName System.Drawing
$projectDir = Split-Path -Parent $PSScriptRoot
$reference = [System.Drawing.Image]::FromFile((Join-Path $projectDir 'docs/design/folder-cards-reference.png'))
$page = [System.Drawing.Bitmap]::FromFile((Join-Path $projectDir 'qa/folder-cards-matched-page.png'))
$actual = $page.Clone([System.Drawing.Rectangle]::new(36, 485, 630, 207), $page.PixelFormat)
$actual.Save((Join-Path $projectDir 'qa/folder-cards-matched-grid.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$comparison = [System.Drawing.Bitmap]::new(1280, 246)
$graphics = [System.Drawing.Graphics]::FromImage($comparison)
$font = [System.Drawing.Font]::new('Arial', 13)
try {
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.DrawString('User reference - native card size', $font, [System.Drawing.Brushes]::Black, 0, 4)
    $graphics.DrawString('Implemented cards - same 630px grid width', $font, [System.Drawing.Brushes]::Black, 650, 4)
    $graphics.DrawImage($reference, [System.Drawing.Rectangle]::new(0, 36, 630, 206), [System.Drawing.Rectangle]::new(20, 15, 630, 206), [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.DrawImageUnscaled($actual, 650, 36)
    $comparison.Save((Join-Path $projectDir 'qa/folder-cards-comparison.png'), [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $font.Dispose()
    $graphics.Dispose()
    $comparison.Dispose()
    $actual.Dispose()
    $page.Dispose()
    $reference.Dispose()
}
