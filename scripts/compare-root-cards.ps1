# Normalize the supplied ~110% screenshot to the existing 1048 CSS-pixel grid.
Add-Type -AssemblyName System.Drawing
$projectDir = Split-Path -Parent $PSScriptRoot
$reference = [System.Drawing.Bitmap]::FromFile((Join-Path $projectDir 'docs/design/root-cards-reference.png'))
$rootPage = [System.Drawing.Bitmap]::FromFile((Join-Path $projectDir 'qa/root-cards-desktop.png'))
$comparison = [System.Drawing.Bitmap]::new(1068, 611)
$graphics = [System.Drawing.Graphics]::FromImage($comparison)
$font = [System.Drawing.Font]::new('Arial', 12)
try {
    $graphics.Clear([System.Drawing.Color]::White)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawString('Reference style (normalized to 1048px grid)', $font, [System.Drawing.Brushes]::Black, 10, 4)
    $graphics.DrawImage($reference, [System.Drawing.Rectangle]::new(10, 28, 1048, 207), [System.Drawing.Rectangle]::new(26, 19, 1153, 227), [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.DrawString('Homepage roots - same card component, five real entrances', $font, [System.Drawing.Brushes]::Black, 10, 243)
    $graphics.DrawImage($rootPage, [System.Drawing.Rectangle]::new(10, 267, 1048, 317), [System.Drawing.Rectangle]::new(108, 438, 1048, 317), [System.Drawing.GraphicsUnit]::Pixel)
    $comparison.Save((Join-Path $projectDir 'qa/root-cards-comparison.png'), [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
    $graphics.Dispose()
    $font.Dispose()
    $reference.Dispose()
    $rootPage.Dispose()
    $comparison.Dispose()
}
