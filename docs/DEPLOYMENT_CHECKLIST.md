# Budget & Finance Module - Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Review
- [ ] All code has been reviewed and approved
- [ ] No console.log or debug statements in production code
- [ ] Error handling is implemented for all critical paths
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed

### 2. Testing
- [ ] Unit tests pass (run `npm test`)
- [ ] Integration tests pass
- [ ] Manual testing completed for all features
- [ ] Edge cases tested
- [ ] Error scenarios tested

### 3. Documentation
- [ ] User guides created (PRESUPUESTOS_GUIDE.md, FINANZAS_GUIDE.md)
- [ ] Technical documentation updated
- [ ] API documentation complete
- [ ] Security rules documented

### 4. Configuration
- [ ] Environment variables configured
- [ ] Firebase project settings verified
- [ ] API keys secured
- [ ] Storage buckets configured

## Firestore Deployment

### 1. Validate Configuration

```bash
# Validate indexes and rules
node scripts/deploy-firestore.js --validate-only
```

**Expected Output:**
```
✅ Validated X indexes
✅ Security rules validation passed
```

### 2. Deploy Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

**Verification:**
- [ ] Command completes without errors
- [ ] Check Firebase Console > Firestore > Indexes
- [ ] All indexes show "Creating" or "Enabled" status
- [ ] No indexes show "Error" status

**Wait Time:** Indexes may take 5-60 minutes to build depending on data size.

### 3. Deploy Security Rules

```bash
# Deploy security rules
firebase deploy --only firestore:rules
```

**Verification:**
- [ ] Command completes without errors
- [ ] Check Firebase Console > Firestore > Rules
- [ ] Rules show correct deployment timestamp
- [ ] Test rules with Firebase Emulator

### 4. Verify Index Status

Monitor index creation:

```bash
# Check index status
firebase firestore:indexes
```

Wait until all indexes show **"Enabled"** before proceeding.

## Application Deployment

### 1. Build Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

**Verification:**
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] Bundle size is reasonable
- [ ] Source maps generated (if configured)

### 2. Deploy to Hosting

```bash
# Deploy to Firebase Hosting or Vercel
npm run deploy
```

**For Firebase Hosting:**
```bash
firebase deploy --only hosting
```

**For Vercel:**
```bash
vercel --prod
```

**Verification:**
- [ ] Deployment completes successfully
- [ ] Application is accessible at production URL
- [ ] No 404 errors on routes
- [ ] Assets load correctly

### 3. Smoke Tests

After deployment, perform smoke tests:

#### Test 1: Authentication
- [ ] Login works
- [ ] Logout works
- [ ] Session persists on refresh

#### Test 2: Presupuestos
- [ ] Can view presupuestos list
- [ ] Can create new presupuesto
- [ ] Can edit presupuesto
- [ ] Can send presupuesto to client
- [ ] Public presupuesto link works (no auth required)

#### Test 3: Clientes
- [ ] Can view clientes list
- [ ] Can create new cliente
- [ ] Can edit cliente
- [ ] Cliente stats display correctly

#### Test 4: Finanzas
- [ ] Dashboard loads with correct metrics
- [ ] Tesorería calculations are correct
- [ ] Alertas display properly
- [ ] Facturas list loads

#### Test 5: Conversión
- [ ] Can convert presupuesto to proyecto
- [ ] Factura de adelanto is created
- [ ] Fase 1 is properly blocked/unblocked
- [ ] Tesorería updates correctly

## Post-Deployment Verification

### 1. Monitor Errors

Check for errors in:

**Firebase Console:**
- [ ] Firestore > Usage tab (no unusual spikes)
- [ ] Functions > Logs (if using Cloud Functions)
- [ ] Hosting > Usage (traffic is normal)

**Application Logs:**
- [ ] No JavaScript errors in browser console
- [ ] No failed API requests
- [ ] No permission denied errors

### 2. Performance Check

Verify performance:
- [ ] Page load time < 3 seconds
- [ ] Firestore queries complete quickly
- [ ] No slow queries warnings
- [ ] Images and assets load fast

### 3. Security Verification

Test security rules:

**Test 1: Cross-Company Access**
- [ ] User A cannot see User B's presupuestos (different companies)
- [ ] User A cannot edit User B's clientes
- [ ] User A cannot see User B's facturas

**Test 2: Public Access**
- [ ] Public presupuesto link works without auth
- [ ] Cannot access presupuesto without valid token
- [ ] Expired presupuestos show error message

**Test 3: Role-Based Access**
- [ ] Regular users cannot delete facturas
- [ ] Admins can force unblock fases
- [ ] Regular users cannot delete alertas

### 4. Data Integrity

Verify data integrity:
- [ ] Presupuesto totals calculate correctly
- [ ] Tesorería calculations are accurate
- [ ] Factura numbers are sequential
- [ ] No duplicate records

### 5. Integration Tests

Test integrations:

**IA Integration:**
- [ ] Claude API responds correctly
- [ ] Presupuesto generation works
- [ ] Error handling for API failures

**Email Integration:**
- [ ] Presupuesto emails send successfully
- [ ] Factura emails send successfully
- [ ] Email templates render correctly

**PDF Generation:**
- [ ] Presupuesto PDFs generate correctly
- [ ] Factura PDFs generate correctly
- [ ] Signed PDFs include signatures

## Rollback Plan

If issues are detected, follow rollback procedure:

### 1. Identify Issue
- Document the specific problem
- Determine severity (critical, high, medium, low)
- Decide if rollback is necessary

### 2. Rollback Application

**For Firebase Hosting:**
```bash
# List previous deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

**For Vercel:**
```bash
# Rollback via Vercel dashboard
# Or redeploy previous commit
vercel --prod
```

### 3. Rollback Firestore (if needed)

**Indexes:**
```bash
# Revert to previous version
git checkout HEAD~1 firestore.indexes.json
firebase deploy --only firestore:indexes
```

**Rules:**
```bash
# Revert to previous version
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules
```

### 4. Communicate

- [ ] Notify team of rollback
- [ ] Update status page (if applicable)
- [ ] Document root cause
- [ ] Plan fix and redeployment

## Monitoring Setup

### 1. Set Up Alerts

Configure alerts for:

**Firebase Console > Monitoring:**
- [ ] Firestore read/write spikes
- [ ] Firestore errors
- [ ] Hosting errors
- [ ] Function errors (if applicable)

**Application Monitoring:**
- [ ] JavaScript errors (Sentry, LogRocket, etc.)
- [ ] API failures
- [ ] Slow queries
- [ ] User session errors

### 2. Dashboard Setup

Create monitoring dashboard with:
- [ ] Active users count
- [ ] Presupuestos created (daily)
- [ ] Facturas generated (daily)
- [ ] Alertas activas count
- [ ] Error rate
- [ ] Response time

### 3. Regular Checks

Schedule regular checks:
- [ ] Daily: Check error logs
- [ ] Daily: Review active alertas
- [ ] Weekly: Review performance metrics
- [ ] Weekly: Check index usage
- [ ] Monthly: Security audit
- [ ] Monthly: Cost review

## User Communication

### 1. Pre-Launch Communication

Send to users:
- [ ] Feature announcement email
- [ ] User guide links
- [ ] Training session schedule (if applicable)
- [ ] Support contact information

### 2. Launch Announcement

Include in announcement:
- [ ] New features overview
- [ ] Benefits and improvements
- [ ] How to get started
- [ ] Where to find help
- [ ] Known limitations (if any)

### 3. Post-Launch Support

Provide:
- [ ] Dedicated support channel
- [ ] FAQ document
- [ ] Video tutorials (optional)
- [ ] Office hours for questions

## Success Criteria

Deployment is successful when:

### Technical Criteria
- [ ] All indexes are "Enabled"
- [ ] Security rules are active
- [ ] Application is accessible
- [ ] No critical errors in logs
- [ ] Performance meets targets

### Functional Criteria
- [ ] Users can create presupuestos
- [ ] IA generation works
- [ ] Presupuestos can be sent to clients
- [ ] Clients can approve/reject
- [ ] Conversion to proyecto works
- [ ] Tesorería calculates correctly
- [ ] Alertas generate properly
- [ ] Facturas can be created and managed

### User Criteria
- [ ] Users can access the system
- [ ] Users understand how to use features
- [ ] No major user complaints
- [ ] Support tickets are manageable

## Troubleshooting Guide

### Issue: Indexes Not Building

**Symptoms:**
- Indexes stuck in "Creating" state
- Queries fail with "requires an index" error

**Solutions:**
1. Wait longer (can take up to 2 hours for large datasets)
2. Check Firebase Console for error messages
3. Delete and recreate stuck index
4. Contact Firebase support

### Issue: Permission Denied Errors

**Symptoms:**
- Users see "Permission denied" errors
- Cannot read/write documents

**Solutions:**
1. Verify security rules are deployed
2. Check user authentication status
3. Verify empresaId matches
4. Check user role permissions

### Issue: Public Presupuesto Not Loading

**Symptoms:**
- Public link shows error
- Client cannot view presupuesto

**Solutions:**
1. Verify token exists in presupuestos-publicos collection
2. Check presupuesto hasn't expired
3. Verify security rules allow public read
4. Check network connectivity

### Issue: Tesorería Incorrect

**Symptoms:**
- Tesorería shows wrong amount
- Calculations don't match

**Solutions:**
1. Verify all cobros are registered
2. Verify all gastos are registered
3. Check for duplicate transactions
4. Recalculate manually and compare

### Issue: Alertas Not Generating

**Symptoms:**
- No alertas appear
- Expected alertas missing

**Solutions:**
1. Verify financial verifications are running
2. Check alerta.service.ts for errors
3. Verify thresholds are configured correctly
4. Check Firestore permissions

## Final Sign-Off

Before considering deployment complete:

- [ ] Technical lead approval
- [ ] Product owner approval
- [ ] QA sign-off
- [ ] Security review complete
- [ ] Documentation complete
- [ ] Monitoring configured
- [ ] Support team briefed
- [ ] Users notified

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Sign-Off:** _______________

---

## Quick Reference Commands

```bash
# Validate configuration
node scripts/deploy-firestore.js --validate-only

# Deploy indexes only
firebase deploy --only firestore:indexes

# Deploy rules only
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy --only firestore

# Check index status
firebase firestore:indexes

# Build application
npm run build

# Deploy application
npm run deploy

# Rollback (Firebase Hosting)
firebase hosting:rollback
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0
