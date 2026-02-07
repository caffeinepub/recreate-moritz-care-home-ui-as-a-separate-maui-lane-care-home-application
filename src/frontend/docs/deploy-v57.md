# Version 57 Production Deployment Guide

**Note:** This guide is superseded by `deploy-v58.md` for current production publishes. The content below is retained for historical reference.

---

This document provides a comprehensive checklist for deploying Version 57 to the Internet Computer production network.

## Pre-Deployment Verification

1. **Version Markers**
   - [ ] Verify `frontend/public/version.txt` contains exactly `57`
   - [ ] Verify `frontend/index.html` contains `<meta name="app-version" content="57" />`

2. **Code Quality**
   - [ ] All TypeScript compilation passes without errors
   - [ ] No console errors in development build
   - [ ] All React Query hooks properly configured

## Deployment Steps

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Production (Internet Computer)**
   ```bash
   dfx deploy --network ic
   ```

3. **Post-Deployment Verification**
   - [ ] Check `version.txt` endpoint returns `57`
   - [ ] Verify `<meta name="app-version" content="57" />` in deployed HTML
   - [ ] Confirm canister status: `dfx canister status backend --network ic`

## Post-Deploy Smoke Test Checklist

Perform these tests immediately after deployment to production:

### 1. Authentication & Authorization
- [ ] Login with Internet Identity works
- [ ] User profile setup appears for new users
- [ ] Logout clears session and cached data
- [ ] Re-login restores user session

### 2. Residents Dashboard
- [ ] Dashboard loads without errors
- [ ] Shows proper loading state initially
- [ ] Displays resident cards or empty state
- [ ] KPI cards show correct counts (Total, Active, Discharged)
- [ ] Status tabs filter correctly (All, Active, Discharged)
- [ ] Room filter dropdown works
- [ ] Sort dropdown works (Room, Name, Age)
- [ ] "Add New Resident" button opens dialog

### 3. Resident Profile
- [ ] Clicking a resident card navigates to profile page
- [ ] Profile page loads resident data correctly
- [ ] All tabs accessible (Vitals, MAR, ADL, Medications)
- [ ] Edit button opens dialog with pre-filled data
- [ ] Print button generates proper report

### 4. Vitals Management
- [ ] "Record Vitals" button opens dialog
- [ ] Form validation works (required fields)
- [ ] Vitals entry saves successfully
- [ ] Vitals history list displays entries
- [ ] Delete vitals entry works with confirmation

### 5. MAR (Medication Administration Record)
- [ ] "Add MAR Record" button opens dialog
- [ ] Active medications populate dropdown
- [ ] MAR entry saves successfully
- [ ] MAR history list displays entries
- [ ] Delete MAR entry works with confirmation

### 6. ADL (Activities of Daily Living)
- [ ] "Add ADL Record" button opens dialog
- [ ] Activity type and assistance level dropdowns work
- [ ] ADL entry saves successfully
- [ ] ADL history list displays entries
- [ ] Delete ADL entry works with confirmation

### 7. Medications Management
- [ ] "Add Medication" button opens dialog
- [ ] Route dropdown includes all options
- [ ] Physician dropdown works (or text input fallback)
- [ ] Medication saves successfully
- [ ] Edit medication opens pre-filled dialog
- [ ] Discontinue medication updates status
- [ ] Resume medication restores active status
- [ ] Delete medication removes from list

### 8. Resident CRUD Operations
- [ ] Add new resident dialog opens and validates
- [ ] New resident saves successfully
- [ ] Edit resident information dialog works
- [ ] Physicians can be added/edited/removed
- [ ] Responsible persons can be added/edited/removed
- [ ] Shared room bed validation works
- [ ] Toggle resident status (Active/Discharged) works
- [ ] Delete resident works with confirmation

## Version 57 Success Criteria

- ✅ All version markers report `57`
- ✅ Dashboard loads with proper error handling
- ✅ Resident profiles fully functional
- ✅ All CRUD operations work correctly
- ✅ Medication management (add, edit, discontinue, resume, delete) works
- ✅ Print functionality generates proper reports
- ✅ No console errors in production

## Troubleshooting

### If deployment fails:

1. **Check Canister Status**
   ```bash
   dfx canister status backend --network ic
   dfx canister status frontend --network ic
   ```

2. **Verify Network Configuration**
   - Ensure `dfx.json` has correct network settings
   - Check wallet balance for cycles

3. **Review Build Output**
   - Check for TypeScript errors
   - Verify all assets bundled correctly

### If application errors occur:

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear site data in browser DevTools

2. **Check Browser Console**
   - Look for JavaScript errors
   - Check network tab for failed requests

3. **Verify Backend Health**
   - Test health check endpoint
   - Check actor initialization

## Rollback Plan

If critical issues are discovered:

1. **Immediate Rollback**
   ```bash
   # Deploy previous stable version
   git checkout v56  # or last stable version
   dfx deploy --network ic
   ```

2. **Verify Rollback**
   - Check version markers
   - Run smoke tests
   - Confirm issue resolved

## Notes

- Version 57 includes full medication CRUD operations
- Enhanced error handling for actor initialization
- Improved loading states across all components
- Print functionality with proper styling
- Authorization system with role-based access control

## Support

For issues or questions:
- Check browser console for errors
- Review canister logs
- Verify Internet Identity authentication
- Ensure proper network connectivity
