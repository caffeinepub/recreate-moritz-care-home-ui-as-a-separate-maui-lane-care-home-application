# Specification

## Summary
**Goal:** Remove Maui Lane logo/icon image usage from the authenticated header and favicon so the UI is text-only and does not request the generated image assets.

**Planned changes:**
- Update the authenticated app shell header to render the app title as text only, removing any `<img>` logo rendering and any fallback-to-icon behavior.
- Remove the generated Maui app icon reference from the HTML entrypoint favicon link so the app no longer requests that asset.

**User-visible outcome:** The app header shows a text-only title with no logo/icon image or broken image placeholder, and the browser no longer requests the generated Maui icon as a favicon.
