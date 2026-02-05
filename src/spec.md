# Specification

## Summary
**Goal:** Replace the “Daily vitals tracking coming soon...” placeholder with a functional Daily Vitals tracking feature (record modal + vitals history list) on the Resident Profile page.

**Planned changes:**
- Update `frontend/src/pages/maui/residents/ResidentProfile.tsx` (Daily Vitals tab) to display a vitals history list and a “Record Daily Vitals” action that opens a modal.
- Implement a “Record Daily Vitals” modal matching the provided reference layout/fields: temperature (with unit selector), blood pressure (systolic/diastolic), pulse rate, respiratory rate, oxygen saturation, optional blood glucose, measurement date, measurement time, optional notes, and Cancel/Record actions (plus close icon).
- Enforce validation: all fields required except Blood Glucose and Notes; clearly indicate required fields.
- Add backend persistence in `backend/main.mo` for vitals entries with authenticated methods to create, list (resident-specific), and delete entries.
- Wire the Daily Vitals UI to the backend via React Query (queries + mutations) with success/error toasts; update the list immediately on create/delete.

**User-visible outcome:** Users can record a resident’s daily vitals in a modal, see a resident-specific vitals history list, and delete vitals entries, with data persisting across refreshes.
