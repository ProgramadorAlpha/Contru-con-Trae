-- ============================================================================
-- Migration: Documents ↔ Projects Integration
-- Date: 2025-01-18
-- Description: Add mandatory project relationship to documents table and
--              enhance with AI metadata fields for intelligent document processing
-- Requirements: 1, 5, 8, 9
-- ============================================================================

-- ============================================================================
-- PART 1: ALTER EXISTING TABLES
-- ============================================================================

-- Add new columns to documentos table
ALTER TABLE documentos
  -- Mandatory project relationship
  ADD COLUMN proyecto_id UUID,
  
  -- AI Processing metadata
  ADD COLUMN procesado_ia BOOLEAN DEFAULT FALSE,
  ADD COLUMN metadatos_ia JSONB,
  ADD COLUMN confianza_ia INTEGER CHECK (confianza_ia >= 0 AND confianza_ia <= 100),
  
  -- Invoice-specific fields
  ADD COLUMN es_factura BOOLEAN DEFAULT FALSE,
  ADD COLUMN monto_factura DECIMAL(15,2),
  ADD COLUMN fecha_factura DATE,
  ADD COLUMN proveedor VARCHAR(255),
  ADD COLUMN folio VARCHAR(100),
  ADD COLUMN rfc VARCHAR(20),
  
  -- Version control
  ADD COLUMN version INTEGER DEFAULT 1,
  ADD COLUMN documento_padre_id UUID,
  
  -- Collaboration
  ADD COLUMN compartido_con UUID[],
  ADD COLUMN anotaciones JSONB,
  
  -- Audit fields (if not already present)
  ADD COLUMN IF NOT EXISTS creado_por UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add comment to table
COMMENT ON TABLE documentos IS 'Documents table with mandatory project relationship and AI processing capabilities';

-- Add comments to new columns
COMMENT ON COLUMN documentos.proyecto_id IS 'Mandatory reference to parent project';
COMMENT ON COLUMN documentos.procesado_ia IS 'Indicates if document was processed by AI';
COMMENT ON COLUMN documentos.metadatos_ia IS 'JSON metadata extracted by AI (amounts, dates, items, etc.)';
COMMENT ON COLUMN documentos.confianza_ia IS 'AI confidence level (0-100)';
COMMENT ON COLUMN documentos.es_factura IS 'Indicates if document is an invoice/receipt';
COMMENT ON COLUMN documentos.monto_factura IS 'Invoice total amount';
COMMENT ON COLUMN documentos.fecha_factura IS 'Invoice date';
COMMENT ON COLUMN documentos.proveedor IS 'Supplier/vendor name';
COMMENT ON COLUMN documentos.folio IS 'Invoice folio/number';
COMMENT ON COLUMN documentos.rfc IS 'Tax ID (RFC) of issuer';
COMMENT ON COLUMN documentos.version IS 'Document version number';
COMMENT ON COLUMN documentos.documento_padre_id IS 'Reference to parent document for versioning';
COMMENT ON COLUMN documentos.compartido_con IS 'Array of user IDs with whom document is shared';
COMMENT ON COLUMN documentos.anotaciones IS 'JSON annotations and comments on document';

-- Add documento_id column to gastos table for bidirectional relationship
ALTER TABLE gastos
  ADD COLUMN IF NOT EXISTS documento_id UUID;

COMMENT ON COLUMN gastos.documento_id IS 'Reference to associated document (invoice/receipt)';

-- ============================================================================
-- PART 2: CREATE PROJECTS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE,
  cliente VARCHAR(255),
  direccion TEXT,
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  presupuesto_total DECIMAL(15,2),
  estado VARCHAR(50) DEFAULT 'Activo',
  
  -- Document limits
  limite_documentos INTEGER DEFAULT 10000,
  limite_espacio_gb INTEGER DEFAULT 100,
  
  -- Audit fields
  creado_por UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE proyectos IS 'Construction projects with document management capabilities';
COMMENT ON COLUMN proyectos.limite_documentos IS 'Maximum number of documents allowed for this project';
COMMENT ON COLUMN proyectos.limite_espacio_gb IS 'Maximum storage space in GB for project documents';

-- ============================================================================
-- PART 3: CREATE USUARIOS TABLE (if not exists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255),
  rol VARCHAR(50) DEFAULT 'Usuario',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE usuarios IS 'System users for audit and permissions';

-- ============================================================================
-- ROLLBACK SCRIPT (Save separately as rollback.sql)
-- ============================================================================
-- To rollback this migration, execute:
--
-- -- Remove foreign keys first
-- ALTER TABLE documentos DROP CONSTRAINT IF EXISTS fk_documento_proyecto;
-- ALTER TABLE documentos DROP CONSTRAINT IF EXISTS fk_documento_padre;
-- ALTER TABLE documentos DROP CONSTRAINT IF EXISTS fk_documento_creador;
-- ALTER TABLE gastos DROP CONSTRAINT IF EXISTS fk_gasto_documento;
--
-- -- Remove indexes
-- DROP INDEX IF EXISTS idx_docs_proyecto;
-- DROP INDEX IF EXISTS idx_docs_tipo;
-- DROP INDEX IF EXISTS idx_docs_tipo_proyecto;
-- DROP INDEX IF EXISTS idx_docs_factura;
-- DROP INDEX IF EXISTS idx_docs_fecha_factura;
-- DROP INDEX IF EXISTS idx_docs_proveedor;
-- DROP INDEX IF EXISTS idx_gastos_documento;
--
-- -- Remove view
-- DROP VIEW IF EXISTS v_proyecto_documentos_stats;
--
-- -- Remove columns from documentos
-- ALTER TABLE documentos
--   DROP COLUMN IF EXISTS proyecto_id,
--   DROP COLUMN IF EXISTS procesado_ia,
--   DROP COLUMN IF EXISTS metadatos_ia,
--   DROP COLUMN IF EXISTS confianza_ia,
--   DROP COLUMN IF EXISTS es_factura,
--   DROP COLUMN IF EXISTS monto_factura,
--   DROP COLUMN IF EXISTS fecha_factura,
--   DROP COLUMN IF EXISTS proveedor,
--   DROP COLUMN IF EXISTS folio,
--   DROP COLUMN IF EXISTS rfc,
--   DROP COLUMN IF EXISTS version,
--   DROP COLUMN IF EXISTS documento_padre_id,
--   DROP COLUMN IF EXISTS compartido_con,
--   DROP COLUMN IF EXISTS anotaciones;
--
-- -- Remove column from gastos
-- ALTER TABLE gastos DROP COLUMN IF EXISTS documento_id;
-- ============================================================================

-- ============================================================================
-- PART 4: FOREIGN KEYS AND CONSTRAINTS
-- ============================================================================

-- Foreign key: documentos.proyecto_id → proyectos.id
ALTER TABLE documentos
  ADD CONSTRAINT fk_documento_proyecto
  FOREIGN KEY (proyecto_id)
  REFERENCES proyectos(id)
  ON DELETE CASCADE;

-- Foreign key: documentos.documento_padre_id → documentos.id (for versioning)
ALTER TABLE documentos
  ADD CONSTRAINT fk_documento_padre
  FOREIGN KEY (documento_padre_id)
  REFERENCES documentos(id)
  ON DELETE SET NULL;

-- Foreign key: documentos.creado_por → usuarios.id
ALTER TABLE documentos
  ADD CONSTRAINT fk_documento_creador
  FOREIGN KEY (creado_por)
  REFERENCES usuarios(id)
  ON DELETE SET NULL;

-- Foreign key: gastos.documento_id → documentos.id
ALTER TABLE gastos
  ADD CONSTRAINT fk_gasto_documento
  FOREIGN KEY (documento_id)
  REFERENCES documentos(id)
  ON DELETE SET NULL;

-- Foreign key: gastos.proyecto_id → proyectos.id (if not already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_gasto_proyecto'
  ) THEN
    ALTER TABLE gastos
      ADD CONSTRAINT fk_gasto_proyecto
      FOREIGN KEY (proyecto_id)
      REFERENCES proyectos(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Add NOT NULL constraint to proyecto_id after data migration
-- NOTE: This will be executed in a separate migration after data is migrated
-- ALTER TABLE documentos ALTER COLUMN proyecto_id SET NOT NULL;

COMMENT ON CONSTRAINT fk_documento_proyecto ON documentos IS 'Ensures every document belongs to a valid project';
COMMENT ON CONSTRAINT fk_gasto_documento ON gastos IS 'Links expenses to their supporting documents';

-- ============================================================================
-- PART 5: PERFORMANCE INDEXES
-- ============================================================================

-- Index on proyecto_id for fast filtering by project
CREATE INDEX IF NOT EXISTS idx_docs_proyecto 
  ON documentos(proyecto_id);

-- Index on tipo for filtering by document type
CREATE INDEX IF NOT EXISTS idx_docs_tipo 
  ON documentos(tipo);

-- Composite index for filtering by project and type (for folder views)
CREATE INDEX IF NOT EXISTS idx_docs_tipo_proyecto 
  ON documentos(proyecto_id, tipo);

-- Partial index for invoices only
CREATE INDEX IF NOT EXISTS idx_docs_factura 
  ON documentos(es_factura) 
  WHERE es_factura = TRUE;

-- Index on invoice date for date-based queries
CREATE INDEX IF NOT EXISTS idx_docs_fecha_factura 
  ON documentos(fecha_factura) 
  WHERE fecha_factura IS NOT NULL;

-- Index on supplier for filtering invoices by vendor
CREATE INDEX IF NOT EXISTS idx_docs_proveedor 
  ON documentos(proveedor) 
  WHERE proveedor IS NOT NULL;

-- Index on gastos.documento_id for bidirectional navigation
CREATE INDEX IF NOT EXISTS idx_gastos_documento 
  ON gastos(documento_id);

-- Index on gastos.proyecto_id (if not already exists)
CREATE INDEX IF NOT EXISTS idx_gastos_proyecto 
  ON gastos(proyecto_id);

-- Index on gastos.fecha for date-based queries
CREATE INDEX IF NOT EXISTS idx_gastos_fecha 
  ON gastos(fecha);

-- GIN index on metadatos_ia for JSON queries (optional, for advanced search)
CREATE INDEX IF NOT EXISTS idx_docs_metadatos_ia 
  ON documentos USING GIN (metadatos_ia);

-- Index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS idx_docs_created_at 
  ON documentos(created_at DESC);

-- Index on procesado_ia for filtering AI-processed documents
CREATE INDEX IF NOT EXISTS idx_docs_procesado_ia 
  ON documentos(procesado_ia) 
  WHERE procesado_ia = TRUE;

COMMENT ON INDEX idx_docs_proyecto IS 'Fast lookup of documents by project';
COMMENT ON INDEX idx_docs_tipo_proyecto IS 'Optimizes folder view queries (project + document type)';
COMMENT ON INDEX idx_docs_factura IS 'Partial index for invoice-only queries';
COMMENT ON INDEX idx_gastos_documento IS 'Enables fast document-to-expense navigation';

-- ============================================================================
-- PART 6: STATISTICS VIEW
-- ============================================================================

-- Create view for project document statistics
CREATE OR REPLACE VIEW v_proyecto_documentos_stats AS
SELECT 
  p.id as proyecto_id,
  p.nombre as proyecto_nombre,
  p.codigo as proyecto_codigo,
  p.estado as proyecto_estado,
  
  -- Document counts
  COUNT(d.id) as total_documentos,
  COUNT(DISTINCT d.tipo) as total_carpetas,
  COUNT(CASE WHEN d.es_factura THEN 1 END) as total_facturas,
  COUNT(CASE WHEN d.procesado_ia THEN 1 END) as documentos_procesados_ia,
  COUNT(CASE WHEN array_length(d.compartido_con, 1) > 0 THEN 1 END) as documentos_compartidos,
  
  -- Storage statistics
  SUM(d.archivo_size) as espacio_usado_bytes,
  ROUND(SUM(d.archivo_size)::numeric / 1073741824, 2) as espacio_usado_gb,
  p.limite_espacio_gb,
  ROUND((SUM(d.archivo_size)::numeric / 1073741824 / p.limite_espacio_gb * 100), 2) as porcentaje_espacio_usado,
  
  -- Financial statistics (from invoices)
  SUM(CASE WHEN d.es_factura THEN d.monto_factura ELSE 0 END) as total_monto_facturas,
  
  -- Document type breakdown
  COUNT(CASE WHEN d.tipo = 'Contrato' THEN 1 END) as docs_contratos,
  COUNT(CASE WHEN d.tipo = 'Plano' THEN 1 END) as docs_planos,
  COUNT(CASE WHEN d.tipo = 'Factura' THEN 1 END) as docs_facturas,
  COUNT(CASE WHEN d.tipo = 'Permiso' THEN 1 END) as docs_permisos,
  COUNT(CASE WHEN d.tipo = 'Reporte' THEN 1 END) as docs_reportes,
  COUNT(CASE WHEN d.tipo = 'Certificado' THEN 1 END) as docs_certificados,
  COUNT(CASE WHEN d.tipo = 'Otro' THEN 1 END) as docs_otros,
  
  -- Related expenses count
  COUNT(DISTINCT g.id) as total_gastos_vinculados,
  
  -- Timestamps
  MAX(d.created_at) as ultimo_documento_fecha,
  MIN(d.created_at) as primer_documento_fecha
  
FROM proyectos p
LEFT JOIN documentos d ON d.proyecto_id = p.id
LEFT JOIN gastos g ON g.documento_id = d.id
GROUP BY p.id, p.nombre, p.codigo, p.estado, p.limite_espacio_gb;

COMMENT ON VIEW v_proyecto_documentos_stats IS 'Aggregated statistics of documents per project for dashboard widgets';

-- Create materialized view for better performance (optional, for large datasets)
-- Refresh this view periodically or after bulk operations
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_proyecto_documentos_stats AS
SELECT * FROM v_proyecto_documentos_stats;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_proyecto_stats_id 
  ON mv_proyecto_documentos_stats(proyecto_id);

COMMENT ON MATERIALIZED VIEW mv_proyecto_documentos_stats IS 'Cached version of project document statistics for performance';

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_proyecto_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_proyecto_documentos_stats;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_proyecto_stats() IS 'Refreshes the materialized view of project statistics';
