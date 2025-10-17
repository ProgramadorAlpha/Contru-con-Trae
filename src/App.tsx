import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Layout } from '@/components/Layout'
import { EnhancedDashboard } from '@/pages/EnhancedDashboard'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { BudgetPage } from '@/pages/budget/BudgetPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import DocumentsPage from '@/pages/DocumentsPage'
import ToolsPage from '@/pages/ToolsPage'
import { TeamPage } from '@/pages/TeamPage'
import { SubcontractsPage } from '@/pages/SubcontractsPage'
import { ProgressCertificatesPage } from '@/pages/ProgressCertificatesPage'
import { CostCodesPage } from '@/pages/CostCodesPage'
import { ExpenseApprovalsPage } from '@/pages/ExpenseApprovalsPage'
import { ProjectFinancialsPage } from '@/pages/ProjectFinancialsPage'
import { AuditLogPage } from '@/pages/AuditLogPage'

export default function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Redirect root to Enhanced Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard-enhanced" replace />} />
            
            {/* Enhanced Dashboard - Main dashboard */}
            <Route path="/dashboard-enhanced" element={<EnhancedDashboard />} />
            
            {/* Other routes */}
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/team" element={<TeamPage />} />
            
            {/* Job Costing System routes */}
            <Route path="/subcontracts" element={<SubcontractsPage />} />
            <Route path="/certificates" element={<ProgressCertificatesPage />} />
            <Route path="/cost-codes" element={<CostCodesPage />} />
            <Route path="/expense-approvals" element={<ExpenseApprovalsPage />} />
            <Route path="/project-financials/:projectId" element={<ProjectFinancialsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  )
}
