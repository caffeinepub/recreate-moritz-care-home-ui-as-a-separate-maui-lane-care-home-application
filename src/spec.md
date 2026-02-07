# Specification

## Summary
**Goal:** Publish Version 58 to ICP production and ensure the live app and operator docs clearly reflect Version 58.

**Planned changes:**
- Update frontend version markers to 58 (`frontend/public/version.txt` and `frontend/index.html` meta `app-version`).
- Deploy the current Version 58 build to the Internet Computer production network (`dfx deploy --network ic`) and run basic post-deploy smoke checks (Internet Identity login, Dashboard load, resident profile navigation, no new blocking console errors).
- Update/create the deployment checklist documentation to include Version 58 verification steps for the version markers and post-deploy validation.

**User-visible outcome:** The live ICP site serves Version 58 and reports version `58` via `/version.txt` and the `app-version` meta tag, with updated operator documentation for consistent verification.
