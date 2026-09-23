# FitForPDF Frontend

This is the public web frontend for FitForPDF.
It lets users upload CSV/Excel files, set rendering options, and download generated PDFs through the secure backend API.

## Tech stack

- Next.js 14 (App Router)
- React 18
- Server route: `/app/api/render` (Vercel serverless) proxies to backend API

## Repository scope

- `app/` : Next.js app routes, UI, and API route used by the frontend.
- `public/` : Static assets (if added).

## Environment variables

Create `.env.local` for local development:

- `BACKEND_URL` (required)
- `API_KEY` (required)

The frontend never hardcodes secrets in client code.

Example:

```bash
# /app/api/render/route.js forwards to BACKEND_URL
BACKEND_URL=https://cleansheet-api.neatexport.com
API_KEY=<secret>
```

## Useful commands

- `npm run dev` → start local dev server on port `3001`
- `npm test` → run frontend tests
- `npm run build` → build for production
- `npm run start` → serve production build on port `3001`

With the local server running and gstack installed, run
`node --test scripts/mobile-hero.browser.test.mjs` to check that the product
image does not cover the hero or free-tier disclosure at 375, 390 and 430px.
This browser check is separate from unit CI. Node 22 is supported by the
existing test suite; Node 26's native Web Storage conflicts with jsdom.

## Development guardrails

- Run changes from this repo only for frontend edits.
- Do not commit build artifacts (`.next/`, `node_modules/`).
- Prefer server-side API calls through `/api/render` to keep backend secrets on the server.

## Deployment

- Hosted on Vercel.
- Deploy through connected GitHub branch (recommended).
- Ensure `BACKEND_URL` and `API_KEY` are configured in Vercel environment variables.
