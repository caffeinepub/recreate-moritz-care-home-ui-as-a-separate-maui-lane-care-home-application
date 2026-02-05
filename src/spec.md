# Specification

## Summary
**Goal:** Ensure resident deletions persist across sign-out/sign-in so deleted residents never reappear, and resident lists are correctly scoped to the currently authenticated Internet Identity principal.

**Planned changes:**
- Backend: Add a persistent, stable-state Residents Directory (separate from vitals/MAR/ADL) with canister methods to create, list, update (including status toggle), and delete residents.
- Backend: Make resident list behavior deterministic and principal-scoped (and admin-scoped only if already supported), filtering out deleted residents and preventing any cross-user leakage on identity changes.
- Frontend: Update the Residents Dashboard to use backend Residents Directory queries/mutations via React Query and remove any logic that repopulates residents from mock/default data on login/sign-in changes.
- Frontend: Add/extend React Query hooks for Residents Directory list/create/delete/update (status toggle), including proper cache keys scoped by principal and invalidation/refetch on mutation success.

**User-visible outcome:** After deleting a resident, the resident stays deleted across sessions; signing out and signing back in (or switching identities) shows only the current user’s residents, with no reappearing deleted entries.
