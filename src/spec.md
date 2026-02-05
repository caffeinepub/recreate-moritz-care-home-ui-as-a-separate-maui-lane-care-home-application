# Specification

## Summary
**Goal:** Roll back production behavior to Version 46 to restore the Residents dashboard and publish a Version 46-marked production build.

**Planned changes:**
- Revert/undo Version 47 changes so the Maui Dashboard loads and renders the residents directory successfully for authenticated staff.
- Ensure navigating to a resident profile and back does not trigger residents directory query failures.
- Verify resident-directory backend calls do not trap or return unauthorized/malformed responses for valid authenticated users in the happy path.
- Update app version marker(s) to reflect Version 46 (including setting `frontend/public/version.txt` to `46`).
- Produce a clean production build (frontend + backend) using existing repo tooling that corresponds to Version 46 rollback behavior.

**User-visible outcome:** After logging in with Internet Identity, staff can load the Maui Dashboard and see the residents directory content without the generic failure banner, open resident profiles, and return to the dashboard without breaking residents loading; the app reports Version 46.
