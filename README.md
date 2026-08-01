# Nourish

Private, photo-first nutrition PWA for Jake. Photograph a meal from multiple angles, annotate each image, receive an AI macro estimate, review it, and log it locally.

## Run

```bash
npm install
npm run build
OPENAI_API_KEY=... npm run serve
```

The server binds to `127.0.0.1:4174` by default. Override with `PORT` and optionally `OPENAI_VISION_MODEL` (defaults to `gpt-5.6-luna`). Never place API keys in frontend code or committed files.

`NOURISH_ENV_FILE=/absolute/path/to/.env` may point the server at an existing private environment file. The Ithacus launcher uses Jake's existing mode-600 Callumployed environment file without copying its contents.

## Data

- Diary and goals: browser local storage
- Photo drafts: IndexedDB
- Meal photos: sent to the local server only when Analyze is tapped
- Vision analysis: OpenAI Responses API; estimates must be reviewed before logging

Nutrition estimates are informational and can vary substantially based on hidden ingredients and portion ambiguity.
