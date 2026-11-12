# Changelog

All notable changes to this project are documented in this file. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-11-12

### Added
- `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, and this changelog.
- GitHub Actions CI workflow running lint, typecheck, test with coverage, and build on every push
  and pull request.
- Test coverage for previously untested pages: home redirect, login, claims, coverage, and
  policies.
- `aria-label`s on the mobile navigation toggle and the login page's show/hide password button.
- A default `type="button"` on the shared `Button` component so buttons never accidentally submit
  an enclosing form.
- `docs/ARCHITECTURE.md`, a full technical deep dive into the routing, auth flow, authorization
  model, page data models, and known architectural limitations.
- `docs/complihealth-ip-licensing-guide.md`, a repository-specific IP and licensing governance
  record, and a license-scope clarification note in the README.
- `app/icon.svg`, a browser-tab favicon (none previously existed, causing a 404 on every page
  load).

### Changed
- Rewrote `README.md` to describe the project as a standalone application; removed all references
  to the v0.dev-synced origin of this repository.
- Upgraded Next.js to 15.5.x (patches a known React Server Components CVE present in 15.2.4) and
  refreshed other dependencies to their latest compatible versions.
- Consolidated the main navigation's duplicate, partially non-functional mobile `Sheet` into a
  single working one.
- Fixed `jest.config.js` (`moduleNameMapping` → `moduleNameMapper`, the correct Jest option name)
  and removed a broken self-import of the `jest` package from `jest.setup.js` and every test file.
- Rewrote the test suites under `__tests__/` to match the application's actual behavior; many had
  drifted from the UI (wrong labels, a disconnected Supabase-based auth mock, fictional screens)
  and were failing or silently testing the wrong thing.

### Removed
- `lib/supabase.ts`, the `@supabase/supabase-js` dependency, and the two Supabase seed/schema SQL
  scripts — the application does not use a backend; all auth and data are local demo state.
- ~30 unused shadcn/ui component files with zero references in the codebase, and their now-unused
  npm dependencies (`react-hook-form`, `zod`, `cmdk`, `vaul`, `date-fns`, and others).
- Three placeholder Node scripts under `scripts/` that printed hard-coded fake "PASS" output
  instead of running real tests.
- The `v0.dev` sync badges and the `generator: 'v0.dev'` metadata tag.

### Fixed
- A crash (`Cannot read properties of undefined`) in `MainLayout` and the dashboard page when a
  user's name was missing.
- A type-safety issue in the analytics page's chart tooltip formatter.
- Several accessibility and dead-code issues flagged by ESLint (unused variables, a missing
  `useEffect` dependency, an unescaped apostrophe, an empty TypeScript interface).
- `package-lock.json` still listed `@supabase/supabase-js` after the dependency was removed from
  `package.json`, which would have broken `npm ci` on a clean checkout.
- The demo policies page hardcoded a 2024 policy period, so the renewal countdown went negative
  once that year passed; policy dates now derive from the current year.
- Two interaction-heavy tests intermittently exceeded Jest's 20s timeout under load; bumped to
  30s.

## [0.1.0] — Prior history

The project originated as a v0.dev-generated prototype, auto-synced to this repository. That
history has been superseded by the 1.0.0 release above; see the repository's release notes for
details on the public history.
