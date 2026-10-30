import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

W, H = 700, 890

def make_rlyeh_map():
    # 1. Base deep dark abyssal ocean
    im = Image.new('RGB', (W, H), (6, 14, 28))
    draw = ImageDraw.Draw(im)
    
    # Deep water color gradient & ocean currents
    for y in range(H):
        v = int(12 + 8 * math.sin(y / 40.0))
        draw.line([(0, y), (W, y)], fill=(4, 10 + v // 2, 22 + v))
        
    # Swirling abyssal currents & ocean foam
    random.seed(42)
    for _ in range(600):
        cx = random.randint(0, W)
        cy = random.randint(0, H)
        rx = random.randint(30, 140)
        ry = random.randint(15, 60)
        alpha_v = random.randint(8, 24)
        c = (12, 35 + alpha_v, 55 + alpha_v * 2)
        draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=c)
        
    im = im.filter(ImageFilter.GaussianBlur(15))
    draw = ImageDraw.Draw(im)

    # 2. Cyclopean Submerged & Emerging Stone Ruins of R'lyeh
    # Giant monolithic non-Euclidean stone structures & platforms
    ruin_blocks = [
        # (x, y, w, h, angle)
        (160, 220, 180, 110, 15),
        (480, 310, 150, 90, -20),
        (320, 540, 220, 140, 5),
        (120, 720, 160, 100, -12),
        (520, 780, 190, 120, 25),
        (350, 80, 170, 95, -8),
    ]

    for bx, by, bw, bh, ang in ruin_blocks:
        # Stone platform with cracked masonry texture
        stone_im = Image.new('RGBA', (bw, bh), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(stone_im)
        # Ancient basalt rock
        sdraw.rectangle([0, 0, bw, bh], fill=(22, 28, 36, 240))
        sdraw.rectangle([4, 4, bw - 4, bh - 4], outline=(38, 48, 60, 255), width=3)
        
        # Eldritch glowing runes / veins (ancient dark purple / cyan luminescence)
        for _ in range(8):
            lx1 = random.randint(10, bw - 10)
            ly1 = random.randint(10, bh - 10)
            lx2 = lx1 + random.randint(-40, 40)
            ly2 = ly1 + random.randint(-30, 30)
            sdraw.line([(lx1, ly1), (lx2, ly2)], fill=(120, 60, 220, 180), width=2)
            sdraw.line([(lx1, ly1), (lx2, ly2)], fill=(80, 220, 255, 120), width=1)
            
        # Distort/rotate platform
        stone_rot = stone_im.rotate(ang, expand=True, resample=Image.Resampling.BICUBIC)
        # Wet water foam edge around submerged stones
        rw, rh = stone_rot.size
        glow = stone_rot.filter(ImageFilter.GaussianBlur(8))
        im.paste(glow, (bx - rw // 2, by - rh // 2), glow)
        im.paste(stone_rot, (bx - rw // 2, by - rh // 2), stone_rot)

    # 3. Storm Clouds & Fog drifting above
    clouds = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cdraw = ImageDraw.Draw(clouds)
    for _ in range(250):
        cx = random.randint(-50, W + 50)
        cy = random.randint(0, H)
        cr = random.randint(60, 180)
        cdraw.ellipse([cx - cr, cy - cr // 2, cx + cr, cy + cr // 2], fill=(15, 20, 35, random.randint(20, 65)))
        
    clouds = clouds.filter(ImageFilter.GaussianBlur(25))
    im = Image.alpha_composite(im.convert('RGBA'), clouds).convert('RGB')
    
    # 4. Make Vertically Tileable (Seamless wrap: top 120px blends with bottom 120px)
    BLEND_H = 140
    pixels = im.load()
    im_seamless = im.copy()
    
    for y in range(BLEND_H):
        alpha = y / float(BLEND_H)  # 0 at very top, 1 at BLEND_H
        # top row y should blend with (H - BLEND_H + y)
        for x in range(W):
            top_p = pixels[x, y]
            bot_p = pixels[x, H - BLEND_H + y]
            # When scrolling: top edge will touch bottom edge.
            # So row 0 must equal row H-1!
            # Let's blend top with bot smoothly:
            r = int(top_p[0] * alpha + bot_p[0] * (1 - alpha))
            g = int(top_p[1] * alpha + bot_p[1] * (1 - alpha))
            b = int(top_p[2] * alpha + bot_p[2] * (1 - alpha))
            im_seamless.putpixel((x, y), (r, g, b))
            
            # and bottom transition matches
            r2 = int(bot_p[0] * alpha + top_p[0] * (1 - alpha))
            g2 = int(bot_p[1] * alpha + top_p[1] * (1 - alpha))
            b2 = int(bot_p[2] * alpha + top_p[2] * (1 - alpha))
            im_seamless.putpixel((x, H - BLEND_H + y), (r2, g2, b2))

    return im_seamless

out_path = 'public/assets/sprites/common/L5_2_rlyeh.png'
rlyeh = make_rlyeh_map()
rlyeh.save(out_path)
print("Saved R'lyeh sky map to", out_path)
