# Suntastic — Website Preview

A clean, luxury multi-page website for **Suntastic**, a Las Vegas wedding
photography studio and licensed Nevada officiant team.

This is a **design preview** with placeholder photography and filler copy, built
so you can see the look and feel before we add real photos, videos, and final
wording.

---

## 👀 Quickest way to view it (just open a file)

1. Open the `suntastic` folder.
2. **Double-click `index.html`.**

That's it. It opens in your default web browser and you can click through every
page — Home, About, Packages, Testimonials, and Contact — using the menu at the
top. No internet connection required; all images are built in.

> Tip: For the best experience, use **Chrome, Safari, Edge, or Firefox**
> (any modern browser is fine).

---

## Pages included

| Page | File | What's on it |
|------|------|--------------|
| **Home** | `index.html` | Premium hero, intro, services, package preview, gallery, featured testimonial |
| **About** | `about.html` | Founders' story, approach, licensing note, **portfolio gallery + film "coming soon"** section |
| **Packages** | `packages.html` | Three wedding collections, à la carte add-ons, how-it-works steps |
| **Testimonials** | `testimonials.html` | Featured review + a grid of couple reviews and stats |
| **Contact** | `contact.html` | Inquiry form, direct contact details, map placeholder |

---

## A few notes for review

- **All text and prices are placeholders (filler).** Tell us what's right and
  we'll swap it in — studio name styling, package names, pricing, the founders'
  story, contact info, etc.
- **All images are stand-ins.** They're branded gold-gradient placeholders so the
  layout reads as a luxury brand. Several are labeled like
  *"REPLACE WITH HERO FILM STILL"* to show exactly where real photos go.
- **Built to grow into portfolio + video.** The About page already has a
  portfolio gallery and a "Wedding Films — Coming Soon" block, ready to hold real
  galleries and highlight videos from past couples down the road.
- **The contact form is not connected yet.** Submitting it shows a friendly
  preview message. Before launch we'll wire it up so inquiries land in your inbox.

---

## Optional: run it on a local web server

Opening the file directly works perfectly for previewing. If you'd prefer to run
it through a local server (closer to how it'll behave when live), use any one of
these from inside the `suntastic` folder:

```bash
# Python 3 (already on most Macs)
python3 -m http.server 8000

# or Node.js
npx serve

# or PHP
php -S localhost:8000
```

Then visit **http://localhost:8000** in your browser.

---

## For the developer: going live on Cloudflare Pages

This is a 100% static site — no build step required.

1. Push the contents of this `suntastic/` folder to a Git repo (or drag-and-drop
   the folder into the Cloudflare Pages dashboard).
2. In Cloudflare Pages, create a project from the repo.
3. **Framework preset:** None · **Build command:** *(leave empty)* ·
   **Build output directory:** `/` (the folder containing `index.html`).
4. Deploy. Point the custom domain at it when ready.

A `_headers` file is included with sensible caching + security defaults.

---

## Folder structure

```
suntastic/
├── index.html            ← Home
├── about.html            ← About + portfolio
├── packages.html         ← Wedding packages
├── testimonials.html     ← Reviews
├── contact.html          ← Contact + inquiry form
├── _headers              ← Cloudflare Pages headers (caching/security)
├── gen_placeholders.py   ← (dev) regenerates placeholder images
├── README.md             ← this file
└── assets/
    ├── css/styles.css     ← all styling
    ├── js/main.js         ← nav, scroll animations, form preview
    └── img/               ← placeholder images (SVG)
```

---

## Swapping in real content later

- **Photos:** drop real images into `assets/img/` and update the `src="..."`
  paths in the HTML. Keep similar dimensions for the cleanest fit.
- **Videos:** in `about.html`, replace the "film reel placeholder" box with a
  `<video>` tag or a YouTube/Vimeo embed.
- **Text & prices:** edit directly in the `.html` files — everything is plain,
  readable HTML.

Questions? Happy to make any changes before this goes live. 🌅
