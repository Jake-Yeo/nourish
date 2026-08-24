# Nourish

A photo-first nutrition PWA for capturing meals, estimating nutrition, reviewing results, and maintaining a personal food diary.

## Features

- Capture multiple meal photos and add context for each image.
- Request AI-assisted macro estimates, then review and edit estimates before logging.
- Store diary entries, goals, saved meals, and sync state in a server-side SQLite database.
- Run long-lived meal-analysis and import workflows on the server so they can continue after the PWA closes.

## Stack

React, TypeScript, Vite, Tailwind CSS, Express, SQLite, and the OpenAI Responses API.

## Run locally

```bash
npm install
OPENAI_API_KEY=your_key npm run serve
```

The server defaults to `127.0.0.1:4174`. Keep API keys in a local environment file, never in client code or committed files.

## Checks

```bash
npm run check
```

> Nutrition estimates are informational and require user review before being saved.
