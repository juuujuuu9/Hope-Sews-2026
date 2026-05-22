# Agent guide — Hope Sews

Astro 6 static site focused on visual storytelling and fast loads.

## Must-read rules

Project rules live in `.cursor/rules/` (integrated from general web dev standards + Hope Sews specifics).

### Hallmark (UI design)

[Hallmark](https://github.com/Nutlope/hallmark) lives at `.cursor/skills/hallmark/` (full `SKILL.md` + `references/`). Triggered via `.cursor/rules/hallmark.mdc` when building or auditing UI.

- Default: build pages that avoid AI-slop defaults (macrostructure, theme, slop test).
- `hallmark audit <target>` — punch list only.
- `hallmark redesign <target>` — new visual layer, keep IA/copy unless user approves rebuild.
- `hallmark study <screenshot|URL>` — extract design DNA, no pixel clones.

### Hope Sews specifics

Key behaviors:

- **Radical simplicity** — smallest correct change; search and reuse before adding code.
- **`media/` is source-only** — never reference in pages; never deploy.
- **`public/` is production** — all served assets go here after `npm run optimize:asset`.

## Adding media from chat

1. Save the user's file under `media/incoming/` or the appropriate `media/{img|video|font}/` subfolder.
2. Run `npm run optimize:asset -- <path>`.
3. Link only optimized paths under `/` in Astro (`<picture>`, video + poster, fonts in `/fonts/`).
4. Report source vs output sizes.

## Commands

```bash
npm run dev
npm run optimize:asset -- media/img/example.jpg
npm run optimize:media
npm run build
```
