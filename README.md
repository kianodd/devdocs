# DevDocs — مستندات برنامه‌نویسی

A PWA for reading programming documentation with a local reading-progress tracker.
UI language: Persian (RTL), designed after Apple's iOS 26 design system (Liquid Glass functional layer, inset-grouped lists, semantic light/dark colors).

**Live:** https://kianodd.github.io/devdocs/

## Content

The first course is the complete official **NestJS** documentation, imported verbatim from
[github.com/nestjs/docs.nestjs.com](https://github.com/nestjs/docs.nestjs.com) — all 170 chapters in the
official reading order. No content was written or edited by hand; the markdown sources live in
`src-docs/` and are rendered to static HTML by the build script.

## Features

- Offline-first PWA (service worker caches the shell and every chapter you open)
- Reading tracker: mark each chapter as read at the end of the chapter; progress is
  stored only in the browser (`localStorage`) — per-chapter checkmarks, category and
  overall progress rings/bars, resume-where-you-left-off with scroll position
- Light / Dark / Auto appearance in Settings — dark theme uses stepped surfaces
  (`#000` → `#1C1C1E` → `#2C2C2E` → `#3A3A3C`) so cards stay clearly separated
- Colorized code blocks with file-name headers, TypeScript/JavaScript tabs
  (the docs' `@@switch` convention) and copy button
- Real vector icons throughout (no emoji), Vazirmatn UI font

## Build

```bash
npm install        # marked + highlight.js (build-time only)
node build.mjs     # src-docs/content -> data/chapters/*.html + data/catalog.json
```

Then serve the folder statically (GitHub Pages serves it from the repo root).
