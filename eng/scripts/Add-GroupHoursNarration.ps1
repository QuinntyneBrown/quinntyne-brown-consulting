param(
    [Parameter(Mandatory)][string]$Ffmpeg,
    [string]$Voice = 'Microsoft Zira Desktop'
)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path "$PSScriptRoot/../..").Path
$run = Join-Path $repo "artifacts/narration-runs/$([Guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory -Path $run -Force | Out-Null
$script = Get-Content -Raw "$repo/docs/demo/workboard-group-hours.narration.json" | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$synth = [System.Speech.Synthesis.SpeechSynthesizer]::new()
$format = [System.Speech.AudioFormat.SpeechAudioFormatInfo]::new(48000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
try {
    $synth.SelectVoice($Voice)
    $synth.Volume = 100
    $index = 0
    foreach ($segment in $script.segments) {
        $file = Join-Path $run ('line-{0:d2}.wav' -f $index)
        # A measured rate of one keeps the brief sentences within their visual scenes.
        $synth.Rate = 1
        $synth.SetOutputToWaveFile($file, $format)
        $synth.Speak($segment.text)
        $synth.SetOutputToNull()
        $index++
    }
} finally { $synth.Dispose() }
& python "$PSScriptRoot/Mix-GroupHoursNarration.py" --run $run --ffmpeg (Resolve-Path $Ffmpeg).Path --voice $Voice
if ($LASTEXITCODE -ne 0) { throw "Narration mix failed; see $run" }
Write-Output "Staged narrated video: $run/workboard-group-hours-narrated.webm"
Write-Output 'Review the staged file before copying the verified video and narration report to docs/demo/.'
