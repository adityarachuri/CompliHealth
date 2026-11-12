# CompliHealth — IP & Licensing Governance

**Repository-specific application of the [LEOS Software Licensing & Intellectual Property Governance Guide](../Software%20Licensing%20&%20Intellectual%20Property%20Governance%20Guide.md)**

| Attribute | Details |
|---|---|
| Repository | [github.com/adityarachuri/CompliHealth](https://github.com/adityarachuri/CompliHealth) |
| Platform | GitHub |
| Visibility | Private |
| Description | Healthcare insurance operations modeled across four stakeholder roles (Customer, Hospital, TPA, Insurer); a self-contained demo with in-memory sample data and local demo auth — no backend or database |
| Primary language | TypeScript |
| Current license | **MIT** (already declared) |
| Governing framework | LumenStack Engineering Operating System (LEOS) |
| Related repositories | meditasker (shares the healthcare-insurance domain) |

---

## 1. Ownership

Original work. No employer, client or third-party ownership claims are known to apply.

## 2. Material inventory

| Material | Present in this repo | Notes |
|---|---|---|
| Application source code | Yes | MIT-licensed |
| Database schema (Policy, Claim, Provider) | No | Removed — the Supabase backend and its schema were dropped; Policy/Claim/Provider are now TypeScript types backing in-memory sample data only (see CHANGELOG.md) |
| Sample/seed/test data | Yes | Confirmed synthetic — fictional names/identifiers defined directly in page components, no real records |
| Supabase configuration | No | Removed along with `lib/supabase.ts` and the seed/schema SQL scripts; no service keys, connection strings, or RLS policies exist in this repo |
| Documentation | Yes | Covered by MIT unless stated otherwise; consider separating if it grows substantial |

## 3. MIT license — scope and what it does *not* cover

The repository's MIT license is an appropriate, deliberate choice for this kind of domain-modeling/reference project and should be kept. However, MIT applies to the **source code only**. It does **not** automatically extend to:

- Any real or real-looking healthcare/insurance data (policy numbers, claim records, patient or provider identifiers) — this is sensitive personal data under India's Digital Personal Data Protection Act, 2023 and must never be committed, even for a demo.
- The "CompliHealth" name, if it is ever used as a product brand.

**Status:** No backend, service keys, or credentials exist in this repo — the app is fully frontend-only in-memory demo state (Supabase was removed; see CHANGELOG.md). The credentials/connection-string concern this section originally flagged no longer applies.

**Action (done):** A scope note was added to the README's License section clarifying that the MIT grant covers source code only, not data, credentials, or branding — see [README.md](../README.md#license). This closes the ambiguity the master guide warns against in §5.3 and §12.

## 4. Third-party dependency notes

- Run an npm dependency scan (direct + transitive) per §7.1 of the master guide.
- Direct dependencies (Next.js, React, Radix UI primitives, Tailwind CSS, Recharts, lucide-react, class-variance-authority, etc.) are all MIT/Apache-2.0/ISC-licensed — compatible with MIT on inspection, but this has not been run through a formal scanner.
- Generate an SBOM before any public release or demo, per §8 of the master guide. **Outstanding** — no SBOM exists yet; requires picking a tool (e.g. `license-checker`, `cyclonedx-npm`) and running it against `package-lock.json`.

## 5. Privacy and data protection (priority area)

This repository models health-insurance claims and policies — a domain involving sensitive personal data by nature, even in a modeling/demo context:

- Confirm all seed data, fixtures, and test records are synthetic, not derived from real patients, hospitals, or insurers. **Confirmed** — all sample data is defined directly in page components and is fictional.
- Authorization today is a local, client-side demo sign-in (`contexts/auth-context.tsx`, `localStorage`-backed) with no server-side policy layer — there is no Supabase RLS or other backend authorization model to review, since there is no backend.
- Apply §18 of the master guide: assess Digital Personal Data Protection Act, 2023 applicability if this project ever processes real policyholder or claimant data.
- Do not include real screenshots, exports, or logs that could contain identifiable health or insurance information.

## 6. Pre-release checklist

- [x] MIT license scope note added (code/schema vs. data, credentials, branding) — see [README.md](../README.md#license).
- [x] All seed/test data confirmed synthetic.
- [x] Supabase keys and connection strings excluded from the repository and from git history — moot: the Supabase backend was removed entirely (see CHANGELOG.md); a stale `@supabase/supabase-js` reference also lingering in `package-lock.json` after the removal has been cleaned up.
- [ ] Dependency license scan and SBOM generated. **Outstanding** — no scanner has been run; direct deps are MIT/Apache-2.0/ISC on manual inspection only.
- [x] Privacy review completed if real policyholder/claimant data is ever introduced — N/A today, no real data exists; re-open this item if that ever changes.
- [ ] Shared-domain code with `meditasker` has an independently verified ownership/licensing record (§25.1 of the master guide — do not assume shared terms). An informal check found no literal code overlap — different stacks (Next.js vs. Vite/React), separate auth implementations — and both repos are independently MIT-licensed under the same copyright holder. A formal ownership/licensing record per §25.1 has not been created.
