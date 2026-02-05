# Specification

## Summary
**Goal:** Update the Maui Lane Care Home branding by refreshing the app logo and favicon, and apply them in the header and browser tab.

**Planned changes:**
- Create updated versions of the existing Maui Lane Care Home logo and app icon assets under `frontend/public/assets/generated`.
- Update the authenticated app header (`frontend/src/components/maui/MauiAppShell.tsx`) to use the new logo asset and ensure alt text is "Maui Lane Care Home".
- Update `frontend/index.html` to reference the new app icon asset as the site favicon.

**User-visible outcome:** When signed in, the app header shows the refreshed Maui Lane Care Home logo, and the browser tab displays the refreshed favicon.
