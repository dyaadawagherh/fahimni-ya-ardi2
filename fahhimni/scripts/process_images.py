"""Chroma-key the generated character renders and export optimized WebP assets."""
import glob, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = '/data/vibe_images'
OUT = '/data/fahhimni/src/assets'

def find(name):
    hits = sorted(glob.glob(f'{SRC}/{name}_*.png'), key=os.path.getmtime)
    return hits[-1]

def key_out(path, channel, lo, hi):
    img = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    others = [c for c in range(3) if c != channel]
    key = img[..., channel] - np.maximum(img[..., others[0]], img[..., others[1]])
    alpha = np.clip(1 - (key - lo) / (hi - lo), 0, 1)
    # drop tiny stray specks, keep the main figure
    lab, n = ndimage.label(alpha > 0.5)
    if n > 1:
        sizes = ndimage.sum(alpha > 0.5, lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.002 * alpha.size])
        alpha = np.where((alpha > 0.5) & ~keep, 0, alpha)
    # shrink the matte slightly then feather to kill the coloured fringe
    alpha = ndimage.minimum_filter(alpha, size=3)
    alpha = ndimage.gaussian_filter(alpha, 0.8)
    # despill: the key channel may never exceed the brighter of the other two near edges
    edge = ndimage.maximum_filter((alpha < 0.98).astype(np.float32), size=9) > 0
    limit = np.maximum(img[..., others[0]], img[..., others[1]])
    ch = img[..., channel]
    img[..., channel] = np.where(edge | (channel == 1), np.minimum(ch, limit), ch)
    rgba = np.dstack([img, alpha * 255]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')

def frame(im, size=640, pad=0.04):
    """Crop to the figure, fit into a square canvas, feet on a common baseline."""
    box = im.getbbox()
    im = im.crop(box)
    inner = int(size * (1 - 2 * pad))
    scale = min(inner / im.width, inner / im.height)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    canvas.paste(im, ((size - im.width) // 2, size - int(size * pad) - im.height), im)
    return canvas

JO = ['base', 'explaining', 'surprised', 'laughing', 'thinking', 'proud', 'confused']
AL = ['base', 'confused', 'shocked', 'amused', 'convinced']
MISSIONS = ['hospitality', 'mansaf', 'wedding', 'ontheway', 'social', 'university']

done = []
for n in JO:
    out = f"{OUT}/characters/jo_{'welcoming' if n == 'base' else n}.webp"
    frame(key_out(find(f'jo_{n}'), 1, 35, 100)).save(out, 'WEBP', quality=88, method=6)
    done.append(out)
for n in AL:
    out = f"{OUT}/characters/alien_{'curious' if n == 'base' else n}.webp"
    frame(key_out(find(f'alien_{n}'), 2, 105, 170)).save(out, 'WEBP', quality=88, method=6)
    done.append(out)
for n in MISSIONS:
    im = Image.open(find(f'm_{n}')).convert('RGB').resize((800, 600), Image.LANCZOS)
    im.save(f'{OUT}/missions/{n}.webp', 'WEBP', quality=82, method=6)

# contact sheet for review
cell = 400
sheet = Image.new('RGB', (cell * 6, cell * 2), (17, 21, 47))
for i, p in enumerate(done):
    im = Image.open(p).resize((cell, cell), Image.LANCZOS)
    sheet.paste(im, ((i % 6) * cell, (i // 6) * cell), im)
sheet.save('/tmp/sheet.png')
msheet = Image.new('RGB', (800 * 3, 600 * 2))
for i, n in enumerate(MISSIONS):
    msheet.paste(Image.open(f'{OUT}/missions/{n}.webp'), ((i % 3) * 800, (i // 3) * 600))
msheet.resize((1800, 900)).save('/tmp/msheet.png')
print('ok', len(done))
