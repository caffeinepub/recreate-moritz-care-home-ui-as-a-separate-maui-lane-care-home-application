# Specification

## Summary
**Goal:** Fix the Maui Lane Care Home header logo so it reliably loads in `frontend/src/components/maui/MauiAppShell.tsx` across local dev and production, including non-root base URLs, with a stable fallback to the app icon.

**Planned changes:**
- Update header logo URL construction to safely prefix with `import.meta.env.BASE_URL` (avoiding double/missing slashes) and point only to existing files in `frontend/public/assets/generated/`.
- Implement image error handling so if `maui-lane-logo.dim_512x512.png` fails to load, the header switches once to `maui-lane-app-icon.dim_256x256.png` without retry loops or flicker.

**User-visible outcome:** The app header consistently shows the Maui Lane logo without broken-image UI, and automatically shows the app icon if the logo can’t be loaded, even when hosted under a non-root base path.
