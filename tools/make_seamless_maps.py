import os
import math
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageOps

W, H = 700, 890

def make_seamless_v(im, blend_ratio=0.25):
    im = im.resize((W, H), Image.Resampling.LANCZOS).convert('RGB')
    w, h = W, H
    # Roll by h // 2
    rolled = Image.new('RGB', (w, h))
    rolled.paste(im.crop((0, h // 2, w, h)), (0, 0))
    rolled.paste(im.crop((0, 0, w, h // 2)), (0, h - h // 2))
    
    # In 'rolled', the top (y=0) and bottom (y=h-1) are contiguous from the original middle!
    # The seam is now at y = h // 2.
    # Blend with original 'im' which is continuous at the center!
    blend_h = int(h * blend_ratio)
    mask = Image.new('L', (w, h), 0)
    center = h // 2
    for y in range(max(0, center - blend_h // 2), min(h, center + blend_h // 2)):
        dist = abs(y - center) / (blend_h / 2.0)
        val = int(255 * 0.5 * (1 + math.cos(math.pi * dist)))
        for x in range(w):
            mask.putpixel((x, y), val)
            
    res = Image.composite(im, rolled, mask)
    return res

def create_rlyeh_map():
    # Base stormy oceanic abyss with ancient sunken ruins
    # 1. Start from rich dark stormy sea with reefs (from L5_2 legacy high contrast)
    base_src = Image.open('_legacy/images/common/L5_2.jpg').convert('RGB')
    base = base_src.resize((W, H), Image.Resampling.LANCZOS)
    
    # Boost into dark moody eldritch stormy sea
    enh_color = ImageEnhance.Color(base).enhance(0.8)
    enh_bright = ImageEnhance.Brightness(enh_color).enhance(0.7)
    enh_contrast = ImageEnhance.Contrast(enh_bright).enhance(1.4)
    
    # Add dark storm fog & eerie purple eldritch glow
    storm_overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(storm_overlay)
    
    import random
    random.seed(101)
    for _ in range(40):
        cx = random.randint(50, W - 50)
        cy = random.randint(50, H - 50)
        rx = random.randint(80, 220)
        ry = random.randint(50, 140)
        # Ancient glowing runes and deep water bioluminescence
        sdraw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(40, 15, 65, 35))
        sdraw.ellipse([cx - rx // 2, cy - ry // 2, cx + rx // 2, cy + ry // 2], fill=(15, 45, 80, 40))
        
    storm_overlay = storm_overlay.filter(ImageFilter.GaussianBlur(30))
    blended = Image.alpha_composite(enh_contrast.convert('RGBA'), storm_overlay).convert('RGB')
    
    # Make vertically seamless
    seamless_rlyeh = make_seamless_v(blended, blend_ratio=0.3)
    return seamless_rlyeh

# Process all maps
common_dir = 'public/assets/sprites/common'

# 1. R'lyeh
rlyeh_img = create_rlyeh_map()
rlyeh_path = os.path.join(common_dir, 'L5_2_rlyeh.png')
rlyeh_img.save(rlyeh_path)
print("Saved seamless L5_2_rlyeh.png")

# 2. Make all other stage maps seamlessly tileable
maps_to_tile = [
    'L4_tileable.png',
    'L5_tileable.png',
    'L6_tileable.png',
    'L8.png',
    'L8_2.png'
]

for m in maps_to_tile:
    p = os.path.join(common_dir, m)
    if os.path.exists(p):
        raw = Image.open(p)
        s = make_seamless_v(raw)
        s.save(p)
        print(f"Seamlessly tiled: {m}")

print("All maps processed and seamless!")
