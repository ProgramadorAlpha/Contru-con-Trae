# Job Costing System - Deployment Checklist

## Pre-Deployment (Before Running Deploy Script)

### Code & Repository
- [ ] All code committed to Git
- [ ] No uncommitted changes
- [ ] On main/master branch
- [ ] All merge conflicts resolved
- [ ] Code reviewed and approved

### Testing
- [ ] Core job costing tests passing (27/27)
- [ ] Production build succeeds
- [ ] No critical TypeScript errors in core modules
- [ ] Manual testing completed

### Configuration
- [ ] Firebase project created
- [ ] Firebase credentials obtained
- [ ] Environment variables prepared
- [ ] Vercel account connected
- [ ] Domain configured (if using custom domain)

### Documentation
- [ ] Deployment guide reviewed
- [ ] API documentation updated
- [ ] User documentation prepared
- [ ] Training materials ready

## Deployment Execution

### Step 1: Run Deployment Script
```bash
npm run deploy:job-costing
```

- [ ] Pre-deployment checks passed
- [ ] Backup branch created
- [ ] Deployment log generated
- [ ] No errors in script output

### Step 2: Deploy Application

Choose deployment method:

**Option A: Git Push**
```bash
git push origin main
```
- [ ] Push successful
- [ ] Vercel deployment triggered
- [ ] Build completed successfully

**Option B: Vercel CLI**
```bash
vercel --prod
```
- [ ] Deployment initiated
- [ ] Build completed
- [ ] Production URL received

**Option C: Vercel Dashboard**
- [ ] Logged into Vercel
- [ ] Project selected
- [ ] Deploy button clicked
- [ ] Deployment successful

### Step 3: Configure Firebase

#### Firestore Setup
- [ ] Collections created
- [ ] Security rules deployed
- [ ] Indexes created (if needed)
- [ ] Test data added (optional)

#### Authentication Setup
- [ ] Email/password enabled
- [ ] Authorized domains configured
- [ ] First admin user created
- [ ] Test authentication works

#### Storage Setup
- [ ] Storage bucket configured
- [ ] Security rules deployed
- [ ] CORS configured
- [ ] Test file upload works

### Step 4: Environment Variables

#### Vercel Environment Variables
- [ ] VITE_FIREBASE_API_KEY set
- [ ] VITE_FIREBASE_AUTH_DOMAIN set
- [ ] VITE_FIREBASE_PROJECT_ID set
- [ ] VITE_FIREBASE_STORAGE_BUCKET set
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID set
- [ ] VITE_FIREBASE_APP_ID set
- [ ] All variables set to "Production" scope
- [ ] Deployment redeployed after variable changes

### Step 5: Initialize Data

#### Cost Code Catalog
- [ ] Cost codes imported/created
- [ ] Hierarchy verified
- [ ] All codes active
- [ ] Test cost code selection works

#### Initial Users
- [ ] Admin user created
- [ ] Test users created (optional)
- [ ] Roles assigned
- [ ] Permissions verified

#### Sample Data (Optional)
- [ ] Sample project created
- [ ] Sample subcontract created
- [ ] Sample expenses created
- [ ] Data displays correctly

## Post-Deployment Verification

### Immediate Checks (First 15 Minutes)

#### Application Access
- [ ] Application loads without errors
- [ ] No JavaScript console errors
- [ ] No network errors
- [ ] Theme toggle works
- [ ] Navigation works

#### Authentication
- [ ] Can log in
- [ ] Can log out
- [ ] Password reset works
- [ ] Session persists
- [ ] Unauthorized access blocked

#### Core Pages
- [ ] Dashboard loads
- [ ] Projects page loads
- [ ] Subcontracts page loads
- [ ] Progress certificates page loads
- [ ] Cost codes page loads
- [ ] Expense approvals page loads
- [ ] Project financials page loads
- [ ] Audit log page loads

### Critical Feature Testing (First 30 Minutes)

#### Subcontract Management
- [ ] Can create subcontract
- [ ] Can edit subcontract
- [ ] Can view subcontract details
- [ ] Can upload documents
- [ ] Committed cost updates correctly

#### Progress Certificates
- [ ] Can create certificate
- [ ] Retention calculates correctly
- [ ] Net payable calculates correctly
- [ ] Can approve certificate
- [ ] Payment created on approval
- [ ] Actual cost updates correctly

#### Cost Code Classification
- [ ] Cost code selector works
- [ ] Can select from hierarchy
- [ ] Search works
- [ ] Recently used shows
- [ ] Required validation works

#### Expense Management
- [ ] Can create expense
- [ ] Classification required
- [ ] Can approve expense
- [ ] Can reject expense
- [ ] Actual cost updates
- [ ] Cost code budget updates

#### Financial Calculations
- [ ] Committed cost correct
- [ ] Actual cost correct
- [ ] Retention amounts correct
- [ ] Net payable correct
- [ ] Project margin correct
- [ ] Budget variance correct
- [ ] Profitability widget accurate

#### Reporting
- [ ] Job costing report generates
- [ ] Report shows correct data
- [ ] Can export to PDF
- [ ] Can export to Excel
- [ ] Charts render correctly

#### Audit Logging
- [ ] Audit log records actions
- [ ] Can view audit log
- [ ] Filters work
- [ ] Shows correct user/timestamp

### API Testing (First Hour)

#### OCR Expense Endpoint
- [ ] Endpoint accessible
- [ ] Can create expense via API
- [ ] Validates required fields
- [ ] Returns proper errors
- [ ] Attaches OCR data
- [ ] Creates notification

#### API Security
- [ ] Requires authentication
- [ ] Validates API key
- [ ] Rate limiting works (if configured)
- [ ] CORS configured correctly

### Performance Testing

#### Load Times
- [ ] Homepage < 3 seconds
- [ ] Dashboard < 3 seconds
- [ ] Project financials < 2 seconds
- [ ] Reports < 5 seconds
- [ ] No performance warnings

#### Lighthouse Audit
- [ ] Performance score > 85
- [ ] Accessibility score > 95
- [ ] Best practices score > 90
- [ ] SEO score > 90

### Browser Compatibility

- [ ] Chrome (latest) ✅
- [ ] Firefox (latest) ✅
- [ ] Safari (latest) ✅
- [ ] Edge (latest) ✅

### Device Compatibility

- [ ] Desktop (1920x1080) ✅
- [ ] Laptop (1366x768) ✅
- [ ] Tablet (768x1024) ✅
- [ ] Mobile (375x667) ✅

### Security Testing

#### Access Control
- [ ] Role-based access works
- [ ] Unauthorized users blocked
- [ ] Admin-only features protected
- [ ] Data isolation works

#### Data Validation
- [ ] Required fields enforced
- [ ] Invalid data rejected
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

#### Firebase Security
- [ ] Security rules enforced
- [ ] Unauthorized reads blocked
- [ ] Unauthorized writes blocked
- [ ] Data properly isolated

## n8n Workflow Configuration (Optional)

### n8n Setup
- [ ] n8n instance running
- [ ] Workflow imported
- [ ] Credentials configured
- [ ] Email trigger configured
- [ ] OCR service configured

### Workflow Testing
- [ ] Send test email
- [ ] Workflow triggers
- [ ] OCR processes correctly
- [ ] Data parsed correctly
- [ ] API request succeeds
- [ ] Expense created
- [ ] Notification sent

### Workflow Monitoring
- [ ] Execution history visible
- [ ] Errors logged
- [ ] Success rate acceptable
- [ ] Performance acceptable

## Monitoring Setup

### Automated Monitoring
- [ ] Health check script configured
- [ ] Cron job set up (optional)
- [ ] Alerts configured
- [ ] Logging configured

### Manual Monitoring
- [ ] Vercel dashboard bookmarked
- [ ] Firebase console bookmarked
- [ ] Error tracking set up
- [ ] Performance monitoring set up

### Alerting
- [ ] Email alerts configured
- [ ] Slack alerts configured (optional)
- [ ] SMS alerts configured (optional)
- [ ] Alert thresholds set

## Documentation & Training

### User Documentation
- [ ] User guide created
- [ ] Video tutorials recorded (optional)
- [ ] FAQ document created
- [ ] Support contact provided

### Training
- [ ] Admin training completed
- [ ] User training scheduled
- [ ] Training materials distributed
- [ ] Support team briefed

### Handover
- [ ] Deployment log shared
- [ ] Access credentials shared
- [ ] Support procedures documented
- [ ] Escalation path defined

## Post-Deployment Monitoring (24 Hours)

### Hour 1
- [ ] No critical errors
- [ ] All features working
- [ ] Performance acceptable
- [ ] No user complaints

### Hour 4
- [ ] System stable
- [ ] No memory leaks
- [ ] No performance degradation
- [ ] Error rate acceptable

### Hour 12
- [ ] Multiple users tested
- [ ] Concurrent usage tested
- [ ] Data integrity verified
- [ ] Backups working

### Hour 24
- [ ] System fully stable
- [ ] All workflows tested
- [ ] User feedback collected
- [ ] Issues documented

## Sign-Off

### Technical Sign-Off
- [ ] All technical checks passed
- [ ] No critical issues
- [ ] Performance acceptable
- [ ] Security verified

**Signed:** _________________ **Date:** _________

### Business Sign-Off
- [ ] All features working
- [ ] User acceptance complete
- [ ] Training complete
- [ ] Ready for production use

**Signed:** _________________ **Date:** _________

## Rollback Plan (If Needed)

### Rollback Triggers
- [ ] Critical feature not working
- [ ] Data corruption detected
- [ ] Security vulnerability found
- [ ] Performance unacceptable
- [ ] Multiple user complaints

### Rollback Procedure
1. [ ] Notify stakeholders
2. [ ] Execute rollback (see DEPLOYMENT_GUIDE.md)
3. [ ] Verify rollback successful
4. [ ] Investigate root cause
5. [ ] Plan fix and redeployment

## Success Criteria

Deployment is successful when:
- ✅ All critical features work correctly
- ✅ No critical errors in logs
- ✅ Performance meets targets
- ✅ Security is enforced
- ✅ Users can complete workflows
- ✅ Financial calculations accurate
- ✅ Audit trail working
- ✅ System stable for 24 hours

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Version:** 2.0.0  
**Status:** ☐ In Progress  ☐ Complete  ☐ Rolled Back
