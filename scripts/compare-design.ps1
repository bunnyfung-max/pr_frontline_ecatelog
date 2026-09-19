# Compare captured browser pixels to the approved reference at a common CSS viewport.
Add-Type -AssemblyName System.Drawing
$projectDir = Split-Path -Parent $PSScriptRoot
$reference = [System.Drawing.Image]::FromFile((Join-Path $projectDir 'docs/design/search-home-approved.png'))
$actual = [System.Drawing.Image]::FromFile((Join-Path $projectDir 'qa/search-home-tablet.png'))
$comparison = [System.Drawing.Bitmap]::new(1688, 1230)
$graphics = [System.Drawing.Graphics]::FromImage($comparison)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$font = [System.Drawing.Font]::new('Arial', 14)
$graphics.DrawString('Approved reference (normalized)', $font, [System.Drawing.Brushes]::Black, 10, 5)
$graphics.DrawString('Browser implementation', $font, [System.Drawing.Brushes]::Black, 864, 5)
$graphics.DrawImage($reference, [System.Drawing.Rectangle]::new(0, 36, 834, 1194))
$graphics.DrawImage($actual, [System.Drawing.Rectangle]::new(854, 36, 834, 1194))
$comparison.Save((Join-Path $projectDir 'qa/search-home-comparison.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$focus = $comparison.Clone([System.Drawing.Rectangle]::new(0, 350, 1688, 320), $comparison.PixelFormat)
$focus.Save((Join-Path $projectDir 'qa/search-controls-comparison.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output "Source $($reference.Width)x$($reference.Height); implementation $($actual.Width)x$($actual.Height); comparison 1688x1230"
$focus.Dispose()
$font.Dispose()
$graphics.Dispose()
$comparison.Dispose()
$actual.Dispose()
$reference.Dispose()
