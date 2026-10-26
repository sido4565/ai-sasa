# AI Sasa

AI Sasa is an early-stage concept for a Kenyan AI awareness and adoption company. This repository contains a responsive investor and pilot-partner landing page plus the initial company concept.

**Stage:** Concept preview. AI Sasa is a working name. No customers, measured outcomes, or operating company are claimed.

## Preview locally

Open `index.html` in a browser. The site uses plain HTML, CSS, and JavaScript; no build step or dependencies are needed.

## What's included

- Responsive landing page inspired by the supplied reference
- Mobile navigation with keyboard and screen-reader state
- Keyboard-operable use-case selector and accessible dialog behavior
- Search/social metadata, browser theme color and a lightweight inline favicon
- Demo request form with validation and `mailto:` handoff
- Investor concept and pilot outline in `INVESTOR_CONCEPT.md`
- GitHub Actions workflow for GitHub Pages deployment

## Before publishing

1. Replace the placeholder `hello@aisasa.co.ke` in `index.html` with an active contact address, or connect the form to a real form service/backend. The form currently opens a prefilled email draft; it does not collect enquiries on a server.
2. Confirm the company name, domain, contact details, and claims before public use.
3. The illustrative +32% metric in the early mockup has been removed. Numbers currently shown are sourced market context or explicitly marked pilot targets.
4. Review source notes in the page and investor concept before using them in fundraising materials.

## Publish with GitHub Pages

The included workflow publishes the root of `main` whenever code is pushed. After pushing this repository to GitHub:

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. The workflow will deploy the page on the next push (or run it manually from **Actions**).

## Project structure

```text
ai-sasa/
├── .github/workflows/pages.yml
├── index.html
├── INVESTOR_CONCEPT.md
└── README.md
```
