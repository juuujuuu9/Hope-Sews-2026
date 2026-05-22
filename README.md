# Hope Sews

Minimal Astro landing page.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Background video

Add your loop video as:

```
public/video/background.mp4
```

Until that file exists, the page shows the poster image (`public/video/poster.png`) from the design mockup.

Recommended: H.264 MP4, muted, short loop (10–30s), 1080p or 720p for reasonable file size.

## Media: source vs production

| Folder | Role |
|--------|------|
| `media/` | Source-only originals (not deployed) |
| `public/` | Optimized assets served at `/…` |

When adding images, video, or fonts (including via chat), save originals under `media/`, then optimize:

```bash
npm run optimize:asset -- media/img/photo.jpg
npm run optimize:media   # batch everything under media/
```

Outputs: raster → `.avif` + `.webp`; SVG → minified; video → H.264 `.mp4` + `.poster.webp`; fonts → `.woff2` in `public/fonts/`. Video requires `ffmpeg` on your PATH.

Cursor rules in `.cursor/rules/` enforce this workflow automatically.

## Hallmark (design skill)

[Hallmark](https://github.com/Nutlope/hallmark) is vendored under `.cursor/skills/hallmark/` for anti-slop UI work. Ask the agent to build with Hallmark, or use `hallmark audit`, `hallmark redesign`, or `hallmark study` on a target. See `AGENTS.md`.

## WordPress media import

Original uploads (not WordPress thumbnail sizes) from the legacy site are in `media/`, grouped by type:

- `media/img/`
- `media/video/`
- `media/font/`
- `media/audio/` and `media/document/` (empty if none were found)

`media/manifest.json` maps each copied file back to its source path. To re-run the import:

```bash
python3 scripts/extract-wp-media.py
```

Optional: `--source /path/to/wp-content/uploads` and `--dest ./media`.

## Build

```bash
npm run build
npm run preview
```
