import React from 'react'
import { CostCodeManager } from '@/components/costCodes/CostCodeManager'

export function CostCodesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Códigos de Costo</h1>
        <p className="text-gray-600 mt-1">
          Gestión del catálogo de códigos de costo para clasificación de gastos
        </p>
      </div>

      <CostCodeManager />
    </div>
  )
}
