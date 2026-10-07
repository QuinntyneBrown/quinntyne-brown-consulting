"""Place locally synthesized speech on the original, unmodified video timeline."""
import argparse
import array
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import wave

parser = argparse.ArgumentParser()
parser.add_argument('--run', type=Path, required=True)
parser.add_argument('--ffmpeg', type=Path, required=True)
parser.add_argument('--voice', required=True)
args = parser.parse_args()
repo = Path(__file__).resolve().parents[2]
demo = repo / 'docs' / 'demo'
source = demo / 'workboard-group-hours.webm'
script = json.loads((demo / 'workboard-group-hours.narration.json').read_text())
metadata = json.loads((demo / 'workboard-group-hours.chapters.json').read_text())
duration = metadata['duration']
rate = 48000
mix = array.array('h', [0]) * round(duration * rate)
report = {'voice': args.voice, 'speechRate': 1, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'duration': duration, 'segments': []}
for index, segment in enumerate(script['segments']):
    with wave.open(str(args.run / f'line-{index:02}.wav'), 'rb') as clip:
        assert (clip.getframerate(), clip.getnchannels(), clip.getsampwidth()) == (rate, 1, 2)
        samples = array.array('h', clip.readframes(clip.getnframes()))
    if sys.byteorder != 'little':
        samples.byteswap()
    # Trim only the synthesized clip's leading/trailing silence, never its speech.
    nonquiet = [i for i, sample in enumerate(samples) if abs(sample) > 80]
    if not nonquiet:
        raise ValueError(f'Empty narration at segment {index}')
    samples = samples[max(0, nonquiet[0] - 480):min(len(samples), nonquiet[-1] + 2400)]
    seconds = len(samples) / rate
    window = segment['end'] - segment['start']
    if seconds > window:
        raise ValueError(f'Segment {index + 1} needs {seconds:.2f}s but has {window:.2f}s. Shorten its text before rerunning.')
    start = round(segment['start'] * rate)
    end = start + len(samples)
    if end > len(mix) or any(mix[start:end]):
        raise ValueError('Narration overlap or audio outside the video timeline')
    mix[start:end] = samples
    report['segments'].append({**segment, 'spokenDuration': round(seconds, 3), 'spokenEnd': round(segment['start'] + seconds, 3)})

# Normalize the complete speech track to -3 dBFS peak with no dynamic time changes.
peak = max(abs(sample) for sample in mix)
gain = (32767 * 10 ** (-3 / 20)) / peak
mix = array.array('h', (round(sample * gain) for sample in mix))
report['peakDbfs'] = round(20 * math.log10(max(abs(sample) for sample in mix) / 32767), 2)
report['clippedSamples'] = sum(abs(sample) >= 32767 for sample in mix)
audio = args.run / 'narration.wav'
with wave.open(str(audio), 'wb') as output:
    output.setparams((1, 2, rate, len(mix), 'NONE', 'not compressed'))
    if sys.byteorder != 'little':
        mix.byteswap()
    output.writeframes(mix.tobytes())

def ffmpeg(*arguments):
    result = subprocess.run([str(args.ffmpeg), '-hide_banner', '-nostdin', '-y', *map(str, arguments)], capture_output=True, text=True, timeout=90)
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result

video = args.run / 'workboard-group-hours-narrated.webm'
ffmpeg('-i', source, '-i', audio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'libopus', '-b:a', '96k', '-t', duration, '-metadata:s:a:0', 'language=eng', video)
# Decode every frame and audio packet, then prove the original video stream is intact.
ffmpeg('-v', 'error', '-i', video, '-f', 'null', '-')
hashes = []
for item in [source, video]:
    result = ffmpeg('-i', item, '-map', '0:v:0', '-c', 'copy', '-f', 'hash', '-hash', 'sha256', '-')
    hashes.append(result.stdout.strip())
if hashes[0] != hashes[1]:
    raise ValueError('Original video stream changed')
report['videoStreamHash'] = hashes[0]
report['videoStreamUnchanged'] = True
report['outputBytes'] = video.stat().st_size
report['fullDecodePassed'] = True
ffmpeg('-i', video, '-map', '0:a:0', '-ar', rate, '-ac', 1, args.run / 'decoded-narration.wav')
(args.run / 'workboard-group-hours-narrated.verification.json').write_text(json.dumps(report, indent=2) + '\n')
def stamp(seconds):
    return f'{int(seconds // 3600):02}:{int(seconds // 60) % 60:02}:{seconds % 60:06.3f}'

cues = [f"{i + 1}\n{stamp(segment['start'])} --> {stamp(segment['end'])}\n{segment['text']}\n" for i, segment in enumerate(script['segments'])]
(args.run / 'workboard-group-hours-narrated.vtt').write_text('WEBVTT\n\n' + '\n'.join(cues))
print(json.dumps({'segments': len(report['segments']), 'duration': duration, 'videoStreamUnchanged': True, 'output': str(video)}, indent=2))
