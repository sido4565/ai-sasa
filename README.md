# AI Sasa

AI Sasa is an early-stage concept for a Kenyan AI awareness and adoption company. This repository contains a responsive investor and pilot-partner landing page plus the initial company concept.

**Stage:** Concept preview. AI Sasa is a working name. No customers, measured outcomes, or operating company are claimed.

## Preview locally

Run the Node server for the complete site and enquiry flow. The static files can still be opened directly for a visual preview, but form submissions require the server.

## Run locally

Requires Node.js 22.13 or newer. No package installation is needed.

```sh
npm start
```

Open `http://localhost:3000`. The server creates `data/ai-sasa.sqlite` automatically and stores submitted demo requests there. Set `PORT` to change the listening port, `DB_PATH` to choose a persistent database file, and `ADMIN_TOKEN` to enable access to the private enquiry endpoint.

```sh
ADMIN_TOKEN='use-a-long-random-secret' npm start
```

List enquiries with `GET /api/admin/requests` and an `Authorization: Bearer <ADMIN_TOKEN>` header. The endpoint supports `limit` (up to 100) and `offset` query parameters. `GET /api/health` is available for host health checks.

The app must be deployed to a Node.js host with persistent disk storage mounted for the SQLite database. GitHub Pages can only host the static preview; it cannot run this API or accept form submissions.

## What's included

- Responsive landing page inspired by the supplied reference
- Mobile navigation with keyboard and screen-reader state
- Keyboard-operable use-case selector and accessible dialog behavior
- Private, in-browser AI readiness check with tailored suggested next steps
- Search/social metadata, browser theme color and a lightweight inline favicon
- Demo request form with server-side validation and SQLite persistence
- JSON API with rate limiting, request size limits, a bot honeypot, and token-protected enquiry access
- Investor concept and pilot outline in `INVESTOR_CONCEPT.md`
- GitHub Actions workflow for GitHub Pages deployment

## Before publishing

1. Set a long, private `ADMIN_TOKEN` and configure persistent disk storage when deploying the server. The server stores enquiries but does not yet send email notifications.
2. Confirm the company name, domain, contact details, and claims before public use.
3. The illustrative +32% metric in the early mockup has been removed. Numbers currently shown are sourced market context or explicitly marked pilot targets.
4. Review source notes in the page and investor concept before using them in fundraising materials.

## Static preview with GitHub Pages

The included workflow publishes the static preview from `main` whenever code is pushed. The enquiry API is not available on GitHub Pages; run the Node server on a Node-capable host for a working form. After pushing this repository to GitHub:

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. The workflow will deploy the page on the next push (or run it manually from **Actions**).

## Project structure

```text
ai-sasa/
├── .github/workflows/pages.yml
├── index.html
├── server.js
├── backend-client.js
├── readiness.js
├── INVESTOR_CONCEPT.md
└── README.md
```
