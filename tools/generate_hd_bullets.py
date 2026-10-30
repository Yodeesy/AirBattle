import math
import os
from PIL import Image, ImageDraw, ImageFilter

out_dir = os.path.join('public', 'assets', 'sprites', 'common')
os.makedirs(out_dir, exist_ok=True)

def create_ebullet_1():
    # Crisp glowing orange-red energy dart (32x64)
    w, h = 32, 64
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w // 2
    # Outer glow
    for r in range(12, 0, -2):
        alpha = int(35 * (1 - r / 12))
        d.ellipse([cx - r, 16 - r, cx + r, 48 + r], fill=(255, 100, 20, alpha))
    # Core bolt
    d.polygon([(cx, 8), (cx + 6, 28), (cx + 3, 52), (cx - 3, 52), (cx - 6, 28)], fill=(255, 120, 30, 255))
    # Inner white hot core
    d.polygon([(cx, 12), (cx + 3, 26), (cx + 1, 46), (cx - 1, 46), (cx - 3, 26)], fill=(255, 240, 200, 255))
    im.save(os.path.join(out_dir, 'Ebullet_1.png'))
    print('Generated HD Ebullet_1.png')

def create_ebullet_2():
    # Crimson needle beam (32x64)
    w, h = 32, 64
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w // 2
    for r in range(10, 0, -2):
        alpha = int(40 * (1 - r / 10))
        d.ellipse([cx - r, 8 - r, cx + r, 54 + r], fill=(255, 30, 60, alpha))
    d.polygon([(cx, 4), (cx + 5, 20), (cx + 2, 58), (cx - 2, 58), (cx - 5, 20)], fill=(255, 40, 50, 255))
    d.polygon([(cx, 8), (cx + 2, 20), (cx + 1, 52), (cx - 1, 52), (cx - 2, 20)], fill=(255, 220, 220, 255))
    im.save(os.path.join(out_dir, 'Ebullet_2.png'))
    print('Generated HD Ebullet_2.png')

def create_ebullet_3():
    # Zoiger dark cursed flame orb (64x64)
    w, h = 64, 64
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = w // 2, h // 2
    for r in range(28, 6, -2):
        alpha = int(50 * (1 - r / 28))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(160, 20, 220, alpha))
    for r in range(16, 2, -2):
        alpha = int(120 * (1 - r / 16))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(230, 40, 100, alpha))
    d.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 180, 220, 255))
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255, 255))
    im.save(os.path.join(out_dir, 'Ebullet_3.png'))
    print('Generated HD Ebullet_3.png')

def create_ebullet_4():
    # Heavy cruiser ruby-red plasma pellet (32x56)
    w, h = 32, 56
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = w // 2, h // 2
    for r in range(14, 0, -2):
        alpha = int(45 * (1 - r / 14))
        d.ellipse([cx - r, cy - r * 1.5, cx + r, cy + r * 1.5], fill=(255, 20, 80, alpha))
    d.ellipse([cx - 7, cy - 18, cx + 7, cy + 18], fill=(255, 50, 60, 255))
    d.ellipse([cx - 3, cy - 12, cx + 3, cy + 12], fill=(255, 240, 230, 255))
    im.save(os.path.join(out_dir, 'Ebullet_4.png'))
    print('Generated HD Ebullet_4.png')

def create_ebullet_5():
    # Gatanothor dark matter sphere (72x72)
    w, h = 72, 72
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = w // 2, h // 2
    for r in range(32, 8, -2):
        alpha = int(55 * (1 - r / 32))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(80, 0, 140, alpha))
    for r in range(20, 4, -2):
        alpha = int(140 * (1 - r / 20))
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(180, 20, 70, alpha))
    d.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(255, 120, 200, 255))
    d.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255, 255))
    im.save(os.path.join(out_dir, 'Ebullet_5.png'))
    print('Generated HD Ebullet_5.png')

def create_e1_bullet():
    # Enemy 1 yellow-orange tracer (24x48)
    w, h = 24, 48
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w // 2
    for r in range(8, 0, -2):
        alpha = int(45 * (1 - r / 8))
        d.ellipse([cx - r, 10 - r, cx + r, 38 + r], fill=(255, 160, 20, alpha))
    d.polygon([(cx, 8), (cx + 4, 22), (cx + 2, 40), (cx - 2, 40), (cx - 4, 22)], fill=(255, 180, 30, 255))
    d.polygon([(cx, 12), (cx + 2, 22), (cx + 1, 36), (cx - 1, 36), (cx - 2, 22)], fill=(255, 255, 220, 255))
    im.save(os.path.join(out_dir, 'e1_bullet.png'))
    print('Generated HD e1_bullet.png')

def create_e2_bullet():
    # Enemy 2 twin red missile/bolt (28x56)
    w, h = 28, 56
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w // 2
    for r in range(10, 0, -2):
        alpha = int(40 * (1 - r / 10))
        d.ellipse([cx - r, 8 - r, cx + r, 46 + r], fill=(255, 40, 30, alpha))
    d.polygon([(cx, 6), (cx + 5, 20), (cx + 3, 50), (cx - 3, 50), (cx - 5, 20)], fill=(255, 60, 40, 255))
    d.polygon([(cx, 10), (cx + 2, 20), (cx + 1, 44), (cx - 1, 44), (cx - 2, 20)], fill=(255, 240, 210, 255))
    im.save(os.path.join(out_dir, 'e2_bullet.png'))
    print('Generated HD e2_bullet.png')

def create_b1_laser():
    # Laser beam b1 (32x80)
    w, h = 32, 80
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w // 2
    for r in range(12, 0, -2):
        alpha = int(40 * (1 - r / 12))
        d.rectangle([cx - r, 0, cx + r, h], fill=(0, 200, 255, alpha))
    d.rectangle([cx - 5, 0, cx + 5, h], fill=(0, 230, 255, 255))
    d.rectangle([cx - 2, 0, cx + 2, h], fill=(255, 255, 255, 255))
    im.save(os.path.join(out_dir, 'b1.png'))
    print('Generated HD b1.png')

if __name__ == '__main__':
    create_ebullet_1()
    create_ebullet_2()
    create_ebullet_3()
    create_ebullet_4()
    create_ebullet_5()
    create_e1_bullet()
    create_e2_bullet()
    create_b1_laser()
    print('All HD bullets created successfully!')
