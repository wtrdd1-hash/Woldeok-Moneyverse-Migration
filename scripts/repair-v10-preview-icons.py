#!/usr/bin/env python3
"""Generate isolated v11 icon repair candidates, never mark visual acceptance."""
import hashlib, json
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'docs/design/CURRENT_UI_DESIGN_MANIFEST.json').read_text())
out=ROOT/'docs/design/game-ui-v2026.11.24.11/previews'
out.mkdir(parents=True,exist_ok=True)
assert len(manifest['routes'])==180
records=[]
def repair(im,route):
    assert im.size==(1660,990)
    d=ImageDraw.Draw(im)
    ink='#ae92ff'
    # coordinates in original 1660x990, independent of font glyphs
    for x,y,kind in [(45,130,'home'),(45,375,'quest')]+([(45,680,'admin')] if route.startswith('/admin') else []):
        bg=im.getpixel((x-15,y))
        d.rectangle((x-11,y-13,x+11,y+13),fill=bg)
        if kind=='home':
            d.line([(x-9,y-1),(x,y-10),(x+9,y-1),(x+9,y+10),(x+3,y+10),(x+3,y+3),(x-3,y+3),(x-3,y+10),(x-9,y+10),(x-9,y-1)],fill=ink,width=2)
        elif kind=='quest':
            d.rounded_rectangle((x-7,y-10,x+7,y+10),radius=2,outline=ink,width=2)
            d.line([(x-4,y),(x-1,y+3),(x+4,y-4)],fill=ink,width=2)
        else:
            d.line([(x,y-10),(x+9,y-6),(x+7,y+5),(x,y+11),(x-7,y+5),(x-9,y-6),(x,y-10)],fill=ink,width=2)
    for x,y,w,h in [(1089,45,8,8),(284,147,7,8),(1341,175,6,7)]:
        bg=im.getpixel((x-9,y))
        d.rectangle((x-w,y-h,x+w,y+h),fill=bg)
        if x==1089:
            d.line([(x-5,y-2),(x,y+3),(x+5,y-2)],fill=ink,width=2)
        else:
            d.polygon([(x,y-5),(x+4,y),(x,y+5),(x-4,y)],fill=ink)
    return im
for item in manifest['routes']:
    src=ROOT/item['file']
    original=src.read_bytes()
    assert hashlib.sha256(original).hexdigest()==item['sha256'],src
    with Image.open(src) as im:
        im.load()
        candidate=repair(im.convert('RGB'),item['route'])
    target=out/src.name
    candidate.save(target)
    with Image.open(target) as check:
        check.verify()
    records.append(dict(route=item['route'],original=item['file'],candidate=str(target.relative_to(ROOT)),sha256=hashlib.sha256(target.read_bytes()).hexdigest(),status='CANDIDATE_VISUAL_REVIEW_OPEN'))
assert len(records)==180
(out.parent/'repair-audit.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print('180 candidate PNGs generated; independent visual and functional QA still required')
