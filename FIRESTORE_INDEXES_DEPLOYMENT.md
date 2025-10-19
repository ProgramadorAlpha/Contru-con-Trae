# Firestore Indexes Deployment Guide

## Overview

This guide explains how to deploy Firestore indexes for the Budget & Finance module. Indexes are essential for query performance and are required for complex queries involving multiple fields.

## Prerequisites

1. **Firebase CLI**: Install if not already installed
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Ensure you're connected to the correct Firebase project
   ```bash
   firebase projects:list
   ```

3. **Authentication**: Login to Firebase
   ```bash
   firebase login
   ```

## Index Configuration

All indexes are defined in `firestore.indexes.json`. The file includes indexes for:

### Presupuestos Collection
- **Estado + CreatedAt**: For filtering by status and sorting by creation date
- **Cliente.id + CreatedAt**: For filtering by client and sorting
- **Estado + FechaCreacion**: Alternative sorting by fecha de creación

### Facturas Collection
- **Estado + FechaVencimiento**: For finding overdue invoices
- **ProyectoId + CreatedAt**: For project-specific invoice lists
- **Estado + CreatedAt**: For filtering by status

### Alertas Financieras Collection
- **Estado + Prioridad + CreatedAt**: For prioritized alert lists
- **ProyectoId + Estado + CreatedAt**: For project-specific alerts
- **Estado + CreatedAt**: For general alert filtering

### Clientes Collection
- **Nombre + CreatedAt**: For alphabetical client lists

## Deployment Steps

### Step 1: Review Index Configuration

Before deploying, review the indexes:

```bash
cat firestore.indexes.json
```

Verify that all required indexes are present.

### Step 2: Deploy Indexes

Deploy the indexes to Firebase:

```bash
firebase deploy --only firestore:indexes
```

**Expected Output:**
```
=== Deploying to 'your-project-id'...

i  firestore: reading indexes from firestore.indexes.json...
✔  firestore: deployed indexes in firestore.indexes.json successfully

✔  Deploy complete!
```

### Step 3: Monitor Index Creation

Indexes are created asynchronously. Monitor their status:

**Option 1: Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Click on "Indexes" tab
5. Check the status of each index

**Option 2: Firebase CLI**
```bash
firebase firestore:indexes
```

### Step 4: Verify Index Status

Indexes can be in one of these states:

- 🟡 **Creating**: Index is being built (can take minutes to hours)
- 🟢 **Enabled**: Index is ready to use
- 🔴 **Error**: Index creation failed

**Wait for all indexes to show "Enabled" before using the application in production.**

## Index Build Times

Build times depend on existing data:

| Data Size | Estimated Time |
|-----------|----------------|
| < 1,000 documents | 1-5 minutes |
| 1,000 - 10,000 documents | 5-30 minutes |
| 10,000 - 100,000 documents | 30 minutes - 2 hours |
| > 100,000 documents | 2+ hours |

## Testing Indexes

### Local Testing with Emulator

Test indexes locally before deploying:

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# In another terminal, run your tests
npm run test
```

### Production Testing

After deployment, test queries that use indexes:

```javascript
// Test presupuestos query
const presupuestos = await db.collection('presupuestos')
  .where('estado', '==', 'enviado')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();

console.log(`Found ${presupuestos.size} presupuestos`);

// Test facturas query
const facturasVencidas = await db.collection('facturas')
  .where('estado', '==', 'enviada')
  .where('fechaVencimiento', '<', new Date())
  .get();

console.log(`Found ${facturasVencidas.size} overdue facturas`);

// Test alertas query
const alertasCriticas = await db.collection('alertas-financieras')
  .where('estado', '==', 'activa')
  .where('prioridad', '==', 'critica')
  .orderBy('createdAt', 'desc')
  .get();

console.log(`Found ${alertasCriticas.size} critical alerts`);
```

## Common Issues and Solutions

### Issue 1: "The query requires an index"

**Error Message:**
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

**Solution:**
1. Click the provided link to create the index automatically
2. Or add the index manually to `firestore.indexes.json`
3. Deploy the updated indexes

### Issue 2: Index Creation Stuck

**Symptoms:**
- Index shows "Creating" for hours
- No progress visible

**Solution:**
1. Check Firebase Console for error messages
2. Delete the stuck index
3. Redeploy indexes
4. Contact Firebase support if issue persists

### Issue 3: Index Already Exists

**Error Message:**
```
Index already exists
```

**Solution:**
- This is not an error, the index is already deployed
- No action needed
- Continue with deployment

### Issue 4: Insufficient Permissions

**Error Message:**
```
Permission denied
```

**Solution:**
1. Verify you're logged in: `firebase login`
2. Check you have "Editor" or "Owner" role in Firebase project
3. Verify project ID: `firebase use --add`

## Index Maintenance

### Adding New Indexes

When adding new queries that require indexes:

1. **Identify the Query**
   ```javascript
   // Example: New query for presupuestos by monto
   const query = db.collection('presupuestos')
     .where('estado', '==', 'aprobado')
     .where('montos.total', '>', 10000)
     .orderBy('montos.total', 'desc');
   ```

2. **Add to firestore.indexes.json**
   ```json
   {
     "collectionGroup": "presupuestos",
     "queryScope": "COLLECTION",
     "fields": [
       { "fieldPath": "estado", "order": "ASCENDING" },
       { "fieldPath": "montos.total", "order": "DESCENDING" }
     ]
   }
   ```

3. **Deploy**
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Removing Unused Indexes

To remove indexes that are no longer needed:

1. Remove from `firestore.indexes.json`
2. Deploy changes
3. Manually delete from Firebase Console (optional)

**Note**: Unused indexes consume storage and slow down writes. Remove them to improve performance.

### Monitoring Index Usage

Use Firebase Console to monitor:
- Query performance
- Index usage statistics
- Slow queries

Navigate to: Firestore Database > Usage tab

## Performance Optimization

### Best Practices

1. **Minimize Indexes**: Only create indexes for queries you actually use
2. **Composite Indexes**: Use composite indexes for multi-field queries
3. **Index Direction**: Match index order to query order
4. **Avoid Inequality**: Limit inequality filters (>, <, !=) to one field per query

### Query Optimization Tips

**❌ Bad: Multiple inequality filters**
```javascript
// Requires complex index, slow
const query = db.collection('presupuestos')
  .where('montos.total', '>', 1000)
  .where('montos.total', '<', 10000)
  .where('fechaCreacion', '>', startDate);
```

**✅ Good: Single inequality filter**
```javascript
// Uses simple index, fast
const query = db.collection('presupuestos')
  .where('estado', '==', 'aprobado')
  .where('montos.total', '>', 1000)
  .orderBy('montos.total', 'desc');
```

### Pagination

Always use pagination for large result sets:

```javascript
// First page
const firstPage = await db.collection('presupuestos')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

// Next page
const lastDoc = firstPage.docs[firstPage.docs.length - 1];
const nextPage = await db.collection('presupuestos')
  .orderBy('createdAt', 'desc')
  .startAfter(lastDoc)
  .limit(20)
  .get();
```

## Rollback Procedure

If you need to rollback index changes:

1. **Revert firestore.indexes.json**
   ```bash
   git checkout HEAD~1 firestore.indexes.json
   ```

2. **Redeploy**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Verify**
   - Check Firebase Console
   - Test affected queries

## Automated Deployment

### CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Deploy Firestore Indexes
  run: |
    npm install -g firebase-tools
    firebase deploy --only firestore:indexes --token ${{ secrets.FIREBASE_TOKEN }}
```

### Pre-deployment Checks

Create a script to validate indexes before deployment:

```javascript
// scripts/validate-indexes.js
const fs = require('fs');

const indexes = JSON.parse(fs.readFileSync('firestore.indexes.json', 'utf8'));

// Validate structure
if (!indexes.indexes || !Array.isArray(indexes.indexes)) {
  console.error('Invalid indexes structure');
  process.exit(1);
}

// Check for duplicates
const seen = new Set();
for (const index of indexes.indexes) {
  const key = JSON.stringify(index);
  if (seen.has(key)) {
    console.error('Duplicate index found:', index);
    process.exit(1);
  }
  seen.add(key);
}

console.log('✅ Indexes validation passed');
```

Run before deployment:
```bash
node scripts/validate-indexes.js && firebase deploy --only firestore:indexes
```

## Monitoring and Alerts

### Set Up Alerts

Configure alerts for index issues:

1. Go to Firebase Console > Monitoring
2. Create alert for "Firestore Index Creation Failed"
3. Set notification channel (email, Slack, etc.)

### Regular Audits

Schedule regular index audits:
- Monthly: Review index usage
- Quarterly: Remove unused indexes
- Annually: Optimize index strategy

## Support and Resources

### Documentation
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)
- [Index Best Practices](https://firebase.google.com/docs/firestore/best-practices)

### Getting Help
- Firebase Support: https://firebase.google.com/support
- Stack Overflow: Tag `google-cloud-firestore`
- Firebase Community: https://firebase.google.com/community

### Related Files
- `firestore.indexes.json` - Index definitions
- `firestore.rules` - Security rules
- `FIRESTORE_SECURITY_RULES.md` - Security documentation

---

## Quick Reference

### Deploy Everything
```bash
firebase deploy --only firestore
```

### Deploy Only Indexes
```bash
firebase deploy --only firestore:indexes
```

### Deploy Only Rules
```bash
firebase deploy --only firestore:rules
```

### List Current Indexes
```bash
firebase firestore:indexes
```

### Check Deployment Status
```bash
firebase deploy:status
```

---

**Last Updated**: January 2025  
**Version**: 1.0.0
