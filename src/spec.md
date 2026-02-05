# Specification

## Summary
**Goal:** Update the app header to use the user-provided Maui Lane Care Home logo and ensure all references point to the correct asset.

**Planned changes:**
- Swap the header logo in `frontend/src/components/maui/MauiAppShell.tsx` to use the user-provided logo image.
- Update any logo asset paths so the UI no longer references outdated/non-existent logo filenames.
- Keep the logo `alt` text in English as "Maui Lane Care Home".

**User-visible outcome:** The application header consistently displays the user-provided Maui Lane Care Home logo.
