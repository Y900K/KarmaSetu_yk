# KarmaSetu Production Connection Infographic

This infographic maps the production connection between Login/Get Started, role-based portals (Admin and Trainee), sidebars/dashboards, MongoDB, and Sarvam AI.

## Architecture Flow

```mermaid
flowchart TD
    U[Get Started or Login] --> L[app/login/page.tsx]
    L --> AL[POST /api/auth/login]
    AL --> M1[(MongoDB users)]
    AL --> S[Session Cookie ks_session]

    S --> ME[GET /api/auth/me]
    ME --> RR{Role Resolution}

    RR -->|admin| AD[Admin Dashboard]
    RR -->|trainee| TD[Trainee Dashboard]

    subgraph AdminPortal[Admin Portal]
      AD --> ASB[Admin Sidebar]
      AD --> ACTX[GlobalStatsProvider admin mode]
      ASB --> AAPI[/app/api/admin/**]
      AAPI -->|requireAdmin + resolveSessionUser| M2[(MongoDB)]
    end

    subgraph TraineePortal[Trainee Portal]
      TD --> TSB[Trainee Sidebar]
      TD --> TCTX[GlobalStatsProvider trainee mode]
      TSB --> TAPI[/app/api/trainee/**]
      TAPI -->|resolveSessionUser| M2
    end

    AD --> C1[Chatbot Widget]
    TD --> C1
    C1 --> SAROUTE[/api/sarvam/chat]
    SAROUTE --> SKEY[Server-side Sarvam API key]
    SAROUTE --> SARVAM[Sarvam API]
    SARVAM --> SAROUTE
    SAROUTE --> C1
```

## One-by-One Production Readiness Rollout

### Step 1: Login and Get Started Entry Hardening
- Status: Implemented
- Changes:
  - Role preselect via query string (`/login?role=trainee` and `/login?role=admin`).
  - Login redirects now trust API-returned role, not only selected tab.
  - Added request timeout handling for login API calls.
- Files:
  - `app/login/page.tsx`
  - `components/home/HeroSection.tsx`
  - `components/home/CTASection.tsx`

### Step 2: Session and Cookie Security
- Status: Implemented
- Current controls:
  - HttpOnly session cookie (`ks_session`).
  - `sameSite=lax` and `secure` in production.
  - Session persistence in MongoDB with `tokenHash` and `tokenFingerprint`.
  - Cookie `maxAge` and `priority=high` set for stronger browser handling.
  - Opportunistic expired-session cleanup during auth reads/writes.
  - Session rotation policy keeps one active session per user on re-auth.
- Files:
  - `lib/auth/session.ts`
  - `app/api/auth/login/route.ts`

### Step 3: Role Guard Enforcement on APIs
- Status: Existing baseline in place (admin guard rollout already done)
- Current controls:
  - Admin endpoints use `requireAdmin`.
  - Trainee endpoints resolve active user from session.
- Files:
  - `lib/auth/requireAdmin.ts`
  - `app/api/admin/**/route.ts`
  - `app/api/trainee/**/route.ts`

### Step 4: MongoDB Connection Reliability
- Status: Implemented
- Current controls:
  - Tunable MongoDB pool and timeout settings (`MONGODB_MAX_POOL_SIZE`, `MONGODB_MIN_POOL_SIZE`, `MONGODB_CONNECT_TIMEOUT_MS`, etc.).
  - Automatic one-time index initialization for high-traffic auth/training collections.
  - Opportunistic TTL-backed cleanup for session and OTP collections.

### Step 6: Portal Role-Gate Parity
- Status: Implemented
- Current controls:
  - Trainee layout now performs role verification via `/api/auth/me` before rendering sidebar/dashboard.
  - Admin users reaching trainee routes are redirected to admin dashboard.
  - Unauthenticated users are redirected to role-specific login (`/login?role=trainee`).

### Step 5: Sarvam Key and AI Path Hardening
- Status: Implemented
- Next actions:
  - Ensure Sarvam key remains server-only and never leaks to client payloads.
  - Verify retry/fallback behavior on upstream Sarvam failures.
  - Validate no sensitive transcripts/keys are logged.

## Verification Checklist
- [ ] Login with trainee account routes to trainee dashboard.
- [ ] Login with admin account routes to admin dashboard.
- [ ] Selecting wrong role tab does not bypass role checks.
- [ ] Session survives refresh and resolves role via `/api/auth/me`.
- [ ] Admin APIs reject non-admin session with proper status code.
- [ ] Trainee sidebar/dashboard loads without runtime hydration mismatch.
- [ ] Sarvam API errors return safe user-facing fallback.
- [ ] No API key appears in client-side bundles or browser storage.

### Step 7: Verification and Observability
- Status: Implemented
- Current controls:
  - Health endpoint at `GET /api/health` returning MongoDB check, Sarvam key presence flag, and safe telemetry counters.
  - In-memory operational counters for Sarvam timeout/error/fallback tracking.
  - CLI smoke-check runner for key admin/trainee/auth/health endpoints.
- Commands:
  - `npm run verify:smoke`
  - `curl http://localhost:3000/api/health`

### Step 8: CI Verification Gate Automation
- Status: Implemented
- Current controls:
  - Local gate command: `npm run verify:gate`
  - Combined CI/local command: `npm run ci:verify`
  - GitHub Actions workflow: `.github/workflows/verification-gate.yml`
  - Endpoint response-time thresholds enforced in smoke checks for critical routes.
