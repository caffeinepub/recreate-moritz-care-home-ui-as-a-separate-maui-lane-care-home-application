# Specification

## Summary
**Goal:** Use the uploaded `MauiLaneCareHome-4.jpg` as the application logo on the login page and authenticated header.

**Planned changes:**
- Add `MauiLaneCareHome-4.jpg` to `frontend/public/assets/generated/` so it is reliably served in IC deployments.
- Update the branding configuration to set the global `logoPath` to `assets/generated/MauiLaneCareHome-4.jpg`.
- Ensure the login/sign-in screen (ProtectedGate) and authenticated header (MauiAppShell) render the logo via the existing `BrandLogo` component, preserving sizing and fallback behavior.

**User-visible outcome:** When logged out, the login card shows the Maui Lane Care Home logo image; when logged in, the sticky header shows the same logo, with no broken-image icons in production.
