# cookie-consent - Backlog

Created 2026-10-12 for its first ticket (Robert).

## Security

- [x] **Fix the image vulnerabilities (Roger, 2026-10-12).** Released 2026-10-12 as v1.0.2 (flow C, approved by Roger): digest sha256:f08f8f6f1d1f, Docker Scout clean, /consent 200. Docker Scout on the production image glideroggan/cookie-consent-api:v1.0.1 (2026-10-12): zlib 1.3.2-r0 CVE-2026-85091 High (fixed in 1.3.2-r1); busybox 1.37.0-r30 CVE-2025-60876 Medium (fixed in Alpine 3.24, r31). Both come from the Alpine base image. Fix as in login-service 2.6.3: a current Alpine base (3.24) or `apk upgrade --no-cache` plus `apk add --no-cache --upgrade "zlib>=1.3.2-r1"` in the runtime stage (forces the layer to rebuild), build with --pull, scan again (0 fixable High/Medium). (The base-image fix of 2026-06-11, PR #4, is older than these findings.)
  **Triage (2026-10-12)**: overlap: the same base-image findings in edge, Timesheet, project-atlas and cookie-consent (one ticket per repo, all opened together); login-service fixed it the same way in 2.6.3. Goes with: Deployer B39 (release builds with --pull). Depends on: nothing. Split: one agent per repo (disjoint repos). Decisions: none. Gate: the project's tests + image build + scan. Release: flow C (a plain Deployer workload): latest only, Deployer refresh, verify, Roger approves, then v1.0.2.
