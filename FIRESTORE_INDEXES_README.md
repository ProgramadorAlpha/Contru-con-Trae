# Firestore Indexes Deployment Guide

This document explains how to deploy the Firestore composite indexes required for the Budget & Finance module.

## Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Authenticated with Firebase (`firebase login`)
- Firebase project initialized in this directory

## Index Configuration

The `firestore.indexes.json` file contains all composite indexes needed for:

- **Proyectos**: Filtering by estado and sorting by creation date
- **Presupuestos**: Filtering by estado, cliente, and sorting by dates
- **Facturas**: Filtering by estado, proyectoId, and sorting by vencimiento/creation
- **Alertas Financieras**: Complex filtering by estado, prioridad, proyectoId with sorting
- **Clientes**: Sorting by nombre and creation date

## Deployment Commands

### Deploy All Indexes

To deploy all indexes defined in `firestore.indexes.json`:

```bash
firebase deploy --only firestore:indexes
```

### Deploy to Specific Project

If you have multiple Firebase projects:

```bash
firebase deploy --only firestore:indexes --project your-project-id
```

### View Current Indexes

To see currently deployed indexes:

```bash
firebase firestore:indexes
```

## Index Build Time

- Composite indexes can take several minutes to hours to build, depending on existing data
- You can monitor index build progress in the Firebase Console:
  - Go to Firestore Database → Indexes tab
  - Check the status column (Building/Enabled)

## Verification

After deployment, verify indexes are active:

1. Open Firebase Console
2. Navigate to Firestore Database → Indexes
3. Confirm all indexes show status "Enabled"

## Troubleshooting

### Index Already Exists Error

If you get an error that an index already exists:
- Check the Firebase Console to see if it's already deployed
- Remove duplicate entries from `firestore.indexes.json`

### Index Build Failed

If an index fails to build:
- Check the Firebase Console for error details
- Verify field paths match your Firestore document structure
- Ensure you have sufficient quota for index operations

## Manual Index Creation

If automatic deployment fails, you can create indexes manually:

1. Open Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Enter collection name and field configurations from `firestore.indexes.json`

## Index Usage

These indexes optimize the following queries:

- **Dashboard queries**: Fast aggregation of metrics across projects
- **Filtered lists**: Presupuestos and facturas with multiple filters
- **Alert panels**: Priority-based sorting with status filtering
- **Client searches**: Efficient name-based lookups

## Cost Considerations

- Composite indexes consume storage space
- Each index adds to read/write costs
- Monitor usage in Firebase Console → Usage tab
- Consider removing unused indexes to reduce costs

## Updates

When adding new queries that require indexes:

1. Update `firestore.indexes.json` with new index definitions
2. Run deployment command
3. Wait for indexes to build
4. Test queries to ensure they use the new indexes
5. Update this README with the new index purpose

## Support

For issues with index deployment:
- Check Firebase CLI version: `firebase --version`
- Review Firebase documentation: https://firebase.google.com/docs/firestore/query-data/indexing
- Check Firebase Status: https://status.firebase.google.com/
