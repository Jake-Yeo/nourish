# Nourish Development Notes

## Purpose

Nourish is Jake's private, photo-first nutrition PWA. Its primary workflow is multi-photo meal capture, per-photo context, AI macro estimation, review, and local diary logging.

## Stack and commands

- React 19, TypeScript, Vite, plain CSS, Express
- `npm run build` — type-check and production build
- `npm run lint` — lint source
- `npm run serve` — serve the existing build on `127.0.0.1:4174`
- `npm start` — rebuild, then serve

## Constraints

- Keep API credentials server-side. Never place a key in `src/`, `public/`, launcher JSON, logs, or commits.
- `NOURISH_ENV_FILE` may point to Jake's private mode-600 environment file.
- Treat nutrition results as estimates and preserve the review-before-log step.
- Keep meal photos local until Jake explicitly taps Analyze.
- Photo drafts belong in IndexedDB; avoid putting image data URLs in localStorage.
- Preserve mobile camera/PWA behavior and the Ithacus launcher proxy route.
