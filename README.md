# CompliHealth

CompliHealth is a healthcare insurance management platform that models policy management, claims
processing, provider networks, and analytics across four stakeholder roles: customers, hospitals,
third-party administrators (TPAs), and insurers.

This is a **self-contained demo application**. All data is in-memory sample data defined in the
page components, and authentication is a local, password-gated demo sign-in with no external
backend. It is intended as a showcase of the role-based UI and workflows, not a production
insurance system.

## Current capabilities

- **Role-based dashboards** — Dashboard, Claims, Policies, Providers, and Coverage views adapt
  their content and available actions to the signed-in user's role.
- **Demo authentication** — Local, session-persisted sign-in (`localStorage`) with four seeded
  demo accounts, one per role.
- **Provider directory** — Search, filter (type, specialty, network status), and sort a sample
  provider network; view detailed provider profiles and a demo appointment-booking action.
- **Claims workflow** — Role-aware claims list with a new-claim submission form for hospital
  accounts.
- **Policy management** — Policy summaries, renewal tracking, and a coverage-breakdown dialog per
  policy.
- **Coverage explorer** — Deductible and out-of-pocket tracking, and a filterable breakdown of
  covered services.
- **Analytics dashboard** — Forecasting and claims/member analytics charts for insurer and TPA
  roles.

## Architecture overview

- **Framework**: Next.js 15 (App Router), React 19, TypeScript.
- **UI**: Tailwind CSS with a local set of [shadcn/ui](https://ui.shadcn.com/)-derived primitives
  in `components/ui/`, Radix UI underneath, and Recharts for analytics visualizations.
- **State**: Component-local state and a single `AuthContext` for the demo session; there is no
  external database or API layer.
- **Testing**: Jest + React Testing Library for unit and integration tests.

## Technology stack

| Layer      | Technology |
|------------|------------|
| Framework  | Next.js 15, React 19 |
| Language   | TypeScript 5 |
| Styling    | Tailwind CSS, tailwindcss-animate |
| Components | Radix UI primitives, class-variance-authority |
| Charts     | Recharts |
| Testing    | Jest, React Testing Library, @testing-library/user-event |
| Linting    | ESLint (`next/core-web-vitals`, `next/typescript`) |

## Repository structure

```
app/                  Next.js App Router pages (one folder per route)
components/
  layout/             Application shell (MainLayout: nav, header, user menu)
  ui/                  Local shadcn/ui-derived primitives
  theme-provider.tsx   next-themes wrapper
contexts/
  auth-context.tsx     Demo authentication context (localStorage-backed)
hooks/                 Shared React hooks (mobile breakpoint, toast)
lib/
  utils.ts             Shared utility helpers (className merge, etc.)
test-utils/            Shared test helpers (not part of the app bundle)
__tests__/             Jest test suites
```

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Local development setup

```bash
git clone https://github.com/adityarachuri/CompliHealth.git
cd CompliHealth
npm ci
npm run dev
```

The app starts at `http://localhost:3000` and redirects to `/login`. Sign in with any of the demo
accounts shown on the login screen using the password `demo123`.

## Configuration and environment variables

This app requires **no environment variables** to run locally — it is fully self-contained. There
is no `.env` file to configure.

## Build and deployment

```bash
npm run build   # production build
npm run start   # serve the production build
```

## Testing and quality assurance

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript, no emit
npm run test          # Jest
npm run test:coverage # Jest with coverage thresholds enforced
npm run verify         # lint + typecheck + test:coverage + build, in sequence
```

Coverage thresholds are enforced in `jest.config.js` for application code (`app/`,
`contexts/`, `lib/`, `components/layout/`). Vendored UI primitives under `components/ui/` and
`hooks/` are excluded from the coverage gate, since they are unmodified third-party component
code rather than this project's own logic.

## Security

See [SECURITY.md](./SECURITY.md) for supported versions and how to report a vulnerability.
Because this app ships no backend and no real user data, its security surface is limited to the
client-side code itself (XSS, dependency vulnerabilities, and the demo auth's own limitations,
which are documented there).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow, coding conventions, and
pull request process.

## Versioning and releases

This project follows [Semantic Versioning](https://semver.org/). See
[CHANGELOG.md](./CHANGELOG.md) for release history.

## Roadmap

- [ ] Replace the in-memory demo data with a real persistence layer
- [ ] Replace the local demo auth with a real identity provider
- [ ] Expand automated test coverage of the `components/ui` layer

## License

This project is licensed under the [MIT License](./LICENSE).
