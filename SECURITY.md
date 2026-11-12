# Security Policy

## About this project

CompliHealth is a demo/showcase application. It has **no backend, no database, and no real user
data** — authentication is a local, password-gated demo (`demo123`) that stores a session in the
browser's `localStorage`, and all displayed data (claims, policies, providers) is static sample
data defined in the source. It is not intended to hold or process real personal or health
information, and should not be deployed as-is for that purpose.

Given that scope, the realistic security surface is: dependency vulnerabilities, client-side code
quality (XSS and similar), and the build/CI pipeline — not data breach or account takeover of real
accounts.

## Supported versions

Only the latest commit on the `main` branch is supported. There are no maintained release
branches.

## Known accepted risks

- **Demo authentication is not real authentication.** The password (`demo123`) is intentionally
  public and documented on the login screen. Do not reuse this pattern, or any part of
  `contexts/auth-context.tsx`, for an application handling real user accounts or data.
- **`deepmerge` (low severity, GHSA-gcqx-w48m-w2h4) has no upstream fix.** It's a transitive
  dependency of `jest-config`'s internal configuration merging — `4.3.1`, the version flagged, is
  the newest version ever published to npm; no patched release exists. It is reachable only by
  developer-authored local Jest config, never by external or user-supplied input, and is not part
  of the deployed application. `npm audit`'s own suggested fix is downgrading Jest four major
  versions, which would be a worse outcome than leaving this accepted. Re-evaluate once Jest ships
  a version that no longer depends on `deepmerge`.
- Two other advisories previously tracked here — `postcss` bundled internally by Next.js, and
  `minimatch` pinned by `@typescript-eslint/typescript-estree` below its patched version — are
  resolved via the `overrides` entries in `package.json`, which pin both to patched versions across
  the whole dependency tree without requiring a major-version bump of Next.js or `@typescript-eslint`.

## Reporting a vulnerability

If you find a security issue in this repository (for example, a real XSS vector, a supply-chain
concern in a dependency, or a CI/workflow misconfiguration), please report it privately rather than
opening a public issue:

1. Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability)
   feature on this repository (**Security** tab → **Report a vulnerability**), if enabled.
2. If that is not available, open a GitHub issue asking a maintainer to open a private channel,
   without including exploit details in the issue itself.

Please include:
- A description of the issue and its potential impact.
- Steps to reproduce (or a proof of concept).
- The commit SHA you tested against.

We aim to acknowledge reports within 5 business days. Since this is a demo project maintained on a
best-effort basis, there is no guaranteed fix timeline, but valid reports will be addressed.
