# Bereitet Screenshots aus shots/ für das Übergabe-PDF auf (zuschneiden, JPEG)
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
jobs = {
    'site-hero': ('desk-site', (0, 0, 1440, 860)),
    'site-referenzen': ('desk-site', (0, 3560, 1440, 4420)),
    'dash': ('desk-dash', (0, 0, 1440, 900)),
    'jobs': ('desk-jobs', None),
    'job': ('desk-job', (0, 0, 1440, 900)),
    'doc': ('desk-doc', (200, 0, 1240, 1268)),
    'plan': ('desk-plan', None),
    'mob-dash': ('mob-dash', None),
    'mob-fotos': ('mob-job-fotos', None),
    'mob-notes': ('mob-job-notes', None),
    'mob-doc': ('mob-mitarbeiter-doc', None),
}
for out, (name, box) in jobs.items():
    im = Image.open(f'{src}/{name}.png').convert('RGB')
    if box: im = im.crop(box)
    im.thumbnail((1400, 1400))
    im.save(f'{dst}/{out}.jpg', quality=84, optimize=True)
    print(out, im.size)

# Deckblatt-Foto (JPEG hält das PDF klein)
cover = Image.open('public/img/pflaster-sandstein-detail.webp').convert('RGB')
cover.thumbnail((1500, 1500))
cover.save(f'{dst}/cover.jpg', quality=78, optimize=True)
