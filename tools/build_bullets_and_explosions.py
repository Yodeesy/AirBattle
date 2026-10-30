import os
from PIL import Image

LEGACY_COMMON = os.path.join('_legacy', 'images', 'common')
OUT_COMMON = os.path.join('public', 'assets', 'sprites', 'common')
os.makedirs(OUT_COMMON, exist_ok=True)

def merge_mask(c_path, m_path):
    color = Image.open(c_path).convert('RGBA')
    mask = Image.open(m_path).convert('L')
    if mask.size != color.size:
        mask = mask.resize(color.size, Image.Resampling.LANCZOS)
    corner = mask.getpixel((0, 0))
    is_corner_white = corner > 128
    m_data = mask.load()
    c_data = color.load()
    w, h = color.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = c_data[x, y]
            m = m_data[x, y]
            alpha = (255 - m) if is_corner_white else m
            c_data[x, y] = (r, g, b, alpha)
    return color

# 1. Process all Bullets
bullet_files = [
    'bullet_0', 'bullet_1', 'bullet_2', 'bullet_3',
    'bullet_6', 'bullet_7', 'bullet_8', 'bullet_9',
    'e1_bullet', 'e2_bullet',
    'Ebullet_1', 'Ebullet_2', 'Ebullet_3', 'Ebullet_4', 'Ebullet_5',
    'b1', 'MAX'
]

for bname in bullet_files:
    c_candidates = [bname + '.png', bname + '.jpg']
    c_found = None
    for cand in c_candidates:
        p = os.path.join(LEGACY_COMMON, cand)
        if os.path.exists(p):
            c_found = p
            break
    if not c_found:
        continue
    
    m_p = os.path.join(LEGACY_COMMON, bname + '_mask.png')
    out_p = os.path.join(OUT_COMMON, bname + '.png')
    if os.path.exists(m_p):
        img = merge_mask(c_found, m_p)
    else:
        # Check if black background needs chroma key
        img = Image.open(c_found).convert('RGBA')
        corner = img.getpixel((0, 0))
        if corner[0] < 20 and corner[1] < 20 and corner[2] < 20:
            c_data = img.load()
            for y in range(img.height):
                for x in range(img.width):
                    r, g, b, a = c_data[x, y]
                    if r < 15 and g < 15 and b < 15:
                        c_data[x, y] = (r, g, b, 0)
    img.save(out_p, 'PNG')
    print('Exported bullet:', bname, img.size)

# 2. Process Explosions: Boom1, Boom2, Boom3, Boom4
OUT_BOOMS = os.path.join('public', 'assets', 'sprites', 'booms')
os.makedirs(OUT_BOOMS, exist_ok=True)

# Boom1 (4 frames)
boom1_dir = os.path.join('_legacy', 'images', 'boom', 'boom1')
for i in range(1, 5):
    c_p = os.path.join(boom1_dir, f'boom{i}.png')
    m_p = os.path.join(boom1_dir, f'boom{i}_mask.png')
    out_p = os.path.join(OUT_BOOMS, f'boom1_{i-1}.png')
    if os.path.exists(c_p) and os.path.exists(m_p):
        img = merge_mask(c_p, m_p)
        img.save(out_p, 'PNG')
print('Exported Boom1 frames.')

# Boom2 (8 frames)
boom2_dir = os.path.join('_legacy', 'images', 'boom', 'boom2')
for i in range(8):
    c_p = os.path.join(boom2_dir, f'frame_{i}_delay-0.1s.png')
    m_p = os.path.join(boom2_dir, f'frame_{i}_delay-0.1s_mask.png')
    out_p = os.path.join(OUT_BOOMS, f'boom2_{i}.png')
    if os.path.exists(c_p) and os.path.exists(m_p):
        img = merge_mask(c_p, m_p)
        img.save(out_p, 'PNG')
print('Exported Boom2 frames.')

# Boom4 (Boss Explosion, 29 frames)
boom4_dir = os.path.join('_legacy', 'images', 'boom', 'boom4')
for i in range(29):
    c_p = os.path.join(boom4_dir, f'frame_{i:02d}_delay-0.04s.png')
    out_p = os.path.join(OUT_BOOMS, f'boom4_{i}.png')
    if os.path.exists(c_p):
        img = Image.open(c_p).convert('RGBA')
        # black background to transparent
        c_data = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = c_data[x, y]
                if r < 18 and g < 18 and b < 18:
                    c_data[x, y] = (0, 0, 0, 0)
        img.save(out_p, 'PNG')
print('Exported Boom4 (Boss) frames.')

# Also check Attention animation for Boss warning:
attn_dir = os.path.join('_legacy', 'images', 'attention')
OUT_ATTN = os.path.join('public', 'assets', 'sprites', 'attention')
os.makedirs(OUT_ATTN, exist_ok=True)
attn_files = sorted([f for f in os.listdir(attn_dir) if f.endswith('.png')])
for idx, f in enumerate(attn_files):
    p = os.path.join(attn_dir, f)
    img = Image.open(p).convert('RGBA')
    c_data = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = c_data[x, y]
            if r < 15 and g < 15 and b < 15:
                c_data[x, y] = (0, 0, 0, 0)
    img.save(os.path.join(OUT_ATTN, f'attn_{idx}.png'), 'PNG')
print(f'Exported {len(attn_files)} Attention alert frames.')
