/**
 * Migration Utilities Tests
 * 
 * Tests for data migration functions
 */

import { describe, it, expect } from 'vitest'
import {
  initializeCostCodeCatalog,
  migrateProject,
  migrateProjects,
  migrateExpense,
  migrateExpenses,
  performMigration,
  validateMigration,
  generateMigrationSummary
} from '../migration'
import type { Project } from '@/types/projects'
import type { Expense } from '@/types/expenses'

describe('Migration Utilities', () => {
  describe('initializeCostCodeCatalog', () => {
    it('should create cost code catalog with default codes', () => {
      const costCodes = initializeCostCodeCatalog()
      
      expect(costCodes).toBeDefined()
      expect(costCodes.length).toBeGreaterThan(0)
      expect(costCodes.every(cc => cc.id)).toBe(true)
      expect(costCodes.every(cc => cc.createdAt)).toBe(true)
      expect(costCodes.every(cc => cc.updatedAt)).toBe(true)
    })
    
    it('should have a default cost code', () => {
      const costCodes = initializeCostCodeCatalog()
      const defaultCode = costCodes.find(cc => cc.isDefault)
      
      expect(defaultCode).toBeDefined()
      expect(defaultCode?.name).toBe('Gastos Generales')
    })
    
    it('should have cost codes from all divisions', () => {
      const costCodes = initializeCostCodeCatalog()
      const divisions = new Set(costCodes.map(cc => cc.division))
      
      expect(divisions.size).toBeGreaterThan(5)
      expect(divisions.has('01 - Preliminares')).toBe(true)
      expect(divisions.has('03 - Estructura')).toBe(true)
      expect(divisions.has('07 - Acabados')).toBe(true)
    })
  })
  
  describe('migrateProject', () => {
    it('should add financial fields to project', () => {
      const oldProject: Partial<Project> = {
        id: 'PRJ-001',
        name: 'Test Project',
        code: 'TEST-001',
        description: 'Test',
        client: 'Test Client',
        location: 'Test Location',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        progress: 50,
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z'
      }
      
      const migrated = migrateProject(oldProject)
      
      expect(migrated.id).toBe('PRJ-001')
      expect(migrated.totalBudget).toBe(0)
      expect(migrated.committedCost).toBe(0)
      expect(migrated.actualCost).toBe(0)
      expect(migrated.marginPercentage).toBe(0)
      expect(migrated.budgetBreakdown).toBeDefined()
      expect(migrated.costCodeBudgets).toEqual([])
      expect(migrated.variance).toBe(0)
      expect(migrated.financialHealth).toBe('good')
    })
    
    it('should preserve existing financial fields', () => {
      const projectWithFinancials: Partial<Project> = {
        id: 'PRJ-002',
        name: 'Project with Financials',
        code: 'TEST-002',
        description: 'Test',
        client: 'Test Client',
        location: 'Test Location',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        status: 'active',
        progress: 50,
        totalBudget: 100000,
        committedCost: 50000,
        actualCost: 30000,
        marginPercentage: 20,
        createdBy: 'user1',
        createdAt: '2024-01-01T00:00:00Z'
      }
      
      const migrated = migrateProject(projectWithFinancials)
      
      expect(migrated.totalBudget).toBe(100000)
      expect(migrated.committedCost).toBe(50000)
      expect(migrated.actualCost).toBe(30000)
      expect(migrated.marginPercentage).toBe(20)
    })
  })
  
  describe('migrateProjects', () => {
    it('should migrate multiple projects', () => {
      const projects: Partial<Project>[] = [
        {
          id: 'PRJ-001',
          name: 'Project 1',
          code: 'TEST-001',
          description: 'Test',
          client: 'Client 1',
          location: 'Location 1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active',
          progress: 50,
          createdBy: 'user1',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'PRJ-002',
          name: 'Project 2',
          code: 'TEST-002',
          description: 'Test',
          client: 'Client 2',
          location: 'Location 2',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'planning',
          progress: 0,
          createdBy: 'user1',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
      
      const migrated = migrateProjects(projects)
      
      expect(migrated).toHaveLength(2)
      expect(migrated.every(p => p.totalBudget !== undefined)).toBe(true)
      expect(migrated.every(p => p.budgetBreakdown !== undefined)).toBe(true)
    })
  })
  
  describe('migrateExpense', () => {
    const costCodes = initializeCostCodeCatalog()
    const defaultCostCode = costCodes.find(cc => cc.isDefault)!
    const project: Project = {
      id: 'PRJ-001',
      name: 'Test Project',
      code: 'TEST-001',
      description: 'Test',
      client: 'Test Client',
      location: 'Test Location',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      progress: 50,
      totalBudget: 100000,
      committedCost: 0,
      actualCost: 0,
      marginPercentage: 0,
      budgetBreakdown: {
        labor: 0,
        materials: 0,
        equipment: 0,
        subcontracts: 0,
        other: 0
      },
      costCodeBudgets: [],
      variance: 0,
      variancePercentage: 0,
      projectedFinalCost: 0,
      remainingBudget: 100000,
      financialHealth: 'good',
      createdBy: 'user1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
    
    it('should add classification fields to unclassified expense', () => {
      const oldExpense: Partial<Expense> = {
        id: 'EXP-001',
        amount: 1000,
        description: 'Test expense',
        invoiceDate: '2024-01-15',
        submittedBy: 'user1',
        submittedAt: '2024-01-15T00:00:00Z'
      }
      
      const migrated = migrateExpense(oldExpense, project, defaultCostCode)
      
      expect(migrated.id).toBe('EXP-001')
      expect(migrated.projectId).toBe('PRJ-001')
      expect(migrated.projectName).toBe('Test Project')
      expect(migrated.costCodeId).toBe(defaultCostCode.id)
      expect(migrated.costCode).toEqual(defaultCostCode)
      expect(migrated.supplierId).toBe('NEEDS_CLASSIFICATION')
      expect(migrated.needsReview).toBe(true)
    })
    
    it('should preserve existing classification', () => {
      const classifiedExpense: Partial<Expense> = {
        id: 'EXP-002',
        projectId: 'PRJ-001',
        projectName: 'Test Project',
        costCodeId: 'CC-123',
        costCode: defaultCostCode,
        supplierId: 'SUP-001',
        supplierName: 'Test Supplier',
        amount: 2000,
        description: 'Classified expense',
        invoiceDate: '2024-01-15',
        submittedBy: 'user1',
        submittedAt: '2024-01-15T00:00:00Z'
      }
      
      const migrated = migrateExpense(classifiedExpense, project, defaultCostCode)
      
      expect(migrated.projectId).toBe('PRJ-001')
      expect(migrated.costCodeId).toBe('CC-123')
      expect(migrated.supplierId).toBe('SUP-001')
      expect(migrated.needsReview).toBe(false)
    })
  })
  
  describe('performMigration', () => {
    it('should perform complete migration', () => {
      const projects: Partial<Project>[] = [
        {
          id: 'PRJ-001',
          name: 'Project 1',
          code: 'TEST-001',
          description: 'Test',
          client: 'Client 1',
          location: 'Location 1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          status: 'active',
          progress: 50,
          createdBy: 'user1',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
      
      const expenses: Partial<Expense>[] = [
        {
          id: 'EXP-001',
          amount: 1000,
          description: 'Test expense',
          invoiceDate: '2024-01-15',
          submittedBy: 'user1',
          submittedAt: '2024-01-15T00:00:00Z'
        }
      ]
      
      const result = performMigration(projects, expenses)
      
      expect(result.success).toBe(true)
      expect(result.costCodes.length).toBeGreaterThan(0)
      expect(result.projects).toHaveLength(1)
      expect(result.expenses).toHaveLength(1)
      expect(result.stats.costCodesCreated).toBeGreaterThan(0)
      expect(result.stats.projectsMigrated).toBe(1)
      expect(result.stats.expensesMigrated).toBe(1)
      expect(result.stats.expensesNeedingReview).toBe(1)
    })
    
    it('should generate warnings for expenses needing review', () => {
      const expenses: Partial<Expense>[] = [
        {
          id: 'EXP-001',
          amount: 1000,
          description: 'Unclassified expense',
          invoiceDate: '2024-01-15',
          submittedBy: 'user1',
          submittedAt: '2024-01-15T00:00:00Z'
        }
      ]
      
      const result = performMigration([], expenses)
      
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some(w => w.includes('need manual classification'))).toBe(true)
    })
  })
  
  describe('validateMigration', () => {
    it('should validate successful migration', () => {
      const result = performMigration([], [])
      const validation = validateMigration(result)
      
      expect(validation.isValid).toBe(true)
      expect(validation.issues).toHaveLength(0)
    })
    
    it('should detect missing default cost code', () => {
      const result = performMigration([], [])
      // Remove default flag from all cost codes
      result.costCodes.forEach(cc => cc.isDefault = false)
      
      const validation = validateMigration(result)
      
      expect(validation.isValid).toBe(false)
      expect(validation.issues.some(i => i.includes('default cost code'))).toBe(true)
    })
  })
  
  describe('generateMigrationSummary', () => {
    it('should generate summary for successful migration', () => {
      const result = performMigration([], [])
      const summary = generateMigrationSummary(result)
      
      expect(summary).toContain('Migration Summary')
      expect(summary).toContain('Statistics')
      expect(summary).toContain('Cost Codes Created')
      expect(summary).toContain('✅ Migration completed successfully')
    })
    
    it('should include warnings in summary', () => {
      const expenses: Partial<Expense>[] = [
        {
          id: 'EXP-001',
          amount: 1000,
          description: 'Test',
          invoiceDate: '2024-01-15',
          submittedBy: 'user1',
          submittedAt: '2024-01-15T00:00:00Z'
        }
      ]
      
      const result = performMigration([], expenses)
      const summary = generateMigrationSummary(result)
      
      expect(summary).toContain('Warnings')
      expect(summary).toContain('⚠️')
    })
  })
})
