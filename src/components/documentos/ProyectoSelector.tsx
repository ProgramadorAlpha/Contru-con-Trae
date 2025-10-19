/**
 * ProyectoSelector Component
 * 
 * Dropdown selector for choosing a project with search functionality
 * Requirements: 2
 * Task: 10.1, 10.2, 10.3, 10.4
 */

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Building2, User, CheckCircle2 } from 'lucide-react';
import type { Proyecto } from '@/services/proyecto.service';

interface ProyectoSelectorProps {
  value?: string;
  onChange: (proyectoId: string) => void;
  proyectos?: Proyecto[];
  loading?: boolean;
  error?: string;
  placeholder?: string;
  showAllOption?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ProyectoSelector({
  value,
  onChange,
  proyectos = [],
  loading = false,
  error,
  placeholder = 'Seleccionar proyecto',
  showAllOption = false,
  disabled = false,
  className = ''
}: ProyectoSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get selected project
  const selectedProyecto = useMemo(() => {
    if (!value) return null;
    if (value === 'all') return { id: 'all', nombre: 'Todos los Proyectos', estado: 'Activo' };
    return proyectos.find(p => p.id === value) || null;
  }, [value, proyectos]);

  // Filter projects by search query
  const filteredProyectos = useMemo(() => {
    if (!searchQuery.trim()) return proyectos;
    
    const query = searchQuery.toLowerCase();
    return proyectos.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      p.cliente?.toLowerCase().includes(query) ||
      p.codigo?.toLowerCase().includes(query)
    );
  }, [proyectos, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.proyecto-selector')) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (proyectoId: string) => {
    onChange(proyectoId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
      case 'En Progreso':
        return 'text-green-600 bg-green-50';
      case 'Completado':
        return 'text-blue-600 bg-blue-50';
      case 'Pausado':
        return 'text-yellow-600 bg-yellow-50';
      case 'Cancelado':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`proyecto-selector relative ${className}`}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3
          bg-white border border-gray-300 rounded-lg
          hover:border-blue-500 hover:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-blue-500 shadow-sm' : ''}
        `}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
          
          {loading ? (
            <span className="text-gray-500">Cargando proyectos...</span>
          ) : selectedProyecto ? (
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="font-medium text-gray-900 truncate w-full">
                {selectedProyecto.nombre}
              </span>
              {selectedProyecto.cliente && selectedProyecto.id !== 'all' && (
                <span className="text-sm text-gray-500 truncate w-full">
                  {selectedProyecto.cliente}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>

        <ChevronDown 
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar proyecto..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="overflow-y-auto max-h-80">
            {/* All Projects Option */}
            {showAllOption && !searchQuery && (
              <button
                type="button"
                onClick={() => handleSelect('all')}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                  flex items-center justify-between gap-3
                  ${value === 'all' ? 'bg-blue-50' : ''}
                `}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-gray-900">
                      Todos los Proyectos
                    </span>
                    <span className="text-sm text-gray-500">
                      Ver documentos de todos los proyectos
                    </span>
                  </div>
                </div>
                {value === 'all' && (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
            )}

            {/* Project Items */}
            {filteredProyectos.length > 0 ? (
              filteredProyectos.map((proyecto) => (
                <button
                  key={proyecto.id}
                  type="button"
                  onClick={() => handleSelect(proyecto.id)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    flex items-center justify-between gap-3
                    ${value === proyecto.id ? 'bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 truncate">
                          {proyecto.nombre}
                        </span>
                        <span className={`
                          px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0
                          ${getEstadoColor(proyecto.estado)}
                        `}>
                          {proyecto.estado}
                        </span>
                      </div>
                      
                      {proyecto.cliente && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <User className="w-3 h-3" />
                          <span className="truncate">{proyecto.cliente}</span>
                        </div>
                      )}
                      
                      {proyecto.codigo && (
                        <span className="text-xs text-gray-400">
                          {proyecto.codigo}
                        </span>
                      )}
                    </div>
                  </div>

                  {value === proyecto.id && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="font-medium">No se encontraron proyectos</p>
                {searchQuery && (
                  <p className="text-sm mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          {filteredProyectos.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              {filteredProyectos.length} {filteredProyectos.length === 1 ? 'proyecto' : 'proyectos'}
              {searchQuery && ' encontrados'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
