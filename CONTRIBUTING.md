# Contributing to CompliHealth

Thanks for your interest in contributing. This is a demo/showcase project, so the bar for
contributions is lower-stakes than a production system, but the same engineering discipline still
applies.

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Getting started

```bash
git clone https://github.com/<your-fork>/CompliHealth.git
cd CompliHealth
npm ci
npm run dev
```

No environment variables are required — the app runs entirely on in-memory demo data.

## Branching

- Branch off `main`.
- Use a descriptive branch name: `feat/<short-description>`, `fix/<short-description>`,
  `docs/<short-description>`, etc.

## Coding conventions

- TypeScript, strict mode. Avoid `any`; prefer precise types.
- Functional React components with hooks.
- Styling via Tailwind utility classes; reuse existing `components/ui/` primitives rather than
  introducing new one-off styling.
- Keep components focused — prefer extracting a helper or sub-component over growing a file
  indefinitely.
- Default to no comments; add one only when the *why*, not the *what*, would otherwise be lost
  (a non-obvious constraint, a workaround, a subtle invariant).

## Required checks before opening a pull request

Run the full verification pipeline locally:

```bash
npm run verify
```

This runs, in order: ESLint, the TypeScript compiler (no emit), the Jest suite with coverage
thresholds enforced, and a production build. All four must pass.

If you add or change behavior in `app/`, `contexts/`, `lib/`, or `components/layout/`, add or
update tests in `__tests__/` to cover it — these directories are included in the enforced coverage
gate (see `jest.config.js`). Changes under `components/ui/` or `hooks/` (vendored UI primitives)
do not need new tests unless you're changing their actual behavior, not just their styling.

## Commit messages

Use a short, imperative summary line (e.g. `fix: correct claim status badge color`). Reference the
issue or PR it relates to in the body if useful context exists.

## Pull request process

1. Fork the repository and create your branch from `main`.
2. Make your changes, with tests.
3. Run `npm run verify` and confirm it passes.
4. Open a pull request describing what changed and why.
5. Address review feedback. A maintainer will merge once the checks are green and the review is
   approved.

## Reporting bugs or requesting features

Open a GitHub issue. For security vulnerabilities, follow [SECURITY.md](./SECURITY.md) instead of
filing a public issue.
