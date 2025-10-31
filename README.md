# Memo Cards

![Node.js](https://img.shields.io/badge/node-22.14.0-43853d?logo=node.js&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

Memo Cards is a web application that helps intensive learners turn raw study material into curated flashcards backed by spaced repetition. The MVP streamlines the journey from AI-assisted content generation through manual review to scheduled learning sessions.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

- Address the pain of building and maintaining large flashcard sets manually for students, professionals, and self-learners.
- Provide a workflow that turns up to 10,000 characters of Polish source text into high-quality flashcards via AI, with optional manual edits.
- Support end-to-end flashcard lifecycle: generation, review, acceptance, CRUD management, and repetition powered by an external spaced-repetition engine.
- Collect actionable metrics for product owners, such as acceptance rates and counts of AI-generated versus manually created cards.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui, Lucide icons.
- **Backend & Auth:** Supabase (PostgreSQL, authentication, SDKs).
- **AI Integration:** OpenRouter.ai for AI model access and rate control.
- **Tooling:** ESLint 9 with TypeScript/React plugins, Prettier, Tailwind Merge, Husky, lint-staged.
- **DevOps & Hosting:** GitHub Actions for CI/CD, Docker deployment to DigitalOcean.

Additional internal documentation: `.ai/prd.md` (product requirements) and `.ai/tech-stack.md` (technology decisions).

## Getting Started Locally

**Prerequisites**

- Node.js `22.14.0` (see `.nvmrc`).
- npm (bundled with Node) or another Node package manager.

**Setup**

```bash
git clone https://github.com/<your-org>/memo-cards.git
cd memo-cards
npm install
```

Create a `.env` file with credentials for Supabase and OpenRouter before running the app. Example placeholders:

```bash
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
OPENROUTER_API_KEY=<your-openrouter-key>
```

**Local development**

```bash
npm run dev
```

The dev server exposes the Astro application with hot module reload. Review AI generation flows to ensure environment variables are wired correctly.

**Production build**

```bash
npm run build
npm run preview
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Astro development server with live reload. |
| `npm run build` | Generate the production build. |
| `npm run preview` | Serve the build output locally for verification. |
| `npm run lint` | Run ESLint across the codebase. |
| `npm run lint:fix` | Auto-fix lint issues where possible. |
| `npm run format` | Format files with Prettier. |

## Project Scope

**In scope for the MVP**

- Email/password registration, login, session handling, and logout.
- CRUD operations for personal flashcards with validation limits (question ≤ 200 chars, answer ≤ 500 chars).
- AI-powered flashcard generation from Polish input text up to 10,000 characters, including error handling, retries, and manual refinement.
- Batch acceptance or rejection of generated sets, plus per-card edits or deletions before saving.
- Spaced repetition sessions driven by an external library with minimal session persistence.
- Metrics collection: generated vs accepted cards, manual cards, acceptance rates, and reporting access for the product owner.
- Desktop-first UX with clear status messaging, contextual hints, and resilient fallback messaging for external service outages.

**Out of scope (per PRD)**

- Custom or proprietary spaced repetition algorithms.
- Import/export integrations (files or external platforms) and sharing between users.
- Mobile apps, push notifications, multi-deck management, tags, or history/version tracking.
- Automated remediation for AI/library downtime beyond informing the user.

## Project Status

- Product requirements and technical stack decisions are documented and ready for implementation.
- MVP delivery focuses on stability of the end-to-end flashcard workflow and reliable AI integrations.
- Success will be tracked via AI acceptance ratio (≥75%), share of AI-generated cards, manual card volume, and weekly active study sessions.
- Current roadmap prioritizes implementing authenticated flashcards, AI pipelines, and metrics dashboards before expansion.

## License

This project is licensed under the [MIT License](./LICENSE).
