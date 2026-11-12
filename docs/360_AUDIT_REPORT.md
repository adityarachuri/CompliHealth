# CompliHealth 360° Audit

Benchmarked against modern enterprise software product-engineering standards.

- **Audited:** 2026-11-12
- **Scope:** ~6,150 LOC, Next.js 15 / React 19 / TypeScript
- **Method:** Four independent, evidence-based reviews (architecture & code quality, security & compliance, testing & DevOps, documentation/DX/UX/product), synthesized into a weighted scorecard

> **Scope note:** CompliHealth is an explicitly self-contained frontend demo (in-memory sample data, local mock authentication, no backend). The scores below judge it as such — a UI/UX showcase — not as a production system.

## Overall score: 50/100 — Tier 3 (Defined)

CompliHealth is an unusually honest, well-documented UI showcase — test craft, documentation, and product scoping all land above the typical demo-repo norm. What holds the score down is structural: no data/service layer, inconsistent auth-guarding across routes, build-time lint/type checks disabled, and a currently-red CI run. None of that is unexpected for a portfolio project — it's exactly what separates a demo from a product.

**Maturity scale:** Ad hoc (0–2) · Developing (2–4) · Defined (4–6) · Managed (6–8) · Optimized (8–10)

## Category scores

| Category | Score /10 | Weight | Tier |
| --- | --- | --- | --- |
| Code quality & maintainability | 3 | 14% | Developing |
| Security & compliance | 6 | 14% | Defined |
| Architecture & design | 4 | 12% | Developing |
| Testing & reliability | 6.5 | 12% | Managed |
| DevOps & delivery | 5 | 12% | Defined |
| Product completeness | 7 | 10% | Managed |
| UX & usability | 5 | 10% | Defined |
| Documentation | 7 | 8% | Managed |
| Observability & operations | 2 | 8% | Ad hoc |

## Category detail

### Code quality & maintainability — 3/10 (weight 14%)

tsconfig is strict, but the build ignores both ESLint and TypeScript errors, and nearly every route hand-rolls its own duplicated mock data and status-color maps.

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — tsconfig's `strict: true` is cosmetic since a broken build still ships.
- Every route defines its own inline mock-data arrays with no shared module: `mockClaims` (`app/claims/page.tsx:29`), `providersData` (`app/providers/page.tsx:41`), 8 separate analytics arrays (`app/analytics/page.tsx:41-122`).
- Domain types exist for only 2 of 6 routes; dashboard, providers, coverage, and analytics infer shapes from literals with no shared types module.
- `statusColors` maps are redefined per page instead of shared (`app/claims/page.tsx:66` vs `app/policies/page.tsx:43`).

### Security & compliance — 6/10 (weight 14%)

Secrets hygiene and CI security scanning are solid; authentication is intentionally fake and headers/hardening are absent.

- Auth is a hardcoded password check with the full session object (incl. `role`) stored unsigned in `localStorage` (`contexts/auth-context.tsx:86,97`) — editable in devtools to escalate role.
- No security headers (CSP/HSTS/X-Frame-Options) anywhere in `next.config.mjs`, alongside the disabled ESLint/TypeScript build gates.
- CodeQL SAST is properly configured (JS/TS, push/PR + weekly cron) and Dependabot covers npm + GitHub Actions; `npm audit` found 2 prod-path vulnerabilities (1 moderate, 1 high — vendored `postcss` in Next.js) and 14 total, none gated in CI.
- `SECURITY.md` is unusually credible for a demo — it names the demo-auth risk explicitly as a known accepted risk and gives a real disclosure process with a 5-business-day SLA.

### Architecture & design — 4/10 (weight 12%)

Conventional folder layout, but no data/service seam, and the layout/auth-guard pattern is inconsistent across routes.

- Three different auth-gating approaches across 6 routes; `app/coverage` and `app/analytics` ship with zero auth check and no navigation chrome, while dashboard/claims/policies duplicate an identical 37-line guard in each `layout.tsx`.
- `lib/` contains only a className helper — no API/service/repository layer; zero fetch calls exist anywhere in `app/`, so swapping in a real backend means touching every page individually.
- `components/ui/*` (shadcn-derived) is genuinely reusable; `components/layout/main-layout.tsx` (250 lines) is a monolith mixing nav, role-display, and sidebar logic with no sub-component extraction.

### Testing & reliability — 6.5/10 (weight 12%)

Test-writing craft is genuinely strong — RTL best practices, real a11y assertions, 90%/89% line/statement coverage — but the suite is currently red.

- This audit's own `npm run test:coverage` run: 2 of 14 suites failed. `__tests__/providers-integration.test.tsx` timed out at the 20s Jest limit after ~88s, plus a worker-teardown-leak warning — CI is not currently green.
- Coverage thresholds (85/75/85/85) are met in aggregate (89.6% / 77.5% / 90.4% / 90.3%), but gaps concentrate in `app/dashboard/page.tsx` (65% branches) and `contexts/auth-context.tsx` (50% branches).
- Tests query by role/label/placeholder almost exclusively with zero snapshot tests; `providers-accessibility.test.tsx` bakes in real keyboard-nav and focus-return assertions.

### DevOps & delivery — 5/10 (weight 12%)

A unified verify pipeline and CodeQL scanning beat the typical demo repo, but release automation and formatting enforcement are missing or documentation-only.

- `.github/workflows/ci.yml` runs lint → typecheck → test:coverage → build as one least-privilege job, but has no `npm audit` gate and pins only Node 20 (no version matrix).
- No `.prettierrc` anywhere — formatting is unenforced beyond ESLint's minimal defaults; no pre-commit hook.
- No `engines` field and no `.nvmrc` — the README's Node/npm version requirement is prose-only, unenforced by tooling.
- `CHANGELOG.md` is hand-maintained with no semantic-release/changesets automation; version is a hardcoded `1.0.0`.

### Product completeness — 7/10 (weight 10%)

Every capability the README claims is actually implemented at real depth — honest scoping, not vaporware.

- Zero TODO/FIXME/placeholder-feature markers across `app/` — the only "placeholder" matches are legitimate HTML input placeholders.
- Each route is substantial, not a stub: `app/providers/page.tsx` (759 lines), `app/analytics/page.tsx` (730 lines), `app/coverage/page.tsx` (613 lines) all contain real filtering/conditional logic.
- The gap is depth, not honesty: no persistence beyond in-memory arrays, no real workflow-state transitions — consistent with the README's own disclosed scope.

### UX & usability — 5/10 (weight 10%)

Theming and responsive plumbing are production-grade and role-based UI is real, but there's no accessibility tooling in CI and zero internationalization.

- No `eslint-plugin-jsx-a11y` or axe-core anywhere; manual `aria-*` usage is sparse (4 hits in `components/`) — accessibility is largely inherited for free from Radix UI primitives, not actively verified.
- Zero i18n library — every string across all 8 routes is hardcoded English.
- `next-themes` plus a real `matchMedia`-driven `useIsMobile()` hook (`hooks/use-mobile.tsx:3-9`) deliver genuine dark mode and responsive behavior.
- Role-based UI is pervasive and consistent (23 role-condition occurrences) but is pure client-side conditional rendering with no authorization layer behind it.

### Documentation — 7/10 (weight 8%)

README, SECURITY.md, and CHANGELOG.md are unusually honest and well-maintained for a demo; inline code docs and architecture records are absent.

- README explicitly states the app is a "self-contained demo application… not a production insurance system" and its own Roadmap admits the mocked data/auth gaps.
- `SECURITY.md` names concrete known risks and a real GitHub private-vulnerability-reporting process.
- Zero JSDoc/TSDoc anywhere (deliberate, per CONTRIBUTING.md's "default to no comments" policy) and no architecture decision records or `docs/` directory.

### Observability & operations — 2/10 (weight 8%)

Zero error tracking, structured logging, analytics, or health checks — expected given there's no backend, but a real gap against any production-readiness rubric.

- A search for Sentry/Datadog/LogRocket/Bugsnag/New Relic/PostHog returns zero hits anywhere in the codebase.
- The only "logging" present is scattered `console.log`/`console.error` calls, including one that logs user email on every sign-in/session-restore (`contexts/auth-context.tsx:68,83,95,101`) — a habit that would leak PII if ever wired to a real backend.
- No uptime/health-check endpoint exists (expected — there's no server to check).

## Top risks

1. **Critical — Authentication is forgeable client-side.** The full session object — including `role` — is stored unsigned in `localStorage` (`contexts/auth-context.tsx:97`). Editing it in devtools escalates any demo account to insurer or TPA privileges with no server to check.
2. **Critical — Build safety nets are disabled.** `next.config.mjs` sets both `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — the `strict: true` in `tsconfig.json` is cosmetic because a broken build still ships.
3. **High — No security headers configured.** No CSP, HSTS, X-Frame-Options, or X-Content-Type-Options anywhere in `next.config.mjs` — a near-zero-cost gap to close.
4. **High — CI is currently red.** The audit's own `npm run test:coverage` run failed 2 of 14 suites — `__tests__/providers-integration.test.tsx` timed out at Jest's 20s limit after ~88s, plus a worker-teardown-leak warning.
5. **High — No data/service layer, inconsistently applied route guards.** Three different auth-gating patterns exist across six routes; `app/coverage` and `app/analytics` ship with zero auth check and no navigation chrome at all.
6. **Medium — No accessibility tooling and no internationalization.** Zero `eslint-plugin-jsx-a11y`/axe coverage and zero i18n library — both are hard blockers for multi-tenant enterprise readiness even though Radix UI gives baseline a11y for free.

## Remediation roadmap

### Quick wins (hours–days)

- Re-enable `eslint.ignoreDuringBuilds` / `typescript.ignoreBuildErrors` in `next.config.mjs` and fix whatever surfaces.
- Add a security-headers block (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) to `next.config.mjs`.
- Stabilize `providers-integration.test.tsx` (raise the timeout or fix the async Radix Select interaction) so CI goes green again.
- Add an `npm audit --omit=dev` gate to `ci.yml` so the known prod-path vulnerabilities are tracked, not just documented.
- Extract the duplicated 37-line auth-guard into one shared layout and apply it to `app/coverage` and `app/analytics` too.
- Pin the Node version with an `engines` field or `.nvmrc` instead of README prose only.

### Strategic investments (weeks)

- Introduce a thin data/service layer (typed domain models + fetching hooks) — the real prerequisite for ever wiring in a backend.
- Replace demo auth entirely with a real IdP (OAuth/OIDC/SAML) and server-side sessions before any real data touches this app.
- Add `eslint-plugin-jsx-a11y` + automated axe assertions in CI, and adopt an i18n framework if multi-region use is a real goal.
- Add observability (error tracking + structured logging) once a backend exists — today it's a zero, not a partial.
- Consolidate the six duplicated mock-data modules and status-color maps into one shared domain module with shared types.
- Add release automation (changesets / semantic-release) if this becomes a maintained, versioned product rather than a single frozen 1.0.0.

## Methodology & sources

Each category was scored 0–10 by an independent, evidence-based review of the actual repository (file and line citations required for every claim), then combined into a weighted overall score using a rubric blended from two references: the tiered, importance-weighted structure [G2 uses for its product Satisfaction scoring](https://documentation.g2.com/docs/research-scoring-methodologies) (user-facing criteria weighted above administrative and general ones), and the peer/enterprise-standard comparison approach described in general [software benchmarking methodology](https://redresscompliance.com/software-benchmarking-methodology) writeups. The 360° framing mirrors the spider-web/matrix comparison diagrams catalogued in Wikipedia's [list of benchmarking methods and software tools](https://en.wikipedia.org/wiki/List_of_benchmarking_methods_and_software_tools).

| Category | Weight | Rationale |
| --- | --- | --- |
| Code quality & maintainability | 14% | Highest-leverage, user-facing-equivalent criterion |
| Security & compliance | 14% | Non-negotiable for a healthcare-domain product |
| Architecture & design | 12% | Determines cost of future change |
| Testing & reliability | 12% | Correctness confidence |
| DevOps & delivery | 12% | Process maturity, repeatability |
| Product completeness | 10% | Does it do what it claims |
| UX & usability | 10% | Accessibility, i18n, usability |
| Documentation | 8% | Administrative/secondary tier |
| Observability & operations | 8% | Administrative/secondary tier |

---

*CompliHealth 360° Audit · generated by four independent evidence-based reviews · not a substitute for a professional security or compliance assessment.*
