# Database Migrations - Documents ↔ Projects Integration

This directory contains database migration scripts for integrating the Documents and Projects modules in ConstructPro.

## Overview

The migration adds mandatory project relationships to documents, AI processing capabilities, and enhanced metadata fields for intelligent document management.

## Migration Files

### 1. Schema Migration
**File:** `20250118_add_proyecto_documents_integration.sql`

This SQL script modifies the database schema to:
- Add `proyecto_id` column to `documentos` table (mandatory relationship)
- Add AI processing fields (`procesado_ia`, `metadatos_ia`, `confianza_ia`)
- Add invoice-specific fields (`es_factura`, `monto_factura`, `fecha_factura`, etc.)
- Add version control and collaboration fields
- Create foreign key constraints
- Create performance indexes
- Create statistics views

**Requirements:** PostgreSQL 12+

### 2. Rollback Script
**File:** `20250118_rollback.sql`

Reverts all changes made by the schema migration. Use this if you need to undo the migration.

**⚠️ WARNING:** This will remove all data added by the migration!

### 3. Data Migration Script
**File:** `../scripts/migrate_existing_documents.js`

Node.js script that migrates existing documents to ensure all have valid project assignments. Documents without projects are assigned to a "General" project.

**Requirements:** Node.js 16+

### 4. Testing Guide
**File:** `MIGRATION_TESTING_GUIDE.md`

Comprehensive guide for testing the migration in a development environment before applying to production.

## Quick Start

### Prerequisites

```bash
# Ensure you have PostgreSQL installed
psql --version

# Ensure you have Node.js installed
node --version
```

### Step 1: Backup Your Database

```bash
# Create a backup before any migration
pg_dump -U postgres your_database > backup_before_migration.sql
```

### Step 2: Run Schema Migration

```bash
# Execute the schema migration
psql -U postgres -d your_database -f migrations/20250118_add_proyecto_documents_integration.sql
```

**Expected output:** No errors, all statements succeed

### Step 3: Run Data Migration

```bash
# Execute the data migration script
node scripts/migrate_existing_documents.js
```

**Expected output:** 
- General project created (if needed)
- Orphan documents migrated
- Migration report generated

### Step 4: Verify Migration

```sql
-- Check that all documents have projects
SELECT COUNT(*) FROM documentos WHERE proyecto_id IS NULL;
-- Should return 0

-- View project statistics
SELECT * FROM v_proyecto_documentos_stats;
```

### Step 5: Apply NOT NULL Constraint

After verifying all documents have valid projects:

```sql
-- Make proyecto_id mandatory
ALTER TABLE documentos ALTER COLUMN proyecto_id SET NOT NULL;
```

## Migration Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. BACKUP DATABASE                                          │
│    pg_dump > backup.sql                                     │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. RUN SCHEMA MIGRATION                                     │
│    psql -f 20250118_add_proyecto_documents_integration.sql │
│    • Adds columns                                           │
│    • Creates foreign keys                                   │
│    • Creates indexes                                        │
│    • Creates views                                          │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. RUN DATA MIGRATION                                       │
│    node migrate_existing_documents.js                       │
│    • Creates General project                                │
│    • Assigns orphan documents                               │
│    • Generates report                                       │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VERIFY MIGRATION                                         │
│    • Check for orphan documents                             │
│    • Review migration report                                │
│    • Test queries                                           │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. APPLY NOT NULL CONSTRAINT                                │
│    ALTER TABLE documentos                                   │
│    ALTER COLUMN proyecto_id SET NOT NULL;                   │
└────────────────────┬────────────────────────────────────────┘
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UPDATE APPLICATION                                       │
│    • Deploy new frontend code                               │
│    • Deploy new backend code                                │
│    • Test end-to-end                                        │
└─────────────────────────────────────────────────────────────┘
```

## Rollback Procedure

If you need to undo the migration:

```bash
# 1. Backup current state
pg_dump -U postgres your_database > backup_before_rollback.sql

# 2. Run rollback script
psql -U postgres -d your_database -f migrations/20250118_rollback.sql

# 3. Verify rollback
psql -U postgres -d your_database -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'documentos' AND column_name = 'proyecto_id';"
# Should return 0 rows
```

## Testing

Before applying to production, test in a development environment:

1. Create test database
2. Load production-like data
3. Run migration
4. Verify results
5. Test rollback
6. Re-run migration (test idempotency)

See `MIGRATION_TESTING_GUIDE.md` for detailed testing procedures.

## Verification Queries

### Check Migration Status

```sql
-- 1. Check if migration columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos'
  AND column_name IN ('proyecto_id', 'procesado_ia', 'metadatos_ia', 'es_factura');

-- 2. Check foreign keys
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name IN ('documentos', 'gastos');

-- 3. Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('documentos', 'gastos')
  AND indexname LIKE 'idx_%';

-- 4. Check views
SELECT table_name
FROM information_schema.views
WHERE table_name LIKE '%proyecto_documentos%';
```

### Check Data Integrity

```sql
-- 1. Find orphan documents (should be 0 after migration)
SELECT COUNT(*) as orphan_count
FROM documentos
WHERE proyecto_id IS NULL;

-- 2. Find documents with invalid projects
SELECT COUNT(*) as invalid_count
FROM documentos d
LEFT JOIN proyectos p ON d.proyecto_id = p.id
WHERE d.proyecto_id IS NOT NULL AND p.id IS NULL;

-- 3. View project document distribution
SELECT 
  p.nombre,
  p.codigo,
  COUNT(d.id) as doc_count,
  SUM(d.archivo_size) as total_size
FROM proyectos p
LEFT JOIN documentos d ON d.proyecto_id = p.id
GROUP BY p.id, p.nombre, p.codigo
ORDER BY doc_count DESC;

-- 4. Check General project
SELECT 
  p.nombre,
  COUNT(d.id) as doc_count
FROM proyectos p
LEFT JOIN documentos d ON d.proyecto_id = p.id
WHERE p.codigo = 'GENERAL'
GROUP BY p.nombre;
```

## Performance Considerations

### Index Usage

The migration creates several indexes for optimal query performance:

- `idx_docs_proyecto`: Fast filtering by project
- `idx_docs_tipo_proyecto`: Optimizes folder view queries
- `idx_docs_factura`: Partial index for invoice queries
- `idx_gastos_documento`: Fast document-to-expense navigation

### View Performance

For large datasets (>10,000 documents), use the materialized view:

```sql
-- Refresh materialized view
SELECT refresh_proyecto_stats();

-- Query materialized view (faster)
SELECT * FROM mv_proyecto_documentos_stats;
```

Schedule periodic refreshes:

```sql
-- Create a cron job or scheduled task to refresh every hour
SELECT refresh_proyecto_stats();
```

## Troubleshooting

### Error: relation "proyectos" does not exist

**Cause:** The proyectos table doesn't exist in your database.

**Solution:** Create the proyectos table first or ensure it exists in your base schema.

### Error: column "proyecto_id" already exists

**Cause:** The migration has already been run.

**Solution:** 
1. Check if migration was successful: `SELECT COUNT(*) FROM documentos WHERE proyecto_id IS NOT NULL;`
2. If needed, run rollback first: `psql -f migrations/20250118_rollback.sql`

### Error: permission denied

**Cause:** Database user lacks sufficient privileges.

**Solution:**
```sql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Slow queries after migration

**Cause:** Statistics not updated or indexes not being used.

**Solution:**
```sql
-- Update table statistics
ANALYZE documentos;
ANALYZE gastos;
ANALYZE proyectos;

-- Check if indexes are being used
EXPLAIN ANALYZE SELECT * FROM documentos WHERE proyecto_id = 'some-id';
```

## Post-Migration Tasks

### 1. Review Migrated Documents

If documents were assigned to the General project:

1. Open Documents module
2. Filter by project: "General"
3. Review each document
4. Reassign to appropriate projects

### 2. Update Application Code

Ensure your application code:
- Requires project selection when uploading documents
- Validates proyecto_id before saving
- Handles the new AI metadata fields
- Uses the new statistics views

### 3. Monitor Performance

After migration, monitor:
- Query performance on documents table
- View refresh times
- Storage usage per project
- Index usage statistics

### 4. User Training

Train users on:
- New project selector in Documents module
- Folder organization by project
- AI-powered receipt scanning
- Document-to-expense navigation

## Support

### Documentation

- **Requirements:** `.kiro/specs/documents-projects-integration/requirements.md`
- **Design:** `.kiro/specs/documents-projects-integration/design.md`
- **Tasks:** `.kiro/specs/documents-projects-integration/tasks.md`
- **Testing Guide:** `migrations/MIGRATION_TESTING_GUIDE.md`

### Migration Reports

After running migrations, check these reports:

- **Data Migration Report:** `.kiro/specs/documents-projects-integration/DATA_MIGRATION_REPORT.md`
- **Migration Data:** `.kiro/specs/documents-projects-integration/migration/`

### Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the testing guide
3. Check migration reports for errors
4. Verify database permissions
5. Check PostgreSQL logs

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-01-18 | Initial migration for Documents ↔ Projects integration |

## License

Internal use only - ConstructPro

---

**Last Updated:** 2025-01-18  
**Maintained By:** Backend Development Team
