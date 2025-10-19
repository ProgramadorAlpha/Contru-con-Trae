# Quick Start Guide - Database Migration

## For the Impatient Developer 🚀

### Prerequisites
- PostgreSQL 12+
- Node.js 16+
- Database backup

### 3-Step Migration

#### Step 1: Schema (30 seconds)
```bash
psql -U postgres -d your_database -f migrations/20250118_add_proyecto_documents_integration.sql
```

#### Step 2: Data (1 minute)
```bash
npm run migrate:documents
```

#### Step 3: Verify (10 seconds)
```sql
SELECT COUNT(*) FROM documentos WHERE proyecto_id IS NULL;
-- Should return 0
```

### Done! ✅

---

## What Just Happened?

### Schema Migration Added:
- ✅ 14 new columns to `documentos`
- ✅ 1 new column to `gastos`
- ✅ 5 foreign keys
- ✅ 12 indexes
- ✅ 2 views

### Data Migration Did:
- ✅ Created "General" project
- ✅ Assigned orphan documents
- ✅ Generated report

---

## Verify Everything Works

```sql
-- Check new columns exist
\d documentos

-- Check statistics view
SELECT * FROM v_proyecto_documentos_stats;

-- Check General project
SELECT * FROM proyectos WHERE codigo = 'GENERAL';
```

---

## If Something Goes Wrong

### Rollback Everything
```bash
psql -U postgres -d your_database -f migrations/20250118_rollback.sql
```

### Check Logs
```bash
# Migration report location
cat .kiro/specs/documents-projects-integration/DATA_MIGRATION_REPORT.md
```

---

## Next Steps

1. Review migration report
2. Reassign documents from General project
3. Apply NOT NULL constraint:
   ```sql
   ALTER TABLE documentos ALTER COLUMN proyecto_id SET NOT NULL;
   ```

---

## Need More Details?

- **Full Guide:** `migrations/README.md`
- **Testing:** `migrations/MIGRATION_TESTING_GUIDE.md`
- **Summary:** `.kiro/specs/documents-projects-integration/MIGRATION_SUMMARY.md`

---

## Common Issues

### "relation proyectos does not exist"
**Fix:** Create proyectos table first (it's in the migration script)

### "permission denied"
**Fix:** 
```sql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

### "column already exists"
**Fix:** Migration already run. Check with:
```sql
\d documentos
```

---

**Time to complete:** ~2 minutes  
**Difficulty:** Easy  
**Risk:** Low (rollback available)
