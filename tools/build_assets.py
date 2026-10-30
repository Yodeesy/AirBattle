import os
import sys
import json
import subprocess
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parent.parent
LEGACY_DIR = PROJECT_ROOT / "_legacy"
ASSETS_OUT = PROJECT_ROOT / "public" / "assets"
FFMPEG_EXE = PROJECT_ROOT / "node_modules" / "ffmpeg-static" / "ffmpeg.exe"

def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)

def merge_mask(color_path: Path, mask_path: Path) -> Image.Image:
    color_img = Image.open(color_path).convert("RGBA")
    mask_img = Image.open(mask_path).convert("L")
    if mask_img.size != color_img.size:
        mask_img = mask_img.resize(color_img.size, Image.Resampling.LANCZOS)
    
    # Check corner luminance to determine transparency direction
    # In EasyX NOTSRCERASE + SRCINVERT:
    # Corner of mask image is typically background.
    corner_pixel = mask_img.getpixel((0, 0))
    is_corner_white = corner_pixel > 128
    
    # If corner is white, then white is background -> transparent (alpha = 255 - mask)
    # If corner is black, then black is background -> transparent (alpha = mask)
    mask_data = mask_img.load()
    color_data = color_img.load()
    w, h = color_img.size
    
    for y in range(h):
        for x in range(w):
            r, g, b, _ = color_data[x, y]
            m = mask_data[x, y]
            alpha = (255 - m) if is_corner_white else m
            color_data[x, y] = (r, g, b, alpha)
            
    return color_img

def process_common_sprites():
    print("[1/4] Processing player, enemy, and UI sprites...")
    common_in = LEGACY_DIR / "images" / "common"
    common_out = ASSETS_OUT / "sprites" / "common"
    ensure_dir(common_out)
    
    for f in common_in.iterdir():
        if not f.is_file():
            continue
        if "_mask" in f.name:
            continue
        if f.suffix.lower() not in [".png", ".jpg"]:
            continue
            
        base_name = f.stem
        mask_candidate = common_in / f"{base_name}_mask.png"
        dest_png = common_out / f"{base_name}.png"
        
        if mask_candidate.exists():
            img = merge_mask(f, mask_candidate)
            img.save(dest_png, "PNG")
        else:
            img = Image.open(f).convert("RGBA")
            img.save(dest_png, "PNG")
            
    print(f" -> Common sprites saved to {common_out}")

def process_explosions():
    print("[2/4] Packing explosion sprite sheets (Boom1..4)...")
    boom_in = LEGACY_DIR / "images" / "boom"
    sprites_out = ASSETS_OUT / "sprites"
    ensure_dir(sprites_out)
    
    # 1. Boom1 (4 frames, ~50x50)
    b1_frames = []
    for i in range(1, 5):
        c = boom_in / "boom1" / f"boom{i}.png"
        m = boom_in / "boom1" / f"boom{i}_mask.png"
        if m.exists():
            b1_frames.append(merge_mask(c, m))
        else:
            b1_frames.append(Image.open(c).convert("RGBA"))
            
    # Pack boom1 horizontally
    b1_w = sum(img.width for img in b1_frames)
    b1_h = max(img.height for img in b1_frames)
    sheet_b1 = Image.new("RGBA", (b1_w, b1_h), (0, 0, 0, 0))
    curr_x = 0
    b1_json_frames = {}
    for idx, img in enumerate(b1_frames):
        sheet_b1.paste(img, (curr_x, 0))
        b1_json_frames[f"boom1_{idx}"] = {
            "frame": {"x": curr_x, "y": 0, "w": img.width, "h": img.height},
            "sourceSize": {"w": img.width, "h": img.height}
        }
        curr_x += img.width
    sheet_b1.save(sprites_out / "boom_small.png")
    with open(sprites_out / "boom_small.json", "w", encoding="utf-8") as fp:
        json.dump({
            "frames": b1_json_frames,
            "animations": {"boom_small": [f"boom1_{i}" for i in range(len(b1_frames))]},
            "meta": {"image": "boom_small.png"}
        }, fp, indent=2)

    # 2. Boom2 (8 frames, ~99x100)
    b2_frames = []
    for i in range(8):
        c = boom_in / "boom2" / f"frame_{i}_delay-0.1s.png"
        m = boom_in / "boom2" / f"frame_{i}_delay-0.1s_mask.png"
        if c.exists():
            if m.exists():
                b2_frames.append(merge_mask(c, m))
            else:
                b2_frames.append(Image.open(c).convert("RGBA"))
                
    b2_w = sum(img.width for img in b2_frames)
    b2_h = max(img.height for img in b2_frames)
    sheet_b2 = Image.new("RGBA", (b2_w, b2_h), (0, 0, 0, 0))
    curr_x = 0
    b2_json_frames = {}
    for idx, img in enumerate(b2_frames):
        sheet_b2.paste(img, (curr_x, 0))
        b2_json_frames[f"boom2_{idx}"] = {
            "frame": {"x": curr_x, "y": 0, "w": img.width, "h": img.height},
            "sourceSize": {"w": img.width, "h": img.height}
        }
        curr_x += img.width
    sheet_b2.save(sprites_out / "boom_medium.png")
    with open(sprites_out / "boom_medium.json", "w", encoding="utf-8") as fp:
        json.dump({
            "frames": b2_json_frames,
            "animations": {"boom_medium": [f"boom2_{i}" for i in range(len(b2_frames))]},
            "meta": {"image": "boom_medium.png"}
        }, fp, indent=2)

    # 3. Boom4 (29 frames Boss Explosion, key out black bg)
    b4_frames = []
    for i in range(29):
        c = boom_in / "boom4" / f"frame_{i:02d}_delay-0.04s.png"
        if c.exists():
            img = Image.open(c).convert("RGBA")
            # Key out pure black
            data = img.load()
            w, h = img.size
            for y in range(h):
                for x in range(w):
                    r, g, b, _ = data[x, y]
                    lum = max(r, g, b)
                    if lum < 15:
                        data[x, y] = (0, 0, 0, 0)
                    elif lum > 150:
                        data[x, y] = (r, g, b, 255)
                    else:
                        data[x, y] = (r, g, b, lum)
            b4_frames.append(img)
            
    # Grid pack for Boss boom (e.g. 5 columns x 6 rows)
    cols = 6
    rows = (len(b4_frames) + cols - 1) // cols
    fw, fh = b4_frames[0].width, b4_frames[0].height
    sheet_b4 = Image.new("RGBA", (fw * cols, fh * rows), (0, 0, 0, 0))
    b4_json_frames = {}
    for idx, img in enumerate(b4_frames):
        gx = (idx % cols) * fw
        gy = (idx // cols) * fh
        sheet_b4.paste(img, (gx, gy))
        b4_json_frames[f"boom_boss_{idx}"] = {
            "frame": {"x": gx, "y": gy, "w": fw, "h": fh},
            "sourceSize": {"w": fw, "h": fh}
        }
    sheet_b4.save(sprites_out / "boom_boss.png")
    with open(sprites_out / "boom_boss.json", "w", encoding="utf-8") as fp:
        json.dump({
            "frames": b4_json_frames,
            "animations": {"boom_boss": [f"boom_boss_{i}" for i in range(len(b4_frames))]},
            "meta": {"image": "boom_boss.png"}
        }, fp, indent=2)
    print(" -> Explosion sprite sheets generated.")

def process_music():
    print("[3/4] Copying and organizing audio files...")
    music_in = LEGACY_DIR / "music"
    music_out = ASSETS_OUT / "music"
    ensure_dir(music_out)
    
    for f in music_in.iterdir():
        if f.suffix.lower() == ".mp3":
            # Clean safe ASCII filename
            safe_name = "".join(c if (c.isalnum() or c in "._-") else "_" for c in f.name).lower()
            dest = music_out / safe_name
            with open(f, "rb") as rf, open(dest, "wb") as wf:
                wf.write(rf.read())
            print(f" -> Audio: {f.name} => {safe_name}")

def convert_sequence_to_video(pattern_path: str, fps: int, out_mp4: Path):
    ensure_dir(out_mp4.parent)
    print(f" -> Encoding sequence {pattern_path} to {out_mp4.name} (fps={fps})...")
    cmd = [
        str(FFMPEG_EXE),
        "-y",
        "-framerate", str(fps),
        "-i", str(pattern_path),
        "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "22",
        "-preset", "fast",
        str(out_mp4)
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if res.returncode != 0:
        print(f"Failed to encode {out_mp4.name}: {res.stderr.decode('utf-8', errors='ignore')}")
    else:
        size_mb = out_mp4.stat().st_size / 1024 / 1024
        print(f" -> SUCCESS: {out_mp4.name} generated ({size_mb:.2f} MB)")

def process_videos():
    print("[4/4] Transcoding cutscene frame sequences to MP4 videos...")
    vids_out = ASSETS_OUT / "videos"
    ensure_dir(vids_out)
    
    # 1. Tiga1 (233 frames, 25 fps)
    tiga1_pattern = str(LEGACY_DIR / "images" / "Tiga1" / "frame_%03d_delay-0.04s.png")
    convert_sequence_to_video(tiga1_pattern, 25, vids_out / "tiga1.mp4")
    
    # 2. Tiga2 (254 frames, 10 fps)
    tiga2_pattern = str(LEGACY_DIR / "images" / "Tiga2" / "frame_%03d_delay-0.1s.png")
    convert_sequence_to_video(tiga2_pattern, 10, vids_out / "tiga2.mp4")
    
    # 3. L4 dynamic level background (134 frames, 30 fps)
    l4_pattern = str(LEGACY_DIR / "images" / "common" / "L4" / "frame_%03d_delay-0.03s.png")
    convert_sequence_to_video(l4_pattern, 30, vids_out / "bg_l4.mp4")
    
    # 4. Yodeeshi Logo (150 frames, 25 fps)
    logo_pattern = str(LEGACY_DIR / "images" / "Yodeeshi" / "logo" / "frame_%03d_delay-0.03s.png")
    convert_sequence_to_video(logo_pattern, 25, vids_out / "logo.mp4")

    # 5. Story illustrations
    story_in = LEGACY_DIR / "images" / "story"
    story_out = ASSETS_OUT / "story"
    ensure_dir(story_out)
    for f in story_in.iterdir():
        if f.is_file() and f.suffix.lower() in [".jpg", ".png"]:
            dest = story_out / f"{f.stem}.png"
            Image.open(f).convert("RGBA").save(dest, "PNG")

if __name__ == "__main__":
    print("=== STARTING AIRBATTLE ASSET PIPELINE (PYTHON) ===")
    process_common_sprites()
    process_explosions()
    process_music()
    process_videos()
    print("=== PIPELINE EXECUTION COMPLETED ===")
