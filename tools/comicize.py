import os
import math
from PIL import Image, ImageOps, ImageFilter, ImageEnhance, ImageDraw, ImageFont

STORY_DIR = os.path.join('public', 'assets', 'story')
W, H = 700, 890

def comicize_image(img, title_text="GUTS BRIEFING", issue_tag="EPISODE 05"):
    # 1. Resize/crop into 700x890
    src_w, src_h = img.size
    target_aspect = W / H
    src_aspect = src_w / src_h
    
    if src_aspect > target_aspect:
        # crop sides
        new_w = int(src_h * target_aspect)
        left = (src_w - new_w) // 2
        img = img.crop((left, 0, left + new_w, src_h))
    else:
        # crop top/bottom
        new_h = int(src_w / target_aspect)
        top = (src_h - new_h) // 3  # keep slightly higher than center
        img = img.crop((0, max(0, top), src_w, min(src_h, top + new_h)))
    
    img = img.resize((W, H), Image.Resampling.LANCZOS).convert('RGB')
    
    # 2. Extract ink outlines (American comic inking)
    gray = img.convert('L')
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.invert(edges)
    edges = edges.filter(ImageFilter.SMOOTH_MORE)
    # Threshold for sharp black ink lines
    edges = edges.point(lambda p: 0 if p < 130 else (p if p < 210 else 255))
    
    # 3. Boost color saturation & contrast for vibrant comic ink
    enh_color = ImageEnhance.Color(img).enhance(1.4)
    enh_contrast = ImageEnhance.Contrast(enh_color).enhance(1.25)
    
    # 4. Multiply ink lines over color
    ink_mask = edges.convert('RGB')
    comic = Image.new('RGB', (W, H))
    
    # Blend color and ink
    r1, g1, b1 = enh_contrast.split()
    r2, g2, b2 = ink_mask.split()
    
    # Multiply blend mode
    r_blend = Image.frombytes('L', (W, H), bytes((a * b) // 255 for a, b in zip(r1.tobytes(), r2.tobytes())))
    g_blend = Image.frombytes('L', (W, H), bytes((a * b) // 255 for a, b in zip(g1.tobytes(), g2.tobytes())))
    b_blend = Image.frombytes('L', (W, H), bytes((a * b) // 255 for a, b in zip(b1.tobytes(), b2.tobytes())))
    comic = Image.merge('RGB', (r_blend, g_blend, b_blend))
    
    # 5. Add Halftone Dot texture (comic printing dots)
    halftone = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(halftone)
    dot_spacing = 6
    for y in range(0, H, dot_spacing):
        for x in range(0, W, dot_spacing):
            if (x // dot_spacing + y // dot_spacing) % 2 == 0:
                hdraw.ellipse([x, y, x + 1, y + 1], fill=(0, 0, 0, 22))
    
    comic.paste(Image.alpha_composite(comic.convert('RGBA'), halftone).convert('RGB'))
    
    # 6. Comic Book Frame & Corner Badges (Graphic Novel Panel Styling)
    draw = ImageDraw.Draw(comic)
    # Heavy outer comic panel border
    draw.rectangle([0, 0, W - 1, H - 1], outline=(10, 15, 25), width=8)
    draw.rectangle([7, 7, W - 8, H - 8], outline=(0, 240, 255), width=2)
    
    # Top Comic Header Banner
    draw.rectangle([14, 14, 260, 46], fill=(12, 22, 38))
    draw.rectangle([14, 14, 260, 46], outline=(0, 240, 255), width=1)
    
    draw.rectangle([W - 170, 14, W - 14, 46], fill=(180, 25, 25))
    draw.rectangle([W - 170, 14, W - 14, 46], outline=(255, 210, 50), width=1)
    
    # Header texts
    try:
        font_header = ImageFont.truetype("arial.ttf", 15)
        font_tag = ImageFont.truetype("arialbd.ttf", 14)
    except:
        font_header = ImageFont.load_default()
        font_tag = ImageFont.load_default()
        
    draw.text((24, 22), title_text, fill=(0, 240, 255), font=font_header)
    draw.text((W - 158, 22), issue_tag, fill=(255, 255, 255), font=font_tag)
    
    # Subtle dark gradient at bottom so the game's Chinese subtitles pop cleanly
    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for y in range(H - 180, H):
        alpha = int(180 * ((y - (H - 180)) / 180.0))
        odraw.line([(0, y), (W, y)], fill=(5, 10, 18, alpha))
        
    final_img = Image.alpha_composite(comic.convert('RGBA'), overlay).convert('RGB')
    return final_img

titles = [
    ("TOKYO UNDER SEIGE", "ACT I"),
    ("ANCIENT EVIL ZOIGER", "ACT II"),
    ("GUTS WING DEPLOYMENT", "ACT III"),
    ("OPERATION FIRESTORM", "ACT IV"),
    ("LIGHT BREAKS DARKNESS", "ACT V"),
    ("THE ABYSSAL TITAN", "ACT VI"),
    ("THE SPARK OF HOPE", "ACT VII"),
    ("BOND OF COURAGE", "ACT VIII"),
    ("SECRET HANGAR UNLOCKED", "ACT IX"),
    ("WING READY FOR SORTIE", "ACT X")
]

for idx in range(1, 11):
    path = os.path.join(STORY_DIR, f'P{idx}.png')
    if os.path.exists(path):
        print(f"Processing P{idx}.png...")
        raw = Image.open(path)
        t, ep = titles[idx - 1]
        c = comicize_image(raw, title_text=t, issue_tag=ep)
        c.save(path, 'PNG', quality=95)
        print(f"P{idx}.png converted to American comic style {c.size}")

print("All P1-P10 stylized successfully!")
