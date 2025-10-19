-- ============================================================================
-- ROLLBACK SCRIPT: Documents ↔ Projects Integration
-- Date: 2025-01-18
-- Description: Rollback migration 20250118_add_proyecto_documents_integration.sql
-- ============================================================================

-- WARNING: This will remove all data added by the migration!
-- Make sure to backup your database before running this script.

BEGIN;

-- Step 1: Drop materialized view and function
DROP FUNCTION IF EXISTS refresh_proyecto_stats();
DROP MATERIALIZED VIEW IF EXISTS mv_proyecto_documentos_stats;
DROP VIEW IF EXISTS v_proyecto_documentos_stats;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS idx_docs_procesado_ia;
DROP INDEX IF EXISTS idx_docs_created_at;
DROP INDEX IF EXISTS idx_docs_metadatos_ia;
DROP INDEX IF EXISTS idx_gastos_fecha;
DROP INDEX IF EXISTS idx_gastos_proyecto;
DROP INDEX IF EXISTS idx_gastos_documento;
DROP INDEX IF EXISTS idx_docs_proveedor;
DROP INDEX IF EXISTS idx_docs_fecha_factura;
DROP INDEX IF EXISTS idx_docs_factura;
DROP INDEX IF EXISTS idx_docs_tipo_proyecto;
DROP INDEX IF EXISTS idx_docs_tipo;
DROP INDEX IF EXISTS idx_docs_proyecto;

-- Step 3: Drop foreign key constraints
ALTER TABLE gastos DROP CONSTRAINT IF EXISTS fk_gasto_proyecto;
ALTER TABLE gastos DROP CONSTRAINT IF EXISTS fk_gasto_documento;
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS fk_documento_creador;
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS fk_documento_padre;
ALTER TABLE documentos DROP CONSTRAINT IF EXISTS fk_documento_proyecto;

-- Step 4: Remove columns from gastos table
ALTER TABLE gastos DROP COLUMN IF EXISTS documento_id;

-- Step 5: Remove columns from documentos table
ALTER TABLE documentos
  DROP COLUMN IF EXISTS anotaciones,
  DROP COLUMN IF EXISTS compartido_con,
  DROP COLUMN IF EXISTS documento_padre_id,
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS rfc,
  DROP COLUMN IF EXISTS folio,
  DROP COLUMN IF EXISTS proveedor,
  DROP COLUMN IF EXISTS fecha_factura,
  DROP COLUMN IF EXISTS monto_factura,
  DROP COLUMN IF EXISTS es_factura,
  DROP COLUMN IF EXISTS confianza_ia,
  DROP COLUMN IF EXISTS metadatos_ia,
  DROP COLUMN IF EXISTS procesado_ia,
  DROP COLUMN IF EXISTS proyecto_id;

-- Step 6: Optionally drop tables if they were created by this migration
-- Uncomment the following lines if you want to remove the tables entirely
-- WARNING: This will delete all project and user data!

-- DROP TABLE IF EXISTS proyectos CASCADE;
-- DROP TABLE IF EXISTS usuarios CASCADE;

COMMIT;

-- Verification queries
-- Run these after rollback to verify the changes were reverted:

-- Check that columns were removed from documentos
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'documentos' 
  AND column_name IN ('proyecto_id', 'procesado_ia', 'metadatos_ia', 'es_factura');
-- Should return 0 rows

-- Check that columns were removed from gastos
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'gastos' 
  AND column_name = 'documento_id';
-- Should return 0 rows

-- Check that views were dropped
SELECT table_name 
FROM information_schema.views 
WHERE table_name IN ('v_proyecto_documentos_stats', 'mv_proyecto_documentos_stats');
-- Should return 0 rows

-- Check that indexes were dropped
SELECT indexname 
FROM pg_indexes 
WHERE indexname LIKE 'idx_docs_%' OR indexname LIKE 'idx_gastos_%';
-- Should return only indexes that existed before the migration
