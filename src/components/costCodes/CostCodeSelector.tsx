import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronRight, Folder, FileText } from 'lucide-react'
import { useCostCodes } from '@/hooks/useCostCodes'
import type { CostCode } from '@/types/costCodes'

interface CostCodeSelectorProps {
  value?: string
  onChange: (costCodeId: string, costCode: CostCode) => void
  projectId?: string
  disabled?: boolean
  error?: string
}

export function CostCodeSelector({
  value,
  onChange,
  projectId,
  disabled = false,
  error
}: CostCodeSelectorProps) {
  const { costCodes, searchCostCodes, loading } = useCostCodes()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedDivisions, setExpandedDivisions] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [filteredCodes, setFilteredCodes] = useState<CostCode[]>([])

  useEffect(() => {
    if (searchTerm) {
      const results = searchCostCodes(searchTerm)
      setFilteredCodes(results)
    } else {
      setFilteredCodes(costCodes.filter(cc => cc.isActive))
    }
  }, [searchTerm, costCodes])

  const toggleDivision = (division: string) => {
    const newExpanded = new Set(expandedDivisions)
    if (newExpanded.has(division)) {
      newExpanded.delete(division)
    } else {
      newExpanded.add(division)
    }
    setExpandedDivisions(newExpanded)
  }

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const handleSelect = (costCode: CostCode) => {
    if (!disabled) {
      onChange(costCode.id, costCode)
    }
  }

  // Group cost codes by division and category
  const groupedCodes = filteredCodes.reduce((acc, code) => {
    if (!acc[code.division]) {
      acc[code.division] = {}
    }
    if (!acc[code.division][code.category]) {
      acc[code.division][code.category] = []
    }
    acc[code.division][code.category].push(code)
    return acc
  }, {} as Record<string, Record<string, CostCode[]>>)

  const selectedCode = costCodes.find(cc => cc.id === value)

  return (
    <div className={`${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Selected Value Display */}
      {selectedCode && (
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {selectedCode.code} - {selectedCode.name}
              </p>
              <p className="text-xs text-blue-700">
                {selectedCode.division} / {selectedCode.category}
              </p>
            </div>
            <button
              onClick={() => onChange('', {} as CostCode)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Cambiar
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar código de costo..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Hierarchical List */}
      <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Cargando códigos de costo...
          </div>
        ) : Object.keys(groupedCodes).length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No se encontraron códigos de costo
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(groupedCodes).map(([division, categories]) => (
              <div key={division}>
                {/* Division Header */}
                <button
                  onClick={() => toggleDivision(division)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {expandedDivisions.has(division) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{division}</span>
                  <span className="text-xs text-gray-500">
                    ({Object.values(categories).flat().length})
                  </span>
                </button>

                {/* Categories */}
                {expandedDivisions.has(division) && (
                  <div className="bg-gray-50">
                    {Object.entries(categories).map(([category, codes]) => (
                      <div key={category}>
                        {/* Category Header */}
                        <button
                          onClick={() => toggleCategory(`${division}-${category}`)}
                          className="w-full flex items-center gap-2 p-3 pl-8 hover:bg-gray-100 transition-colors text-left"
                        >
                          {expandedCategories.has(`${division}-${category}`) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                          <Folder className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-800">{category}</span>
                          <span className="text-xs text-gray-500">({codes.length})</span>
                        </button>

                        {/* Cost Codes */}
                        {expandedCategories.has(`${division}-${category}`) && (
                          <div className="bg-white">
                            {codes.map((code) => (
                              <button
                                key={code.id}
                                onClick={() => handleSelect(code)}
                                className={`w-full flex items-center gap-2 p-3 pl-16 hover:bg-blue-50 transition-colors text-left ${
                                  value === code.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                                }`}
                              >
                                <FileText className="w-4 h-4 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {code.code} - {code.name}
                                  </p>
                                  {code.description && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {code.description}
                                    </p>
                                  )}
                                </div>
                                {value === code.id && (
                                  <span className="text-xs font-medium text-blue-600">
                                    Seleccionado
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Helper Text */}
      <p className="mt-2 text-xs text-gray-500">
        Seleccione un código de costo de la lista jerárquica
      </p>
    </div>
  )
}
