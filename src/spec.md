# Specification

## Summary
**Goal:** Promote Version 59 to production by updating version markers, deploying the Version 59 build to the Internet Computer, and documenting the production deployment/verification steps.

**Planned changes:**
- Update frontend version markers to Version 59 (version.txt and app-version meta tag) and verify no remaining Version 58 markers in built output.
- Deploy the Version 59 build to the Internet Computer production network so live canisters serve Version 59.
- Create or update a Version 59 production deployment guide under `frontend/docs/` with verification steps and a post-deploy smoke-test checklist.

**User-visible outcome:** The live production app reports Version 59 (including the live `version.txt` endpoint) and continues to function normally (login works, Dashboard loads, Resident Profile opens) after deployment.
