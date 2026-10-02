# SANGYAN: Investor Resilience

Educational investor-protection infrastructure for Bharat (Hindi, Tamil, English).

## Overview
We don't predict markets or give investment advice. We show, with simple mathematics and cited sources, why unrealistic return promises cannot be real, and help people act fast when targeted.

Comprehensive documentation is available in [`docs/`](./docs/):
- [`docs/00-README.md`](./docs/00-README.md) - Project index, hard rules, decisions
- [`docs/01-PRD.md`](./docs/01-PRD.md) - Product requirements document
- [`docs/02-FSD.md`](./docs/02-FSD.md) - Functional specifications
- [`docs/03-TDD.md`](./docs/03-TDD.md) - Technical design document

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### Setup & Run
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

### Quality & Verification Commands
- `npm run typecheck` - Strict TypeScript type check
- `npm run lint` - Next.js ESLint verification
- `npm test` - Vitest unit tests for core algorithms (`calc`, `mask`)
- `npm run guardrails` - Static analysis guardrail verification
- `npm run build` - Next.js production build
