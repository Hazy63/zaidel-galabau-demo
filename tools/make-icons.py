import math, sys
from PIL import Image, ImageDraw
out = sys.argv[1]
for size in (192, 512):
    S = size * 4
    im = Image.new('RGB', (S, S), '#1f3a2b'); d = ImageDraw.Draw(im)
    c = S / 2; r = S * 0.17; R = S * 0.18; w = max(2, int(S * 0.034))
    for i in range(8):
        a = i * math.pi / 4 - math.pi / 2
        x, y = c + math.cos(a) * R, c + math.sin(a) * R
        d.ellipse([x - r, y - r, x + r, y + r], outline='#9cc28a', width=w)
    k = S * 0.055; d.ellipse([c - k, c - k, c + k, c + k], fill='#f3efe6')
    im.resize((size, size), Image.LANCZOS).save(f'{out}/icon-{size}.png')
