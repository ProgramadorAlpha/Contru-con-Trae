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
import { ProjectIncomePage } from '@/pages/ProjectIncomePage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AuditLogPage } from '@/pages/AuditLogPage'
import { PresupuestosPage } from '@/pages/PresupuestosPage'
import { PresupuestoCreatorPage } from '@/pages/PresupuestoCreatorPage'
import { PresupuestoViewPage } from '@/pages/PresupuestoViewPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { FinanzasPage } from '@/pages/FinanzasPage'
import { GastosPage } from '@/pages/finanzas/GastosPage'
import { FacturacionPage } from '@/pages/finanzas/FacturacionPage'
import { ReportesFinancierosPage } from '@/pages/finanzas/ReportesFinancierosPage'
import { PresupuestoPublicPage } from '@/pages/public/PresupuestoPublicPage'
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
          <Route path="/presupuestos/public/:token" element={<PresupuestoPublicPage />} />
          
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
            
            {/* Budget & Finance Module routes */}
            <Route path="/presupuestos" element={<PresupuestosPage />} />
            <Route path="/presupuestos/crear" element={<PresupuestoCreatorPage />} />
            <Route path="/presupuestos/:id" element={<PresupuestoViewPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/gastos" element={<GastosPage />} />
            <Route path="/facturas" element={<FacturacionPage />} />
            <Route path="/reportes" element={<ReportesFinancierosPage />} />
            
            {/* Job Costing System routes */}
            <Route path="/subcontracts" element={<SubcontractsPage />} />
            <Route path="/certificates" element={<ProgressCertificatesPage />} />
            <Route path="/cost-codes" element={<CostCodesPage />} />
            <Route path="/expense-approvals" element={<ExpenseApprovalsPage />} />
              <Route path="/project-financials/:projectId" element={<ProjectFinancialsPage />} />
              <Route path="/projects/:projectId/income" element={<ProjectIncomePage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
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
