# Power Track

Power Track is an appliance-level energy analytics platform built with Next.js. It helps teams monitor energy usage, compare estimated versus actual consumption, and improve operational decisions across devices and branches.

## Status

[![Release](https://img.shields.io/github/actions/workflow/status/YOUR_ORG/power-track/release.yml?branch=master&label=release)](https://github.com/YOUR_ORG/power-track/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Update the badge URLs with your actual GitHub organization/user and repository name.

## Table of Contents

- Overview
- Features
- Tech Stack
- Project Structure
- Getting Started
- Configuration
- Scripts
- Releases
- Deployment
- Contributing
- Security
- License

## Overview

Power Track provides a dashboard for energy visibility and analysis, with authentication-protected routes and branch-aware monitoring views.

## Features

- Real-time monitoring dashboard
- Appliance and branch-level visibility
- Estimated versus actual usage tracking
- Alerts, logs, and reports views
- Protected application routes and auth flows

## Tech Stack

- Next.js (App Router)
- React and TypeScript
- Prisma ORM
- Better Auth
- Tailwind CSS

## Project Structure

- src/app: App Router pages, route layouts, API route handlers, UI components
- src/lib: Auth, Prisma, and shared service utilities
- prisma: Prisma schema and migrations
- public: Static assets
- .github/workflows: CI/CD and release workflows

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Database configured for Prisma

### Install and Run

1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a .env file and set required environment variables.
4. Apply database migrations (if applicable).
5. Start the development server:

   ```bash
   npm run dev
   ```

App URL: <http://localhost:3000>

## Configuration

Environment configuration is managed with .env. At minimum, configure database and auth-related values required by Prisma and Better Auth.

## Scripts

- npm run dev: Start development server
- npm run build: Build production bundle
- npm run start: Start production server
- npm run lint: Run ESLint
- npm run commitlint: Validate a commit message
- npm run release: Run semantic-release (CI)

## Deployment

- Deploy as a Node.js web app on a platform that supports Next.js (for example Vercel, Azure App Service, Railway, or a container platform).

### Production Build Commands

```bash
npm ci
npm run build
npm run start
```

### CI/CD Notes

- Ensure production environment variables are set in your deployment platform.
- Ensure migrations are applied before app startup in production.
- Keep your default release branch protected and use pull requests for changes.

## Contributing

1. Create a branch from your default release branch.
2. Make focused changes.
3. Commit with Conventional Commits.
4. Open a pull request.
5. After merge to the default release branch, automated release runs.

## Security

- Do not commit secrets or .env files.
- Rotate credentials if exposed.
- Report vulnerabilities privately to maintainers.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
