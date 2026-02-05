# Specification

## Summary
**Goal:** Allow staff to edit a resident’s information directly from the Resident Profile page and see updates immediately.

**Planned changes:**
- Add an **Edit** button in the Resident Profile header near the existing **Print Report** action when the profile is backed by a valid resident Principal ID.
- On **Edit** click, open the existing `EditResidentInformationDialog` and pre-fill it with the resident’s current data loaded via `useGetResident`.
- Wire the dialog save action to the existing `useUpdateResident` mutation, sending the current `residentId` and a `ResidentUpdateRequest` built from dialog values while preserving backend-only/non-editable fields from the existing `backendResident`.
- After a successful save, refresh the Resident Profile view so updated values appear without a manual page reload.
- On save failure, keep the dialog open and show a clear English error message (e.g., “Failed to save changes. Please try again.”).

**User-visible outcome:** From a resident’s profile, users can click **Edit**, update basic resident details, save, and immediately see the updated information reflected on the profile page.
