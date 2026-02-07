# Specification

## Summary
**Goal:** Fix the medication edit/save crash and replace free-text fields with safe dropdown selectors for Administration Route and Prescribing Physician in the medication dialogs.

**Planned changes:**
- Identify and fix the runtime error triggered when saving edits to an existing resident medication from the Resident Profile medication list; ensure the backend update mutation completes and the UI handles failures without crashing.
- Update the Edit Medication Prescribing Physician Select to avoid using an empty-string value that can break the Select component (use a safe “None/Unassigned” sentinel value and map it to an unset physician on save).
- Add an Administration Route Select control to both Add Medication and Edit Medication dialogs using a consistent predefined list of common routes, supporting an optional/blank selection and persisting the selected route.
- Add a Prescribing Physician Select control to both Add Medication and Edit Medication dialogs, sourcing options from the resident’s physician list; support “None/Unassigned” and provide a safe fallback UI when no physicians exist.
- Ensure existing medications without stored route/physician values continue to load and display as blank/unset without errors.

**User-visible outcome:** Staff can add and edit resident medications without crashes, choose an Administration Route and (optionally) a Prescribing Physician from dropdowns, see clear success/error toasts after saving, and have selections persist after reload.
