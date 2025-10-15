import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { BudgetPage } from '@/pages/budget/BudgetPage'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import DocumentsPage from '@/pages/DocumentsPage'
import ToolsPage from '@/pages/ToolsPage'
import { TeamPage } from '@/pages/TeamPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/team" element={<TeamPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
