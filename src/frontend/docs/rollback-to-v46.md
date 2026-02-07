# Rollback to Version 57 Deployment Guide

This document provides a checklist for deploying the Version 57 rollback build to production.

## Pre-Deployment Verification

1. **Version Markers**
   - [ ] Verify `frontend/public/version.txt` contains exactly `57`
   - [ ] Verify `frontend/index.html` contains `<meta name="app-version" content="57" />`

2. **Code Changes**
   - [ ] Dashboard no longer gates directory load behind seeding
   - [ ] `useEnsureResidentsSeeded` hook removed from Dashboard
   - [ ] Directory query loads independently with proper loading states

## Deployment Steps

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Production**
   ```bash
   dfx deploy --network ic
   ```

3. **Verify Deployment**
   - [ ] Check version marker endpoint returns `57`
   - [ ] Smoke test: Navigate to Residents dashboard
   - [ ] Verify: Dashboard shows loading state, then resident list (or empty state)
   - [ ] Verify: No immediate error on dashboard load
   - [ ] Verify: Clicking a resident card navigates to profile page successfully

## Smoke Test Checklist

After deployment, perform these tests in production:

1. **Authentication**
   - [ ] Login with Internet Identity works
   - [ ] User profile setup appears for new users

2. **Residents Dashboard**
   - [ ] Dashboard loads without immediate error
   - [ ] Shows loading state initially
   - [ ] Displays resident cards or empty state
   - [ ] KPI cards show correct counts
   - [ ] Filter and sort controls work

3. **Resident Profile**
   - [ ] Clicking a resident card navigates to profile
   - [ ] Profile page loads resident data
   - [ ] All tabs (Vitals, MAR, ADL, Medications) are accessible
   - [ ] Edit button opens edit dialog with pre-filled data

## Rollback Success Criteria

- ✅ Production no longer exhibits Version 47 regression (immediate dashboard failure)
- ✅ Residents dashboard loads normally with proper loading states
- ✅ Resident profiles are accessible from dashboard
- ✅ Version markers report `57`

## Troubleshooting

If issues persist after rollback:

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
   - Clear site data in browser DevTools

2. **Verify Canister State**
   - Check canister is running: `dfx canister status backend --network ic`
   - Verify frontend assets deployed: Check asset canister

3. **Check Logs**
   - Browser console for frontend errors
   - Canister logs for backend errors

## Notes

- This rollback removes the automatic resident seeding dependency from the dashboard
- Users with empty resident lists will see an empty state instead of seeded data
- The backend `ensureResidentsSeeded` endpoint remains available but is not called automatically
