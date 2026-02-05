# Specification

## Summary
**Goal:** Fix production backend connection failures after Internet Identity login by making backend access-control initialization and frontend actor creation resilient, and by adding a reliable health-check + clearer diagnostics in the UI.

**Planned changes:**
- Backend: Harden access-control initialization to safely handle missing/empty `caffeineAdminToken` so authenticated users can create and use an authenticated actor immediately after login without traps.
- Backend: Ensure `healthCheck()` is unauthenticated, reliable in production, and returns accurate fields (including the backend canister’s principal as `canisterId`).
- Frontend: Update `useActor` to capture and surface actor creation / initialization errors (instead of leaving `actor` as null) and provide retry/refresh recovery.
- Frontend: Add a lightweight diagnostic path using `healthCheck()` to distinguish “backend unreachable” vs “reachable but user initialization/authorization failed”, and reflect this in the existing Dashboard error UI.

**User-visible outcome:** After logging in (even without a `caffeineAdminToken` URL parameter), the app can connect to the backend immediately; when failures occur, the Dashboard shows a clearer, actionable English error (including the caught error text) with working Retry/Refresh actions and better indication of whether the backend is reachable.
