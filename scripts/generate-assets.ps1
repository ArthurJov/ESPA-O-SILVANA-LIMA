Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot '..\public\images'
$folders = @('hero', 'procedures', 'experience', 'about', 'textures', 'og')
foreach ($folder in $folders) {
  $path = Join-Path $root $folder
  if (-not (Test-Path -LiteralPath $path)) { New-Item -ItemType Directory -Path $path | Out-Null }
}

function C([int]$r, [int]$g, [int]$b, [int]$a = 255) { return [System.Drawing.Color]::FromArgb($a, $r, $g, $b) }

function Save-Scene([string]$name, [int]$width, [int]$height, [scriptblock]$scene) {
  $bitmap = [System.Drawing.Bitmap]::new($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  & $scene $graphics $width $height
  $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
  $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
  $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]92)
  $bitmap.Save((Join-Path $root $name), $encoder, $parameters)
  $parameters.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

function Gradient($g, $w, $h, $top, $bottom) {
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Rectangle]::new(0, 0, $w, $h), $top, $bottom, 90)
  $g.FillRectangle($brush, 0, 0, $w, $h); $brush.Dispose()
}

function Add-Grain($g, $w, $h, [int]$seed = 14) {
  $random = [System.Random]::new($seed)
  for ($i = 0; $i -lt [int]($w * $h / 170); $i++) {
    $x = $random.Next(0, $w); $y = $random.Next(0, $h); $alpha = $random.Next(5, 20)
    $brush = [System.Drawing.SolidBrush]::new((C 255 248 235 $alpha)); $g.FillRectangle($brush, $x, $y, 1, 1); $brush.Dispose()
  }
}

function Draw-Figure($g, $w, $h, [bool]$portrait = $false) {
  $skin = [System.Drawing.SolidBrush]::new((C 182 122 98)); $fabric = [System.Drawing.SolidBrush]::new((C 235 222 204)); $shadow = [System.Drawing.SolidBrush]::new((C 91 57 49 100))
  $cx = if ($portrait) { [int]($w * .54) } else { [int]($w * .73) }
  $head = if ($portrait) { [int]($h * .18) } else { [int]($h * .23) }
  $g.FillEllipse($shadow, $cx - $head, [int]($h * .11), $head * 2, $head * 2)
  $g.FillEllipse($skin, $cx - [int]($head * .72), [int]($h * .13), [int]($head * 1.44), [int]($head * 1.72))
  $shoulder = [System.Drawing.Point[]]@([System.Drawing.Point]::new($cx - [int]($w*.22), [int]($h*.98)), [System.Drawing.Point]::new($cx - [int]($w*.11), [int]($h*.43)), [System.Drawing.Point]::new($cx + [int]($w*.16), [int]($h*.43)), [System.Drawing.Point]::new($cx + [int]($w*.28), [int]($h*.98)))
  $g.FillPolygon($fabric, $shoulder)
  $pen = [System.Drawing.Pen]::new((C 140 91 70 130), [Math]::Max(2, [int]($w / 500)))
  $g.DrawArc($pen, $cx - [int]($w*.28), [int]($h*.52), [int]($w*.48), [int]($h*.65), 185, 145)
  $g.DrawArc($pen, $cx - [int]($w*.13), [int]($h*.53), [int]($w*.34), [int]($h*.56), 190, 145)
  $pen.Dispose(); $skin.Dispose(); $fabric.Dispose(); $shadow.Dispose()
}

function Draw-Hands($g, $w, $h) {
  $skin = [System.Drawing.SolidBrush]::new((C 177 111 88)); $pen = [System.Drawing.Pen]::new((C 120 73 62 170), [Math]::Max(2, [int]($w / 700)))
  $g.FillEllipse($skin, [int]($w*.39), [int]($h*.48), [int]($w*.26), [int]($h*.08))
  $g.FillEllipse($skin, [int]($w*.51), [int]($h*.57), [int]($w*.22), [int]($h*.07))
  for ($i=0; $i -lt 4; $i++) { $g.DrawLine($pen, [int]($w*.41), [int]($h*(.49 + $i*.012)), [int]($w*(.61 - $i*.01)), [int]($h*(.59 - $i*.008))) }
  $pen.Dispose(); $skin.Dispose()
}

function Draw-Botanical($g, $w, $h) {
  $pen = [System.Drawing.Pen]::new((C 113 91 70 145), [Math]::Max(2, [int]($w / 650)))
  $g.DrawBezier($pen, [int]($w*.12), $h, [int]($w*.16), [int]($h*.62), [int]($w*.06), [int]($h*.35), [int]($w*.22), [int]($h*.08))
  for ($i=0; $i -lt 6; $i++) {
    $x = [int]($w * (.13 + $i*.016)); $y = [int]($h * (.76 - $i*.1))
    $g.DrawEllipse($pen, $x, $y, [int]($w*.1), [int]($h*.045))
  }
  $pen.Dispose()
}

Save-Scene 'hero\hero-desktop.jpg' 1920 1080 {
  param($g,$w,$h); Gradient $g $w $h (C 64 43 38) (C 183 143 119); $g.FillRectangle(([System.Drawing.SolidBrush]::new((C 42 30 27 75))), 0, 0, [int]($w*.47), $h); Draw-Figure $g $w $h $false; Draw-Botanical $g $w $h; Add-Grain $g $w $h 21
}
Save-Scene 'hero\hero-mobile.jpg' 900 1200 {
  param($g,$w,$h); Gradient $g $w $h (C 77 48 42) (C 201 163 137); $g.FillRectangle(([System.Drawing.SolidBrush]::new((C 45 31 28 70))), 0, 0, $w, [int]($h*.34)); Draw-Figure $g $w $h $true; Draw-Botanical $g $w $h; Add-Grain $g $w $h 22
}

$scenes = @{
  'procedures\avaliacao.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 232 218 201) (C 171 124 101); Draw-Figure $g $w $h $true; Draw-Hands $g $w $h; Draw-Botanical $g $w $h; Add-Grain $g $w $h 31 }
  'procedures\reducao-360.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 106 72 62) (C 220 183 150); Draw-Hands $g $w $h; $p=[System.Drawing.Pen]::new((C 250 229 199 170),10); $g.DrawArc($p,[int]($w*.2),[int]($h*.2),[int]($w*.62),[int]($h*.62),200,140); $p.Dispose(); Add-Grain $g $w $h 32 }
  'procedures\diastase.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 239 227 214) (C 184 137 113); Draw-Figure $g $w $h $false; Draw-Hands $g $w $h; $p=[System.Drawing.Pen]::new((C 122 76 61 120),5); $g.DrawBezier($p,[int]($w*.28),[int]($h*.78),[int]($w*.43),[int]($h*.58),[int]($w*.6),[int]($h*.88),[int]($w*.77),[int]($h*.62)); $p.Dispose(); Add-Grain $g $w $h 33 }
  'procedures\harmonizacao.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 68 46 43) (C 177 126 105); Draw-Figure $g $w $h $true; $p=[System.Drawing.Pen]::new((C 235 208 181 170),6); $g.DrawRectangle($p,[int]($w*.62),[int]($h*.1),[int]($w*.24),[int]($h*.78)); $p.Dispose(); Add-Grain $g $w $h 34 }
  'procedures\massagem.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 51 37 35) (C 173 122 98); Draw-Hands $g $w $h; Draw-Botanical $g $w $h; $b=[System.Drawing.SolidBrush]::new((C 230 214 190 150)); $g.FillEllipse($b,[int]($w*.73),[int]($h*.13),[int]($w*.12),[int]($h*.12)); $b.Dispose(); Add-Grain $g $w $h 35 }
  'procedures\limpeza-pele.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 244 236 223) (C 194 145 122); Draw-Figure $g $w $h $true; Draw-Hands $g $w $h; $p=[System.Drawing.Pen]::new((C 255 246 222 170),12); $g.DrawArc($p,[int]($w*.1),[int]($h*.1),[int]($w*.26),[int]($h*.26),20,260); $p.Dispose(); Add-Grain $g $w $h 36 }
  'experience\recepcao.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 244 236 223) (C 154 111 91); $wood=[System.Drawing.SolidBrush]::new((C 101 64 51)); $cream=[System.Drawing.SolidBrush]::new((C 231 218 201)); $g.FillRectangle($wood,[int]($w*.1),[int]($h*.68),[int]($w*.8),[int]($h*.12)); $g.FillEllipse($cream,[int]($w*.2),[int]($h*.45),[int]($w*.45),[int]($h*.3)); $g.FillRectangle($wood,[int]($w*.6),[int]($h*.32),[int]($w*.05),[int]($h*.48)); Draw-Botanical $g $w $h; Add-Grain $g $w $h 37 }
  'about\mentoria.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 72 48 44) (C 192 148 122); Draw-Figure $g $w $h $true; $p=[System.Drawing.Pen]::new((C 244 222 197 160),8); $g.DrawLine($p,[int]($w*.1),[int]($h*.72),[int]($w*.88),[int]($h*.72)); $p.Dispose(); Draw-Botanical $g $w $h; Add-Grain $g $w $h 38 }
  'textures\textura-1.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 225 211 191) (C 118 82 69); $p=[System.Drawing.Pen]::new((C 255 242 217 90),5); for($i=0;$i -lt 17;$i++){ $g.DrawBezier($p,0,[int]($h*$i/17),[int]($w*.3),[int]($h*(($i+2)/17)),[int]($w*.6),[int]($h*(($i-1)/17)), $w,[int]($h*$i/17)) }; $p.Dispose(); Add-Grain $g $w $h 39 }
  'textures\textura-2.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 200 177 148) (C 91 59 51); $p=[System.Drawing.Pen]::new((C 246 223 190 120),6); for($i=0;$i -lt 10;$i++){ $g.DrawEllipse($p,[int]($w*(.08+$i*.08)),[int]($h*(.18+($i%3)*.2)),[int]($w*.28),[int]($h*.18)) }; $p.Dispose(); Add-Grain $g $w $h 40 }
  'og\og-image.jpg' = { param($g,$w,$h); Gradient $g $w $h (C 50 34 31) (C 151 104 88); Draw-Figure $g $w $h $false; Draw-Botanical $g $w $h; Add-Grain $g $w $h 41 }
}
foreach ($entry in $scenes.GetEnumerator()) { Save-Scene $entry.Key 1200 800 $entry.Value }
