# Job Costing System - Deployment Quick Start

## 🚀 Quick Deployment (5 Minutes)

### Prerequisites
- ✅ Code committed to Git
- ✅ Vercel account connected
- ✅ Firebase project created
- ✅ Environment variables configured

### Step 1: Run Deployment Script
```bash
npm run deploy:job-costing
```

This will:
- ✅ Run pre-deployment checks
- ✅ Create backup branch
- ✅ Generate deployment log
- ✅ Display deployment instructions

### Step 2: Deploy
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
- Go to https://vercel.com/dashboard
- Click "Deploy"

### Step 3: Monitor
```bash
npm run monitor:job-costing -- https://your-domain.com
```

## 📋 Post-Deployment Checklist (15 Minutes)

### Critical Tests
- [ ] Application loads
- [ ] Create subcontract
- [ ] Create progress certificate
- [ ] Approve expense
- [ ] View project financials
- [ ] Generate report

### Financial Calculations
- [ ] Committed cost correct
- [ ] Actual cost correct
- [ ] Retention correct
- [ ] Margin correct

## 🔄 Rollback (If Needed)

### Via Vercel Dashboard
1. Go to Deployments
2. Find previous deployment
3. Click "Promote to Production"

### Via Git
```bash
git checkout backup/pre-job-costing-deployment-*
git push origin main --force
```

## 📖 Full Documentation

- **Complete Guide**: `.kiro/specs/job-costing-system/DEPLOYMENT_GUIDE.md`
- **n8n Setup**: `.kiro/specs/job-costing-system/N8N_CONFIGURATION_GUIDE.md`
- **API Reference**: `docs/API_REFERENCE.md`

## 🆘 Support

If issues occur:
1. Check deployment log: `.kiro/specs/job-costing-system/DEPLOYMENT_LOG.md`
2. Review Vercel logs
3. Check Firebase console
4. Run rollback if critical

## ✅ Success Criteria

Deployment successful when:
- ✅ All critical features work
- ✅ Financial calculations accurate
- ✅ No critical errors
- ✅ Performance acceptable

---

**Ready to deploy?** Run `npm run deploy:job-costing`
