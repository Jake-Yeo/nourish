# Nourish Development Notes

## Purpose

Nourish is Jake's private, photo-first nutrition PWA. Its primary workflow is multi-photo meal capture, per-photo context, AI macro estimation, review, and local diary logging.

## Stack and commands

- React 19, TypeScript, Vite, Tailwind CSS 4, Express, SQLite
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
- Persist diary entries and goals in the shared server-side SQLite database. Browser storage is only a disposable cache/draft layer, never the source of truth.
- Keep the bottom navigation's `aria-label="Bottom navigation"`; the launcher uses that stable semantic hook to inject its Exit tab.

## Frontend conventions

- Use React, TypeScript, and Tailwind utility classes directly in component `className` values.
- Keep `src/index.css` limited to Tailwind's required compiler import. Do not add authored selectors, CSS modules, Sass, styled-components, or `@apply`.
- Do not add MUI by default. Nourish has a custom consumer UI, and a second design system adds weight and override work without improving the experience.
- Use the palette, typography, spacing, shape, responsive, and accessibility rules in `STYLE.md`.
- Inputs must remain at least 16px on iOS to prevent focus zoom. Nourish intentionally disables zoom; other launcher apps do not inherit this behavior.
