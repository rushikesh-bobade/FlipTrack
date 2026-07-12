# 🤝 Contributing to FlipTrack

First off — **thank you** for considering contributing to FlipTrack! Every bug report, feature request, documentation fix, and code contribution matters. This guide will help you get up and running quickly and ensure that every contribution has the highest chance of being accepted.

> **Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing. We take community standards seriously.**

> ⭐ **Show your support!** Before you get started, please consider giving the repository a star. It helps the project grow and increases visibility for all contributors.

## 📖 Table of Contents

- [Ways to Contribute](#-ways-to-contribute)
- [Getting Started — Development Setup](#-getting-started--development-setup)
  - [Prerequisites](#prerequisites)
  - [Fork & Clone](#1-fork--clone)
  - [Install Dependencies](#2-install-dependencies)
  - [Environment Variables](#3-environment-variables)
  - [Database Setup](#4-database-setup)
  - [Seed Demo Data](#5-seed-demo-data)
  - [Start the Dev Server](#6-start-the-dev-server)
- [Project Architecture](#-project-architecture)
- [Development Workflow](#-development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Commit Convention](#commit-convention)
  - [Code Style & Linting](#code-style--linting)
  - [Writing Tests](#writing-tests)
- [Submitting a Pull Request](#-submitting-a-pull-request)
- [Reporting Bugs](#-reporting-bugs)
- [Suggesting Features](#-suggesting-features)
- [Issue Labels Guide](#-issue-labels-guide)
- [Community & Support](#-community--support)

---

## 💡 Ways to Contribute

There are many ways you can help FlipTrack — and you don't need to be a senior developer to make a real impact:

| Contribution Type | Description |
| :--- | :--- |
| 🐛 **Bug Reports** | Found something broken? [Open an issue](#-reporting-bugs). |
| ✨ **Feature Requests** | Have an idea? [Suggest it](#-suggesting-features). |
| 🔧 **Code Contributions** | Fix a bug or build a feature via [Pull Request](#-submitting-a-pull-request). |
| 📝 **Documentation** | Improve this guide, the README, or inline code comments. |
| 🎨 **Design / UI** | Propose UI improvements, accessibility fixes, or theme tweaks. |
| 🧪 **Testing** | Write unit or integration tests to increase code coverage. |
| 🌐 **Translations** | Help translate the UI to other languages. |
| 💬 **Community Help** | Answer questions in Issues or Discussions. |

---

## 🛠 Getting Started — Development Setup

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Link |
| :--- | :--- | :--- |
| **Node.js** | v18.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | v9.x or higher | Comes with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **PostgreSQL** | Any (via Supabase) | [supabase.com](https://supabase.com/) |

You will also need:
- A free **[Supabase](https://supabase.com/)** account (for the PostgreSQL database and authentication).
- A free **[Groq](https://console.groq.com/)** API key (for AI-powered insights — optional for most contributions).

---

### 1. Fork & Clone

```bash
# Fork the repository on GitHub, then clone your fork:
git clone https://github.com/<your-username>/FlipTrack.git
cd FlipTrack

# Add the upstream remote so you can pull future changes:
git remote add upstream https://github.com/rushikesh-bobade/FlipTrack.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root. Use `.env.example` as a reference:

```bash
cp .env.example .env
```

Then populate the following values:

```env
# ── Supabase ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
DATABASE_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@db.your-project.supabase.co:5432/postgres"

# ── Groq AI (optional) ───────────────────────
GROQ_API_KEY="gsk_your_groq_api_key"
```

> **⚠️ Important:** Never commit your `.env` file. It is already in `.gitignore`.

### 4. Database Setup

Push the Prisma schema to your Supabase PostgreSQL instance and generate the client:

```bash
npx prisma db push
npx prisma generate
```

### 5. Seed Demo Data

Populate your database with realistic sneaker inventory, sales, expenses, price alerts, and market prices:

```bash
npx tsx prisma/seed.ts
```

### 6. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. You can click **"Use Demo Credentials"** on the login page to access the populated dashboard instantly.

---

## 🏗 Project Architecture

Understanding the codebase structure will help you find the right place for your changes:

```
FlipTrack/
├── app/
│   ├── blocks/              # UI components grouped by feature
│   │   ├── __global/        # Shared components (navbar, sidebar, footer)
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── home/            # Landing page sections
│   │   ├── inventory-management/
│   │   ├── income-statement/
│   │   ├── market-prices/
│   │   ├── price-alerts/
│   │   ├── settings/
│   │   └── ...
│   ├── routes/              # React Router v7 route modules (loaders + actions + UI)
│   ├── styles/              # Global CSS & design tokens (theme.css)
│   ├── utils/               # Server utilities (Supabase client, helpers)
│   ├── routes.ts            # Route configuration registry
│   └── root.tsx             # App shell, HTML head, theme initialization
├── prisma/
│   ├── schema.prisma        # Database schema (single source of truth)
│   └── seed.ts              # Demo data seeder
├── public/                  # Static assets
├── .env.example             # Environment variable template
├── .github/                 # GitHub templates (PR template, issue templates)
├── CONTRIBUTING.md           # ← You are here!
├── CODE_OF_CONDUCT.md
├── LICENSE                   # MIT License
└── README.md
```

### Key Architectural Patterns

| Pattern | Details |
| :--- | :--- |
| **Route Modules** | Each route file in `app/routes/` exports a `loader` (GET), `action` (POST), and a default React component. |
| **CSS Modules** | Every component uses co-located `.module.css` files with CSS variables from `app/styles/theme.css`. |
| **Design Tokens** | All colors, spacing, radii, and shadows are defined as CSS custom properties. Never use hardcoded hex values — always use `var(--color-*)`. |
| **Light/Dark Theme** | The `[data-theme="light"]` selector in `theme.css` overrides tokens. All new UI must work in both themes. |
| **Prisma ORM** | All database access goes through Prisma. The schema is in `prisma/schema.prisma`. |
| **Decimal Serialization** | Prisma `Decimal` fields must be converted with `Number()` before passing to client components. |

---

## 🔀 Development Workflow

### Branching Strategy

Always create a new branch from the latest `main`:

```bash
# Sync your fork with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes:
git checkout -b fix/short-bug-description
```

**Branch naming convention:**

| Prefix | Use Case | Example |
| :--- | :--- | :--- |
| `feature/` | New features | `feature/bulk-item-import` |
| `fix/` | Bug fixes | `fix/login-redirect-loop` |
| `docs/` | Documentation only | `docs/update-api-guide` |
| `refactor/` | Code restructuring | `refactor/extract-auth-util` |
| `style/` | UI/CSS-only changes | `style/improve-light-mode` |
| `chore/` | Tooling, deps, config | `chore/update-prisma` |

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). This ensures a clean, parseable git history.

```
<type>(<optional scope>): <description>

[optional body]

[optional footer]
```

**Examples:**

```bash
feat(inventory): add inline editing for item fields
fix(auth): resolve cookie expiry causing silent logout
docs: update CONTRIBUTING.md with architecture section
style(landing): fix hero section contrast in light mode
chore: bump prisma to v5.23
```

**Allowed types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`.

### Code Style & Linting

- **TypeScript** — All code must be type-safe. Avoid `any` unless absolutely necessary.
- **Prettier** — Code formatting is enforced. Run before committing:
  ```bash
  npx prettier --write .
  ```
- **CSS** — Use CSS Modules (`.module.css`) with design tokens from `theme.css`. Never use inline hardcoded colors.
- **Imports** — Use the `~/` alias for imports from `app/` (e.g., `import { X } from "~/utils/supabase.server"`).

### Writing Tests

We welcome test contributions! While the project doesn't yet have full test coverage, we encourage:

- **Unit tests** for utility functions and data transformation logic.
- **Component tests** for complex interactive UI (modals, forms).
- Place test files alongside the code they test, named `*.test.ts` or `*.test.tsx`.

---

## 📬 Submitting a Pull Request

1. **Push** your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** against the `main` branch of `rushikesh-bobade/FlipTrack`.

3. **Fill out the PR template** — describe your changes, link related issues, and check the applicable boxes.

4. **Wait for review** — A maintainer will review your PR. Be responsive to feedback and requested changes.

### PR Checklist

Before submitting, ensure:

- [ ] Your code builds without errors (`npm run build`)
- [ ] Your code is formatted (`npx prettier --write .`)
- [ ] You've tested your changes locally in **both Light and Dark mode**
- [ ] You've added/updated relevant documentation
- [ ] You've written descriptive commit messages using the conventional format
- [ ] Your PR targets the `main` branch
- [ ] You've linked any related GitHub Issues (e.g., `Closes #42`)

### What Happens After You Submit?

| Step | Timeline |
| :--- | :--- |
| **Acknowledgement** | Within 48 hours |
| **Initial Review** | Within 1 week |
| **Merge** | After approval and all checks pass |

---

## 🐛 Reporting Bugs

Found a bug? Thank you for reporting it!

1. **Search existing issues** first to check if it's already been reported.
2. **Open a new issue** using the **Bug Report** template.
3. Include:
   - **Steps to reproduce** the bug
   - **Expected behavior** vs. **Actual behavior**
   - **Screenshots or screen recordings** (if applicable)
   - **Browser, OS, and Node.js version**
   - **Console errors** (if any)

---

## ✨ Suggesting Features

We love hearing new ideas!

1. **Open a new issue** using the **Feature Request** template.
2. Include:
   - **Problem statement** — What pain point does this solve?
   - **Proposed solution** — How should it work?
   - **Alternatives considered** — What other approaches did you think of?
   - **Mockups or wireframes** (if applicable)

---

## 🏷 Issue Labels Guide

| Label | Meaning |
| :--- | :--- |
| `good first issue` | Great for newcomers — well-scoped and documented |
| `help wanted` | We need community help on this |
| `bug` | Confirmed bug report |
| `enhancement` | Approved feature request |
| `documentation` | Docs improvement needed |
| `priority: high` | Critical — blocks users |
| `priority: low` | Nice-to-have improvement |
| `wontfix` | Intentionally not addressing |
| `duplicate` | Already tracked elsewhere |

---

## 💬 Community & Support

- **GitHub Issues** — For bug reports, feature requests, and technical discussions.
- **GitHub Discussions** — For general questions, ideas, and community conversations.
- **Pull Requests** — For code contributions.

---

## 🙏 Recognition

All contributors will be recognized in the project. We value every contribution — whether it's a single typo fix or a major feature.

---

<div align="center">
  <strong>Thank you for helping make FlipTrack better! 🎯</strong>
  <br />
  <sub>Built with ❤️ by the FlipTrack community</sub>
</div>

---

## Rate Limiting

A reusable `rateLimit(request, limit, windowMs)` utility is available in `app/utils/rate-limit.server.ts`.

Example:

```ts
await rateLimit(request, 5, 60_000);
```

This implementation uses a Prisma-backed PostgreSQL database for rate limiting. Expired records are periodically cleaned up using lightweight probabilistic cleanup to prevent unbounded table growth. For larger distributed deployments, a dedicated rate-limiting backend such as Upstash Redis may still be preferable.