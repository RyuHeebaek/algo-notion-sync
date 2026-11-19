"""Algo Notion Sync app icon generator.

Design: rounded square with a blue -> violet gradient and a white "</>" code mark.
Artwork is 96x96 inside a 128x128 canvas, i.e. 16px transparent padding on every
side, which is what the Chrome Web Store artwork guide asks for. The 16/32/48
sizes are downsampled from the same master so the mark stays consistent.

Usage:  python3 gen_icon.py <output-dir-for-16-32-48-128>
"""
from PIL import Image, ImageDraw, ImageFilter
import os
import sys

SS = 8                      # supersampling factor
CANVAS = 128 * SS
PAD = 16 * SS
TILE = CANVAS - PAD * 2
C1 = (43, 108, 255)         # #2B6CFF
C2 = (124, 58, 237)         # #7C3AED
WHITE = (255, 255, 255, 255)

# code mark geometry, in artwork units (100 units == 96px artwork)
HW, HH, STROKE, SLASH_X, CW_RATIO = 26.0, 18.0, 6.4, 4.4, 0.70


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient_tile(size):
    img = Image.new("RGB", (size, size))
    d = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        d.line([(0, y), (size, y)], fill=lerp(C1, C2, 0.08 + 0.92 * t))
    ov = Image.new("L", (size, size), 0)
    od = ImageDraw.Draw(ov)
    for i in range(size):
        od.line([(i, 0), (0, i)], fill=int(40 * (1 - i / size)))
    return Image.composite(Image.new("RGB", (size, size), (255, 255, 255)), img, ov)


def rounded_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
    return m


def tile_image():
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    ti = gradient_tile(TILE).convert("RGBA")
    hl = Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))
    ImageDraw.Draw(hl).rounded_rectangle(
        [int(TILE * 0.02), int(TILE * 0.02), int(TILE * 0.98), int(TILE * 0.52)],
        radius=int(TILE * 0.22), fill=(255, 255, 255, 28))
    hl = hl.filter(ImageFilter.GaussianBlur(TILE * 0.05))
    ti = Image.alpha_composite(ti, hl)
    canvas.paste(ti, (PAD, PAD), rounded_mask(TILE, int(TILE * 0.225)))
    return canvas


class Pen:
    """Draws in artwork units (100 units == 96px) from the canvas centre."""

    def __init__(self, draw, cx, cy, u):
        self.d, self.cx, self.cy, self.u = draw, cx, cy, u

    def stroke(self, pts, w):
        wpx = w * self.u
        p = [(self.cx + x * self.u, self.cy + y * self.u) for (x, y) in pts]
        self.d.line(p, fill=WHITE, width=int(round(wpx)), joint="curve")
        r = wpx / 2
        for (x, y) in p:
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=WHITE)


def master(size=1024):
    canvas = tile_image()
    d = ImageDraw.Draw(canvas)
    u = TILE / 100.0
    pen = Pen(d, CANVAS / 2, CANVAS / 2, u)
    cw = HH * CW_RATIO
    pen.stroke([(-HW + cw, -HH), (-HW, 0), (-HW + cw, HH)], STROKE)
    pen.stroke([(SLASH_X, HH * 0.94), (-SLASH_X, -HH * 0.94)], STROKE)
    pen.stroke([(HW - cw, -HH), (HW, 0), (HW - cw, HH)], STROKE)
    return canvas.resize((size, size), Image.BOX)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "out"
    os.makedirs(out, exist_ok=True)
    big = master(1024)
    big.save(os.path.join(out, "icon1024.png"))
    for s in (16, 32, 48, 128):
        big.resize((s, s), Image.BOX).save(os.path.join(out, f"icon{s}.png"))
    # store artwork: 128 canvas, 96 artwork, 16px transparent padding
    big.resize((128, 128), Image.BOX).save(os.path.join(out, "icon128_store.png"))
    print("wrote icons to", os.path.abspath(out))


if __name__ == "__main__":
    main()
