# Specification

## Summary
**Goal:** Fix the app getting stuck on “Connecting to Backend” after “Loading Profile” by ensuring React Query requests only run once the backend actor is fully initialized and by preventing startup gates/health checks from looping or remounting during navigation.

**Planned changes:**
- Add a stable “actor ready” gating signal and ensure resident/profile React Query calls (including ResidentProfile-related fetching) do not execute until the actor and identity prerequisites are fully available.
- Stabilize the startup gating flow so BackendReachabilityGate and ProfileBootstrapGate do not re-trigger, remount, or re-run health checks indefinitely after successful load or during route transitions.
- Ensure health checks resolve deterministically (reachable/unreachable) and only show the full-screen “Connecting to Backend” gate when the backend is actually unreachable; keep existing Retry/error UI behavior.

**User-visible outcome:** After signing in, the app proceeds into content after “Loading Profile” without reverting to “Connecting to Backend,” and navigating to ResidentProfile/Medications no longer triggers repeated full-screen connection gating or “Actor not available” errors.
