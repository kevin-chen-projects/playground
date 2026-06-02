#!/usr/bin/env python3
"""Generate offline-safe, on-brand SVG placeholder imagery for the Suntastic site.
Each placeholder is an editorial gradient with a sun motif + label so the design
reads as 'luxury photography' even before real photos are dropped in."""
import os

OUT = os.path.join(os.path.dirname(__file__), "assets", "img")
os.makedirs(OUT, exist_ok=True)

# (filename, width, height, color A, color B, label, sublabel)
SPECS = [
    # Hero backgrounds carry NO baked-in text — the page's real HTML headline
    # sits on top of them, so any label here would overlap the copy.
    ("hero",            1920, 1280, "#2a2622", "#7c5b3a", "", ""),
    ("about-hero",      1920,  900, "#26221d", "#6b4f3a", "", ""),
    ("packages-hero",   1920,  900, "#241f1b", "#8a6a44", "", ""),
    ("testi-hero",      1920,  900, "#211d19", "#9a7a52", "", ""),
    ("contact-hero",    1920,  900, "#222a2e", "#5c7480", "", ""),
    ("couple-1",         900, 1200, "#3a2c22", "#b98a7a", "Desert Portrait", ""),
    ("couple-2",        1200,  900, "#2e2820", "#c9a35b", "Chapel Vows", ""),
    ("portrait-tall",    900, 1200, "#332a24", "#a9863f", "First Look", ""),
    ("story-1",          800,  800, "#2c2620", "#c9a35b", "The Ceremony", ""),
    ("story-2",          800,  800, "#322a22", "#b98a7a", "The Details", ""),
    ("founders",         900, 1100, "#28231e", "#8a6a44", "Frank & Faye", "FOUNDERS"),
    ("g1",               800,  800, "#2b2520", "#c9a35b", "", ""),
    ("g2",               800,  800, "#332b24", "#b98a7a", "", ""),
    ("g3",               800,  800, "#26221d", "#a9863f", "", ""),
    ("g4",              1600,  800, "#2e271f", "#c9a35b", "", ""),
    ("g5",               800,  800, "#332a22", "#9a7a52", "", ""),
    ("g6",               800,  800, "#242019", "#b98a7a", "", ""),
]

# small round avatars for testimonials
AVATARS = [
    ("avatar-1", "#c9a35b", "JL"),
    ("avatar-2", "#b98a7a", "DR"),
    ("avatar-3", "#8a6a44", "SK"),
    ("avatar-4", "#a9863f", "MT"),
    ("avatar-5", "#9a7a52", "EP"),
    ("avatar-6", "#7c5b3a", "CW"),
]

SUN = """
  <g opacity="0.18" transform="translate({cx},{cy})">
    <circle r="{r}" fill="none" stroke="#f7f3ec" stroke-width="2"/>
    {rays}
  </g>"""

def sun(cx, cy, r):
    rays = []
    import math
    for i in range(12):
        a = math.radians(i * 30)
        x1 = math.cos(a) * (r + 14)
        y1 = math.sin(a) * (r + 14)
        x2 = math.cos(a) * (r + 34)
        y2 = math.sin(a) * (r + 34)
        rays.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="#f7f3ec" stroke-width="2" stroke-linecap="round"/>'
        )
    return SUN.format(cx=cx, cy=cy, r=r, rays="".join(rays))

def make(name, w, h, a, b, label, sub):
    cx, cy = w * 0.5, h * 0.42
    label_svg = ""
    if label:
        label_svg += (
            f'<text x="{w/2}" y="{h*0.62}" text-anchor="middle" '
            f'font-family="Georgia, serif" font-size="{int(h*0.058)}" '
            f'fill="#f7f3ec" opacity="0.92">{label}</text>'
        )
    if sub:
        label_svg += (
            f'<text x="{w/2}" y="{h*0.7}" text-anchor="middle" '
            f'font-family="Arial, sans-serif" font-size="{int(h*0.022)}" '
            f'letter-spacing="4" fill="#c9a35b" opacity="0.85">{sub}</text>'
        )
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{a}"/>
      <stop offset="1" stop-color="{b}"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="42%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  {sun(cx, cy, min(w,h)*0.12)}
  <rect width="{w}" height="{h}" fill="url(#v)"/>
  {label_svg}
</svg>'''
    with open(os.path.join(OUT, name + ".svg"), "w") as f:
        f.write(svg)

def make_avatar(name, color, initials):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" fill="{color}"/>
  <text x="60" y="60" dy="0.36em" text-anchor="middle" font-family="Georgia, serif"
        font-size="46" fill="#f7f3ec" opacity="0.95">{initials}</text>
</svg>'''
    with open(os.path.join(OUT, name + ".svg"), "w") as f:
        f.write(svg)

for spec in SPECS:
    make(*spec)
for av in AVATARS:
    make_avatar(*av)

print(f"Generated {len(SPECS) + len(AVATARS)} placeholder SVGs in {OUT}")
