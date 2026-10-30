import os
import subprocess

img_dir = os.path.join('_legacy', 'images', 'Yodeeshi', '100y')
files = sorted([f for f in os.listdir(img_dir) if f.endswith('.png')])

list_file = 'temp_sysu_frames.txt'
with open(list_file, 'w', encoding='utf-8') as f:
    frame_dur = f"{11.65 / len(files):.5f}"
    for fname in files:
        full_path = os.path.abspath(os.path.join(img_dir, fname)).replace('\\', '/')
        f.write(f"file '{full_path}'\n")
        f.write(f"duration {frame_dur}\n")
    last_path = os.path.abspath(os.path.join(img_dir, files[-1])).replace('\\', '/')
    f.write(f"file '{last_path}'\n")

ffmpeg_bin = os.path.abspath(os.path.join('node_modules', 'ffmpeg-static', 'ffmpeg.exe'))
out_video = os.path.abspath(os.path.join('public', 'assets', 'videos', 'sysu.mp4'))

cmd = [
    ffmpeg_bin, '-y',
    '-f', 'concat', '-safe', '0', '-i', list_file,
    '-i', os.path.abspath(os.path.join('public', 'assets', 'music', 'sysu.mp3')),
    '-vf', 'scale=700:890',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-shortest',
    out_video
]

print("Compiling sysu.mp4...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("FFmpeg return code:", res.returncode)
if res.returncode != 0:
    print("Error:", res.stderr[-1000:])
else:
    print("Success! Created:", out_video)

if os.path.exists(list_file):
    os.remove(list_file)

# Now build logo.mp4
img_dir_logo = os.path.join('_legacy', 'images', 'Yodeeshi', 'logo')
files_logo = sorted([f for f in os.listdir(img_dir_logo) if f.endswith('.png')])
with open(list_file, 'w', encoding='utf-8') as f:
    for fname in files_logo:
        full_path = os.path.abspath(os.path.join(img_dir_logo, fname)).replace('\\', '/')
        f.write(f"file '{full_path}'\n")
        f.write("duration 0.04\n")
    last_path = os.path.abspath(os.path.join(img_dir_logo, files_logo[-1])).replace('\\', '/')
    f.write(f"file '{last_path}'\n")

out_video_logo = os.path.abspath(os.path.join('public', 'assets', 'videos', 'logo.mp4'))
cmd_logo = [
    ffmpeg_bin, '-y',
    '-f', 'concat', '-safe', '0', '-i', list_file,
    '-vf', 'scale=700:890',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    out_video_logo
]
res_logo = subprocess.run(cmd_logo, capture_output=True, text=True)
print("Logo FFmpeg return code:", res_logo.returncode)
if res_logo.returncode == 0:
    print("Success! Created:", out_video_logo)
if os.path.exists(list_file):
    os.remove(list_file)

