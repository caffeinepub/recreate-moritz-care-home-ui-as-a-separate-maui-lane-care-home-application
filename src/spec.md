# Specification

## Summary
**Goal:** Allow authenticated users to view all residents and load resident profiles created by other users, while keeping all write actions restricted to the resident owner or an admin.

**Planned changes:**
- Update backend read authorization to allow any authenticated user to list residents in the directory and fetch resident profile details across users.
- Keep backend write authorization unchanged so only the resident owner or an admin can update/delete/toggle status or add clinical records for a resident.
- Update the frontend residents dashboard and resident profile pages to display cross-user residents returned by the backend and avoid falling back to mock data for valid resident IDs.
- Add clear English error messaging on the frontend when a user attempts a disallowed edit/delete/toggle-status action on a resident they don’t own.

**User-visible outcome:** Users can see residents created by other users in the dashboard and open their profiles, but can only edit/delete/change status/add records for residents they own (unless they are an admin).
