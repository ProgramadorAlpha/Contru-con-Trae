# Deployment Checklist - Dashboard Unification

## Pre-Deployment (Complete Before Deploying)

### Code Quality
- [ ] All TypeScript errors resolved (`npm run check`)
- [ ] All linting errors resolved (`npm run lint`)
- [ ] All tests passing (`npm run test:run`)
- [ ] Production build successful (`npm run build`)
- [ ] Local preview tested (`npm run preview`)

### Testing
- [ ] Manual testing completed (see MANUAL_TESTING_GUIDE.md)
- [ ] Accessibility audit passed (see ACCESSIBILITY_AUDIT.md)
- [ ] Cross-browser testing completed
- [ ] Mobile/tablet testing completed
- [ ] Performance benchmarks acceptable

### Documentation
- [ ] README updated with new features
- [ ] CHANGELOG updated
- [ ] API documentation updated (if applicable)
- [ ] User guide updated (if applicable)

### Backup
- [ ] Backup branch created
- [ ] Backup verified and pushed to remote
- [ ] Rollback plan documented and understood

### Communication
- [ ] Team notified of deployment window
- [ ] Stakeholders informed of new features
- [ ] Support team briefed on changes

## Deployment Process

### Step 1: Prepare Deployment
```bash
npm run deploy:prepare
```
This will:
- Run all pre-deployment checks
- Create a backup branch
- Generate deployment log

### Step 2: Deploy to Production

Choose one method:

**Option A: Git Push (Recommended)**
```bash
git push origin main
```

**Option B: Vercel CLI**
```bash
vercel --prod
```

**Option C: Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select project
3. Click "Deploy"

### Step 3: Verify Deployment
- [ ] Deployment completed successfully in Vercel dashboard
- [ ] Build logs show no errors
- [ ] Deployment URL is accessible

## Post-Deployment Verification (First 5 Minutes)

### Smoke Tests
- [ ] Homepage loads without errors
- [ ] Dashboard page renders correctly
- [ ] Login/authentication works (if applicable)
- [ ] Navigation between pages works
- [ ] No console errors in browser DevTools

### Critical Features - Dashboard
- [ ] Dashboard stats cards display correctly
- [ ] All charts render without errors
- [ ] Theme toggle works (light ↔ dark)
- [ ] Theme preference persists after refresh
- [ ] Notification bell shows correct count
- [ ] Settings panel opens and closes

### Critical Features - Modals
- [ ] Income modal opens and form works
- [ ] Expense modal opens and form works
- [ ] Visit schedule modal opens and form works
- [ ] Modal forms validate correctly
- [ ] Modal forms submit successfully
- [ ] Modals close properly

### Critical Features - Widgets
- [ ] All widgets render correctly
- [ ] Widget configuration persists
- [ ] Widgets can be shown/hidden
- [ ] Widget data updates correctly

### Critical Features - Filters & Export
- [ ] Time filters work (day, week, month, year, custom)
- [ ] Custom date range selector works
- [ ] Data updates when filter changes
- [ ] Export button works
- [ ] Export downloads file correctly

### Critical Features - Notifications
- [ ] Notifications display correctly
- [ ] Notification count updates
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] Notification panel opens/closes

## Extended Monitoring (First Hour)

### Error Monitoring
- [ ] No JavaScript errors in browser console
- [ ] No errors in Vercel function logs
- [ ] No 404 errors or routing issues
- [ ] No failed API requests

### Performance Monitoring
- [ ] Page load time < 3 seconds
- [ ] Lighthouse Performance Score > 90
- [ ] Lighthouse Accessibility Score > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] No memory leaks detected

### Cross-Browser Testing
- [ ] Chrome (latest) - Desktop
- [ ] Firefox (latest) - Desktop
- [ ] Safari (latest) - Desktop
- [ ] Edge (latest) - Desktop
- [ ] Chrome - Mobile (iOS)
- [ ] Safari - Mobile (iOS)
- [ ] Chrome - Mobile (Android)

### Responsive Design
- [ ] Desktop (1920x1080) - works correctly
- [ ] Laptop (1366x768) - works correctly
- [ ] Tablet (768x1024) - works correctly
- [ ] Mobile (375x667) - works correctly
- [ ] Mobile landscape - works correctly

### Theme Testing
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Theme toggle transitions smoothly
- [ ] Theme persists after page refresh
- [ ] Theme persists after browser restart
- [ ] System preference detection works

### Data Integrity
- [ ] Dashboard data loads correctly
- [ ] Stats calculations are accurate
- [ ] Charts display correct data
- [ ] Filters apply correctly to data
- [ ] Export contains correct data

## Monitoring (First 24 Hours)

### Continuous Monitoring
- [ ] Check Vercel logs every 2 hours
- [ ] Monitor error rates
- [ ] Check user feedback/reports
- [ ] Monitor performance metrics
- [ ] Verify all integrations working

### Known Issues to Watch
- [ ] Theme persistence issues
- [ ] Widget configuration not saving
- [ ] Notification spam
- [ ] Auto-refresh performance issues
- [ ] Modal form submission errors
- [ ] Export functionality errors
- [ ] Filter application errors

## Rollback Criteria

Rollback immediately if:
- [ ] Critical functionality is broken
- [ ] Error rate > 5%
- [ ] Page load time > 10 seconds
- [ ] Data loss or corruption detected
- [ ] Security vulnerability discovered
- [ ] Multiple user reports of critical issues

## Rollback Process

If rollback is needed:

### Via Vercel Dashboard (Fastest)
1. Go to https://vercel.com/dashboard
2. Navigate to Deployments
3. Find previous stable deployment
4. Click "..." → "Promote to Production"

### Via Git
```bash
# Use the backup branch created during deployment
git checkout backup/pre-dashboard-unification-YYYYMMDD-HHMMSS
git push origin main --force
```

### Via Vercel CLI
```bash
vercel ls
vercel rollback <previous-deployment-url>
```

## Post-Rollback Actions
- [ ] Verify rollback successful
- [ ] Notify team of rollback
- [ ] Document issues that caused rollback
- [ ] Create action plan to fix issues
- [ ] Schedule new deployment when ready

## Success Criteria

Deployment is successful when:
- [ ] All smoke tests pass
- [ ] No critical errors in first hour
- [ ] Performance metrics acceptable
- [ ] No user-reported critical issues
- [ ] All features functioning correctly
- [ ] Monitoring shows stable operation

## Sign-Off

### Deployment Completed By
- **Name**: _________________
- **Date**: _________________
- **Time**: _________________

### Verification Completed By
- **Name**: _________________
- **Date**: _________________
- **Time**: _________________

### Deployment Status
- [ ] ✅ Successful - No issues
- [ ] ⚠️  Successful - Minor issues (document below)
- [ ] ❌ Rolled back - Critical issues (document below)

### Notes
_Document any issues, observations, or lessons learned:_

---

---

## Quick Reference

### Useful Commands
```bash
# Prepare deployment
npm run deploy:prepare

# Verify build
npm run deploy:verify

# Monitor deployment
npm run deploy:monitor

# Check Vercel logs
vercel logs

# List deployments
vercel ls

# Rollback
vercel rollback <url>
```

### Useful Links
- Vercel Dashboard: https://vercel.com/dashboard
- Deployment Guide: ./DEPLOYMENT_GUIDE.md
- Manual Testing Guide: ./MANUAL_TESTING_GUIDE.md
- Accessibility Audit: ./ACCESSIBILITY_AUDIT.md

### Emergency Contacts
- **Tech Lead**: _________________
- **DevOps**: _________________
- **Support**: _________________
