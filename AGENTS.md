# Nourish Development Notes

## Purpose

Nourish is Jake's private, photo-first nutrition PWA. Its primary workflow is multi-photo meal capture, per-photo context, AI macro estimation, review, and local diary logging.

## Stack and commands

- React 19, TypeScript, Vite, Tailwind CSS 4, Express, SQLite
- `npm run build` — type-check and production build
- `npm run lint` — lint source
- `npm run check` — enforce architecture, lint, type-check, and build
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
- Define colors, spacing, typography, radii, shadows, breakpoints, and layout measurements as semantic tokens in `tailwind.config.js`. Feature components must not contain raw color or spacing values.
- Build features from stateless primitives in `src/components/ui`. Every primitive accepts `className` through the shared `cn()` helper backed by `clsx` and `tailwind-merge`; use CVA or a named map for variants.
- Keep every component, hook, and function focused on one responsibility in its own named file under 100 lines. Do not add descriptive inline comments; use explicit self-documenting names.
- Keep `src/index.css` limited to Tailwind's config/compiler imports. Do not add authored selectors, CSS modules, Sass, styled-components, or `@apply`.
- Do not add MUI by default. Nourish has a custom consumer UI, and a second design system adds weight and override work without improving the experience.
- Use the palette, typography, spacing, shape, responsive, and accessibility rules in `STYLE.md`.
- Inputs must remain at least 16px on iOS to prevent focus zoom. Nourish intentionally disables zoom; other launcher apps do not inherit this behavior.

## Project structure

- `src/components/ui/` — stateless reusable primitives
- `src/components/layout/` and `src/components/nutrition/` — reusable composed presentation
- `src/features/` — feature interfaces composed from primitives
- `src/hooks/` — isolated client state and orchestration
- `src/services/` — browser persistence and API clients
- `src/lib/` — one-purpose utilities
- `server/routes/` — request handlers
- `server/database/`, `server/mynetdiary/`, `server/vision/`, `server/keychain/` — isolated backend responsibilities
