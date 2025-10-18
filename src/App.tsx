import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { UserProfilePage } from '@/pages/UserProfilePage'
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
import { AIAssistantButton } from '@/components/ai/AIAssistantButton'
import { AIAssistantModal } from '@/components/ai/AIAssistantModal'
import { useAIAssistant } from '@/hooks/useAIAssistant'
import '@/styles/ai-animations.css'

export default function App() {
  const aiAssistant = useAIAssistant()

  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard-enhanced" replace />} />
            <Route path="/dashboard-enhanced" element={<EnhancedDashboard />} />
            <Route path="/profile" element={<UserProfilePage />} />
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
            </Route>
          </Route>
        </Routes>

        {/* AI Assistant - Available globally */}
        <AIAssistantButton
          notificationCount={aiAssistant.notificationCount}
          onClick={() => aiAssistant.openAssistant()}
        />
        <AIAssistantModal
          isOpen={aiAssistant.isOpen}
          onClose={aiAssistant.closeAssistant}
          initialView={aiAssistant.currentView}
        />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
