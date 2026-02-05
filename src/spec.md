# Specification

## Summary
**Goal:** Enable printing from the Resident Profile page so the existing “Print” button produces a print-friendly Resident Profile Report matching the provided reference layout.

**Planned changes:**
- Wire the Resident Profile “Print” button to trigger the browser print dialog and print the report content (not a placeholder/toast).
- Create a dedicated print layout for the Resident Profile Report that follows the uploaded reference (header with facility/app name + report title; clearly separated sections with divider lines; multi-page flow).
- Include these report sections in the printed output: Resident Information, Insurance Information, Active Medications (table/grid), Discontinued Medications, Assigned Physicians, Pharmacy Information, and Responsible Contacts.
- Add an “@media print” stylesheet to hide non-print UI (app header/nav/footer, action buttons, tabs, edit/add controls) and ensure readable typography, spacing, section dividers, and table formatting for A4/Letter.
- Ensure the “Include physician printed name & signature” toggle affects the printed output by conditionally showing/hiding the signature/printed-name area.

**User-visible outcome:** From the Resident Profile page, users can click “Print” to open the browser print dialog and print a clean, multi-page Resident Profile Report that matches the provided layout, with non-print UI hidden and the physician signature area included only when enabled.
