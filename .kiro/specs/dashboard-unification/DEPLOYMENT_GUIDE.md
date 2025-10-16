# Deployment Guide - Dashboard Unification

## Pre-Deployment Checklist

### 1. Backup Current Version

Before deploying, create a backup of the current production state:

```bash
# Create a backup branch from current production
git checkout main
git pull origin main
git checkout -b backup/pre-dashboard-unification-$(date +%Y%m%d-%H%M%S)
git push origin backup/pre-dashboard-unification-$(date +%Y%m%d-%H%M%S)
```

### 2. Verify Build Success

```bash
# Clean install dependencies
npm ci

# Run type checking
npm run check

# Run linting
npm run lint

# Run all tests
npm run test:run

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### 3. Pre-Deployment Verification

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Production build successful
- [ ] Local preview working correctly
- [ ] All features tested manually
- [ ] Accessibility audit passed
- [ ] Performance benchmarks acceptable

## Deployment Process

### Option 1: Vercel CLI Deployment

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy to preview environment first
vercel

# After verification, deploy to production
vercel --prod
```

### Option 2: Git-based Deployment (Recommended)

```bash
# Ensure you're on the correct branch
git checkout main

# Push to trigger automatic deployment
git push origin main
```

### Option 3: Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to "Deployments" tab
4. Click "Deploy" button
5. Select the branch to deploy
6. Confirm deployment

## Post-Deployment Verification

### Immediate Checks (First 5 minutes)

1. **Verify Deployment Success**
   - Check Vercel dashboard for deployment status
   - Verify build logs show no errors
   - Confirm deployment URL is accessible

2. **Smoke Tests**
   - [ ] Application loads without errors
   - [ ] Dashboard page renders correctly
   - [ ] Theme toggle works (light/dark mode)
   - [ ] Navigation between pages works
   - [ ] Authentication works (if applicable)

3. **Critical Features**
   - [ ] Dashboard stats display correctly
   - [ ] Charts render without errors
   - [ ] Modals open and close properly
   - [ ] Notifications system works
   - [ ] Settings panel functions correctly
   - [ ] Data export works
   - [ ] Filters apply correctly

### Extended Monitoring (First Hour)

1. **Error Monitoring**
   - Check browser console for JavaScript errors
   - Monitor Vercel logs for server errors
   - Check for 404 or routing issues

2. **Performance Monitoring**
   - Verify page load times are acceptable
   - Check Lighthouse scores
   - Monitor Core Web Vitals

3. **User Experience**
   - Test on different browsers (Chrome, Firefox, Safari, Edge)
   - Test on different devices (Desktop, Tablet, Mobile)
   - Verify responsive design works correctly

## Rollback Plan

### If Critical Issues Are Found

#### Quick Rollback via Vercel Dashboard

1. Go to Vercel Dashboard → Deployments
2. Find the previous stable deployment
3. Click "..." menu → "Promote to Production"
4. Confirm rollback

#### Rollback via Git

```bash
# Revert to backup branch
git checkout backup/pre-dashboard-unification-YYYYMMDD-HHMMSS
git push origin main --force

# Or revert specific commits
git revert <commit-hash>
git push origin main
```

#### Emergency Rollback via Vercel CLI

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Monitoring Checklist

### First 24 Hours

- [ ] Monitor error rates in Vercel logs
- [ ] Check user feedback/reports
- [ ] Monitor performance metrics
- [ ] Verify all integrations working
- [ ] Check database operations (if applicable)
- [ ] Monitor API response times
- [ ] Verify theme persistence works
- [ ] Check localStorage functionality

### Known Issues to Watch For

1. **Theme Persistence**: Verify theme preference saves correctly
2. **Widget Configuration**: Ensure widget visibility settings persist
3. **Notifications**: Check notification system doesn't spam users
4. **Auto-refresh**: Verify auto-refresh doesn't cause performance issues
5. **Modal Forms**: Ensure form submissions work correctly
6. **Data Export**: Verify export functionality works in production

## Success Criteria

Deployment is considered successful when:

- [ ] No critical errors in logs (first hour)
- [ ] All smoke tests pass
- [ ] Performance metrics within acceptable range
- [ ] No user-reported critical issues
- [ ] All features functioning as expected
- [ ] Rollback plan tested and ready if needed

## Communication Plan

### Stakeholder Notification

**Before Deployment:**
- Notify team of deployment window
- Share expected downtime (if any)
- Provide rollback contact information

**After Deployment:**
- Confirm successful deployment
- Share new features/changes
- Provide feedback channels

**If Issues Occur:**
- Immediate notification to team
- Status updates every 15 minutes
- Clear communication of rollback decision

## Deployment Log

### Deployment Information

- **Date**: _____________
- **Time**: _____________
- **Deployed By**: _____________
- **Deployment URL**: _____________
- **Commit Hash**: _____________
- **Vercel Deployment ID**: _____________

### Verification Results

- [ ] Build successful
- [ ] Deployment successful
- [ ] Smoke tests passed
- [ ] No critical errors
- [ ] Performance acceptable

### Issues Found

_Document any issues found during deployment:_

---

### Resolution

_Document how issues were resolved:_

---

## Lessons Learned

_Document lessons learned for future deployments:_

---
