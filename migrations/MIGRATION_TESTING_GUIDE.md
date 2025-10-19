# Migration Testing Guide
## Documents ↔ Projects Integration

This guide provides step-by-step instructions for testing the database migration in a development environment.

## Prerequisites

- PostgreSQL 12+ installed
- Access to a development database
- `psql` command-line tool or database GUI (pgAdmin, DBeaver, etc.)
- Backup of production data (if testing with production-like data)

## Testing Environment Setup

### 1. Create Test Database

```bash
# Create a new test database
createdb constructpro_test

# Or using psql
psql -U postgres -c "CREATE DATABASE constructpro_test;"
```

### 2. Load Base Schema

If you have an existing schema, load it first:

```bash
psql -U postgres -d constructpro_test -f schema/base_schema.sql
```

Or create minimal tables for testing:

```sql
-- Create minimal tables for testing
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL,
  archivo_url TEXT NOT NULL,
  archivo_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria VARCHAR(100) NOT NULL,
  concepto TEXT NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  fecha DATE NOT NULL,
  proveedor VARCHAR(255)
);
```

## Migration Testing Steps

### Step 1: Backup Test Database

```bash
# Create backup before migration
pg_dump -U postgres constructpro_test > backup_before_migration.sql
```

### Step 2: Run Migration

```bash
# Execute migration script
psql -U postgres -d constructpro_test -f migrations/20250118_add_proyecto_documents_integration.sql
```

**Expected Output:**
- No errors
- All ALTER TABLE statements succeed
- All CREATE INDEX statements succeed
- View created successfully

### Step 3: Verify Schema Changes

Run these verification queries:

```sql
-- 1. Verify new columns in documentos table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos'
  AND column_name IN (
    'proyecto_id', 'procesado_ia', 'metadatos_ia', 'confianza_ia',
    'es_factura', 'monto_factura', 'fecha_factura', 'proveedor',
    'folio', 'rfc', 'version', 'documento_padre_id',
    'compartido_con', 'anotaciones'
  )
ORDER BY column_name;
```

**Expected Result:** 14 rows showing all new columns

```sql
-- 2. Verify new column in gastos table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gastos'
  AND column_name = 'documento_id';
```

**Expected Result:** 1 row

```sql
-- 3. Verify foreign keys
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('documentos', 'gastos')
ORDER BY tc.table_name, tc.constraint_name;
```

**Expected Result:** At least 4 foreign keys:
- `fk_documento_proyecto` (documentos → proyectos)
- `fk_documento_padre` (documentos → documentos)
- `fk_documento_creador` (documentos → usuarios)
- `fk_gasto_documento` (gastos → documentos)

```sql
-- 4. Verify indexes
SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename IN ('documentos', 'gastos')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Expected Result:** At least 12 indexes created

```sql
-- 5. Verify view exists
SELECT table_name, view_definition
FROM information_schema.views
WHERE table_name = 'v_proyecto_documentos_stats';
```

**Expected Result:** 1 row with view definition

```sql
-- 6. Verify materialized view exists
SELECT matviewname
FROM pg_matviews
WHERE matviewname = 'mv_proyecto_documentos_stats';
```

**Expected Result:** 1 row

### Step 4: Test Data Insertion

```sql
-- Insert test project
INSERT INTO proyectos (id, nombre, codigo, cliente, estado)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Project',
  'TEST-001',
  'Test Client',
  'Activo'
);

-- Insert test user
INSERT INTO usuarios (id, email, nombre, rol)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'test@example.com',
  'Test User',
  'Admin'
);

-- Insert test document with project
INSERT INTO documentos (
  id,
  proyecto_id,
  nombre,
  tipo,
  archivo_url,
  archivo_size,
  mime_type,
  es_factura,
  monto_factura,
  fecha_factura,
  proveedor,
  procesado_ia,
  creado_por
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Test Invoice.pdf',
  'Factura',
  '/storage/test-invoice.pdf',
  1024000,
  'application/pdf',
  TRUE,
  1500.00,
  '2025-01-15',
  'Test Supplier',
  TRUE,
  '00000000-0000-0000-0000-000000000002'
);

-- Insert test expense linked to document
INSERT INTO gastos (
  id,
  proyecto_id,
  documento_id,
  categoria,
  concepto,
  monto,
  fecha,
  proveedor
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'Materiales',
  'Test expense',
  1500.00,
  '2025-01-15',
  'Test Supplier'
);
```

**Expected Result:** All inserts succeed without errors

### Step 5: Test View Queries

```sql
-- Query the statistics view
SELECT * FROM v_proyecto_documentos_stats
WHERE proyecto_id = '00000000-0000-0000-0000-000000000001';
```

**Expected Result:** 1 row with:
- `total_documentos` = 1
- `total_facturas` = 1
- `documentos_procesados_ia` = 1
- `total_gastos_vinculados` = 1
- `total_monto_facturas` = 1500.00

```sql
-- Refresh materialized view
SELECT refresh_proyecto_stats();

-- Query materialized view
SELECT * FROM mv_proyecto_documentos_stats
WHERE proyecto_id = '00000000-0000-0000-0000-000000000001';
```

**Expected Result:** Same as above

### Step 6: Test Constraints

```sql
-- Test 1: Try to insert document without project (should fail after NOT NULL is applied)
-- Note: This will succeed initially, but will fail after data migration
INSERT INTO documentos (nombre, tipo, archivo_url, archivo_size, mime_type)
VALUES ('Test', 'Otro', '/test.pdf', 1000, 'application/pdf');
-- Expected: Success (proyecto_id is nullable during migration)

-- Test 2: Try to insert document with invalid project (should fail)
INSERT INTO documentos (
  proyecto_id, nombre, tipo, archivo_url, archivo_size, mime_type
)
VALUES (
  '99999999-9999-9999-9999-999999999999',
  'Test',
  'Otro',
  '/test.pdf',
  1000,
  'application/pdf'
);
-- Expected: ERROR - foreign key violation

-- Test 3: Try to insert expense with invalid document (should fail)
INSERT INTO gastos (
  proyecto_id,
  documento_id,
  categoria,
  concepto,
  monto,
  fecha
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '99999999-9999-9999-9999-999999999999',
  'Test',
  'Test',
  100,
  '2025-01-15'
);
-- Expected: ERROR - foreign key violation

-- Test 4: Verify cascade delete
DELETE FROM proyectos WHERE id = '00000000-0000-0000-0000-000000000001';
-- Expected: Success, and documents should be deleted too

SELECT COUNT(*) FROM documentos 
WHERE proyecto_id = '00000000-0000-0000-0000-000000000001';
-- Expected: 0 rows
```

### Step 7: Test Rollback

```bash
# Run rollback script
psql -U postgres -d constructpro_test -f migrations/20250118_rollback.sql
```

**Expected Output:**
- All DROP statements succeed
- All ALTER TABLE statements succeed
- No errors

Verify rollback:

```sql
-- Verify columns were removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'documentos' 
  AND column_name IN ('proyecto_id', 'procesado_ia', 'metadatos_ia');
-- Expected: 0 rows

-- Verify views were dropped
SELECT table_name 
FROM information_schema.views 
WHERE table_name = 'v_proyecto_documentos_stats';
-- Expected: 0 rows
```

### Step 8: Re-run Migration

After successful rollback, re-run the migration to ensure it's idempotent:

```bash
psql -U postgres -d constructpro_test -f migrations/20250118_add_proyecto_documents_integration.sql
```

**Expected Result:** Migration runs successfully again

## Performance Testing

### Test Index Performance

```sql
-- Create test data
INSERT INTO proyectos (nombre, codigo, estado)
SELECT 
  'Project ' || i,
  'PROJ-' || LPAD(i::text, 5, '0'),
  CASE WHEN i % 3 = 0 THEN 'Completado' ELSE 'Activo' END
FROM generate_series(1, 100) i;

INSERT INTO documentos (
  proyecto_id,
  nombre,
  tipo,
  archivo_url,
  archivo_size,
  mime_type,
  es_factura
)
SELECT 
  p.id,
  'Document ' || i,
  CASE (i % 7)
    WHEN 0 THEN 'Contrato'
    WHEN 1 THEN 'Plano'
    WHEN 2 THEN 'Factura'
    WHEN 3 THEN 'Permiso'
    WHEN 4 THEN 'Reporte'
    WHEN 5 THEN 'Certificado'
    ELSE 'Otro'
  END,
  '/storage/doc-' || i || '.pdf',
  1000000 + (i * 1000),
  'application/pdf',
  (i % 7 = 2)
FROM generate_series(1, 10000) i
CROSS JOIN LATERAL (
  SELECT id FROM proyectos ORDER BY random() LIMIT 1
) p;

-- Test query performance with EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM documentos 
WHERE proyecto_id = (SELECT id FROM proyectos LIMIT 1)
  AND tipo = 'Factura';
-- Expected: Index scan on idx_docs_tipo_proyecto

EXPLAIN ANALYZE
SELECT * FROM v_proyecto_documentos_stats;
-- Expected: Completes in < 1 second for 100 projects with 10k documents
```

## Cleanup

```bash
# Drop test database
dropdb constructpro_test

# Or keep it for future testing
```

## Checklist

- [ ] Migration runs without errors
- [ ] All columns added successfully
- [ ] All foreign keys created
- [ ] All indexes created
- [ ] Views created and queryable
- [ ] Test data inserts successfully
- [ ] Constraints work as expected
- [ ] Rollback works correctly
- [ ] Re-migration works (idempotent)
- [ ] Performance is acceptable
- [ ] Documentation is clear

## Troubleshooting

### Error: relation "proyectos" does not exist

**Solution:** Create the proyectos table first or ensure it exists in your base schema.

### Error: column "proyecto_id" already exists

**Solution:** The migration has already been run. Use rollback script first.

### Error: permission denied

**Solution:** Ensure your database user has sufficient privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE constructpro_test TO your_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO your_user;
```

### Slow view queries

**Solution:** Use the materialized view instead:

```sql
SELECT refresh_proyecto_stats();
SELECT * FROM mv_proyecto_documentos_stats;
```

## Next Steps

After successful testing:

1. Review migration with team
2. Schedule production migration window
3. Create production backup
4. Run migration in production
5. Verify production data
6. Run data migration script (Task 2)

## References

- Requirements: `.kiro/specs/documents-projects-integration/requirements.md`
- Design: `.kiro/specs/documents-projects-integration/design.md`
- Tasks: `.kiro/specs/documents-projects-integration/tasks.md`
