# Specification

## Summary
**Goal:** Replace all Maui Lane logos throughout the app (including favicon/app icons) with assets derived from the user-provided image "MauiLaneCareHome 0-1.png".

**Planned changes:**
- Generate new static logo/icon image files (primary logo + favicon/touch/app icon sizes) under `frontend/public/assets/generated/` with consistent filenames, derived from `MauiLaneCareHome 0-1.png`.
- Update the centralized branding config to point all in-app logo renders (e.g., sign-in screen and authenticated header) to the new generated primary logo via an absolute `/assets/generated/...` path.
- Update `frontend/index.html` to reference the new generated favicon (32x32) and Apple touch/app icons using absolute `/assets/generated/...` paths.

**User-visible outcome:** The new Maui Lane logo appears everywhere in the UI where the logo is shown, and the browser tab/app icons update to the new Maui Lane logo after a hard refresh.
