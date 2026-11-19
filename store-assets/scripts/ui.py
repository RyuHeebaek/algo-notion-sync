"""Tiny drawing toolkit for store screenshot / promo tile rendering.

All coordinates are given in *logical* pixels of the final image; everything is
drawn on a supersampled canvas (S times larger) and downsampled at save time,
so rounded corners, strokes and text come out clean.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_KR = "/usr/share/fonts/pickle-hwp/NotoSansCJKkr-Regular.otf"
FONT_MONO = "/usr/share/fonts/pickle-hwp/NotoSansMonoCJKkr-Regular.otf"
FONT_LATIN_BOLD = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

_cache = {}


def _font(size, mono=False):
    key = (size, mono)
    if key not in _cache:
        _cache[key] = ImageFont.truetype(FONT_MONO if mono else FONT_KR, size)
    return _cache[key]


class Canvas:
    def __init__(self, w=1280, h=800, S=2, bg=(255, 255, 255, 255)):
        self.w, self.h, self.S = w, h, S
        self.img = Image.new("RGBA", (w * S, h * S), bg)
        self.d = ImageDraw.Draw(self.img)

    # ---------- shapes ----------
    def rr(self, box, radius, fill=None, outline=None, width=1):
        S = self.S
        b = [box[0] * S, box[1] * S, box[2] * S, box[3] * S]
        r = radius * S
        if fill is not None:
            self.d.rounded_rectangle(b, radius=r, fill=fill)
        if outline is not None:
            self.d.rounded_rectangle(b, radius=r, outline=outline, width=int(width * S))

    def rect(self, box, fill):
        S = self.S
        self.d.rectangle([box[0] * S, box[1] * S, box[2] * S, box[3] * S], fill=fill)

    def ellipse(self, box, fill=None, outline=None, width=1):
        S = self.S
        b = [box[0] * S, box[1] * S, box[2] * S, box[3] * S]
        self.d.ellipse(b, fill=fill, outline=outline, width=int(width * S))

    def line(self, pts, fill, width=1, cap="round"):
        S = self.S
        p = [(x * S, y * S) for x, y in pts]
        self.d.line(p, fill=fill, width=int(width * S), joint="curve")
        r = width * S / 2
        for (x, y) in p:
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=fill)

    def polygon(self, pts, fill):
        S = self.S
        self.d.polygon([(x * S, y * S) for x, y in pts], fill=fill)

    def arc(self, box, start, end, fill, width):
        S = self.S
        self.d.arc([box[0] * S, box[1] * S, box[2] * S, box[3] * S], start=start, end=end,
                   fill=fill, width=int(width * S))

    # ---------- text ----------
    def t(self, xy, s, size, color, bold=False, anchor="la", mono=False,
          tracking=0.0, max_w=None, line_gap=0.0):
        """Draw text. `max_w` (logical px) shrinks the font until it fits."""
        if max_w is not None:
            while size > 6:
                f = _font(int(size * self.S), mono)
                if self.text_w(s, f) / self.S <= max_w:
                    break
                size -= 0.5
        f = _font(int(size * self.S), mono)
        x, y = xy[0] * self.S, xy[1] * self.S
        stroke = max(1, int(size * self.S / 26)) if bold else 0
        if tracking:
            cx = x
            for ch in s:
                self.d.text((cx, y), ch, font=f, fill=color, anchor=anchor,
                            stroke_width=stroke, stroke_fill=color)
                cx += self.text_w(ch, f) + tracking * self.S
            return
        self.d.text((x, y), s, font=f, fill=color, anchor=anchor,
                    stroke_width=stroke, stroke_fill=color)

    def multi(self, xy, lines, size, color, bold=False, gap=8, anchor="la", max_w=None):
        y = xy[1]
        for ln in lines:
            self.t((xy[0], y), ln, size, color, bold=bold, anchor=anchor, max_w=max_w)
            y += size * 1.42 + gap

    @staticmethod
    def text_w(s, f):
        return f.getbbox(s)[2] - f.getbbox(s)[0]

    def w_of(self, s, size, bold=False, mono=False):
        return self.text_w(s, _font(int(size * self.S), mono)) / self.S

    # ---------- effects ----------
    def shadow(self, box, radius, blur=24, alpha=38, dy=10, color=(15, 23, 42)):
        S = self.S
        pad = int(blur * 3 * S)
        w = int((box[2] - box[0]) * S) + pad * 2
        h = int((box[3] - box[1]) * S) + pad * 2
        layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(layer).rounded_rectangle(
            [pad, pad, pad + int((box[2] - box[0]) * S), pad + int((box[3] - box[1]) * S)],
            radius=radius * S, fill=color + (alpha,))
        layer = layer.filter(ImageFilter.GaussianBlur(blur * S / 2))
        self.img.alpha_composite(layer, (int(box[0] * S) - pad, int((box[1] + dy) * S) - pad))

    def paste(self, im, xy):
        self.img.alpha_composite(im, (int(xy[0] * self.S), int(xy[1] * self.S)))

    def gradient_bg(self, top, bottom, blob=True):
        """Vertical gradient fill of the whole canvas."""
        S = self.S
        g = Image.new("RGB", (self.w, self.h))
        gd = ImageDraw.Draw(g)
        for y in range(self.h):
            t = y / (self.h - 1)
            c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
            gd.line([(0, y), (self.w, y)], fill=c)
        self.img.alpha_composite(g.convert("RGBA").resize((self.w * S, self.h * S), Image.BICUBIC))
        if blob:
            self.soft_blob((1010, 60), 380, (43, 108, 255, 44))
            self.soft_blob((240, 760), 320, (124, 58, 237, 30))

    def soft_blob(self, center, radius, color):
        S = self.S
        d = int(radius * S * 2)
        layer = Image.new("RGBA", (d, d), (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse([0, 0, d - 1, d - 1], fill=color)
        layer = layer.filter(ImageFilter.GaussianBlur(d / 4))
        self.img.alpha_composite(layer, (int(center[0] * S - d / 2), int(center[1] * S - d / 2)))

    def save(self, path):
        out = self.img.convert("RGB").resize((self.w, self.h), Image.LANCZOS)
        out.save(path, "PNG", optimize=True)
        return path


# ---------- shared brand bits ----------
def brand_mark(c, x, yize, size, radius=None):
    """Draw the app icon (gradient tile + '</>' mark) at logical size."""
    radius = radius if radius is not None else size * 0.225
    # gradient approximated by horizontal bands inside a rounded mask
    S = c.S
    tile = Image.new("RGBA", (int(size * S), int(size * S)), (0, 0, 0, 0))
    d = ImageDraw.Draw(tile)
    h = int(size * S)
    for i in range(h):
        t = i / max(1, h - 1)
        col = (int(43 + (124 - 43) * (0.08 + .92 * t)),
               int(108 + (58 - 108) * (0.08 + .92 * t)),
               int(255 + (237 - 255) * (0.08 + .92 * t)), 255)
        d.line([(0, i), (h, i)], fill=col)
    mask = Image.new("L", (int(size * S), int(size * S)), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, h - 1, h - 1], radius=int(radius * S), fill=255)
    tile.putalpha(mask)
    # inner padding of the glyph matches the icon artwork (96/128 of the tile)
    pad = size * 0.16 * S
    w = size * S - 2 * pad
    lw = w * 0.062
    cx = cy = size * S / 2
    g = int(w * 0.26)
    hh = int(w * 0.18)
    white = (255, 255, 255, 255)
    cw = hh * 0.70
    # <
    for pts in ([(cx - g + cw, cy - hh), (cx - g, cy), (cx - g + cw, cy + hh)],
                [(cx + w * 0.044, cy + hh * 0.94), (cx - w * 0.044, cy - hh * 0.94)],
                [(cx + g - cw, cy - hh), (cx + g, cy), (cx + g - cw, cy + hh)]):
        d.line(pts, fill=white, width=int(lw), joint="curve")
        r = lw / 2
        for (px, py) in pts:
            d.ellipse([px - r, py - r, px + r, py + r], fill=white)
    c.img.alpha_composite(tile, (int(x * c.S), int(yize * c.S)))


def pill(c, x, y, label, size, fg, bg, pad_x=10, pad_y=5, radius=99, bold=True):
    w = c.w_of(label, size, bold) + pad_x * 2
    h = size * 1.42 + pad_y * 2
    c.rr((x, y, x + w, y + h), radius, fill=bg)
    c.t((x + w / 2, y + h / 2), label, size, fg, bold=bold, anchor="mm")
    return w, h


def check_icon(c, x, y, size, color):
    c.line([(x, y + size * 0.52), (x + size * 0.36, y + size * 0.86), (x + size * 0.98, y + size * 0.12)],
           color, width=max(1.6, size * 0.13))
