import React from 'react'
import { ExpenseApprovalQueue } from '@/components/expenses/ExpenseApprovalQueue'

export function ExpenseApprovalsPage() {
  return (
    <main role="main" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aprobación de Gastos</h1>
        <p className="text-gray-600 mt-1">
          Revisión y aprobación de gastos pendientes
        </p>
      </div>

      <ExpenseApprovalQueue />
    </main>
  )
}
