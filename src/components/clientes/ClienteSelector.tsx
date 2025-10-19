/**
 * ClienteSelector Component
 * 
 * Autocomplete selector for choosing or creating a cliente.
 * Features:
 * - Search with autocomplete
 * - Show recent clientes
 * - Create new cliente inline
 * 
 * Requirements: 1.2, 1.5
 * Task: 3.1
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, Building2, ChevronDown } from 'lucide-react';
import { clienteService } from '../../services/cliente.service';
import type { Cliente } from '../../types/cliente.types';

interface ClienteSelectorProps {
  value: string | null;
  onChange: (clienteId: string) => void;
  allowCreate?: boolean;
  onCreateClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function ClienteSelector({
  value,
  onChange,
  allowCreate = true,
  onCreateClick,
  placeholder = 'Buscar cliente...',
  className = ''
}: ClienteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load clientes on mount
  useEffect(() => {
    loadClientes();
  }, []);

  // Load selected cliente
  useEffect(() => {
    if (value) {
      loadSelectedCliente(value);
    } else {
      setSelectedCliente(null);
    }
  }, [value]);

  // Filter clientes based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Show recent clientes when no search
      loadRecentClientes();
    } else {
      // Filter clientes by search query
      const filtered = clientes.filter(cliente => {
        const searchLower = searchQuery.toLowerCase();
        return (
          cliente.nombre.toLowerCase().includes(searchLower) ||
          (cliente.empresa?.toLowerCase() || '').includes(searchLower) ||
          cliente.email.toLowerCase().includes(searchLower)
        );
      });
      setFilteredClientes(filtered);
    }
  }, [searchQuery, clientes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const allClientes = await clienteService.getClientesAll();
      setClientes(allClientes);
    } catch (error) {
      console.error('Error loading clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentClientes = async () => {
    try {
      const recent = await clienteService.getClientesRecientes(5);
      setFilteredClientes(recent);
    } catch (error) {
      console.error('Error loading recent clientes:', error);
    }
  };

  const loadSelectedCliente = async (clienteId: string) => {
    try {
      const cliente = await clienteService.getCliente(clienteId);
      setSelectedCliente(cliente);
    } catch (error) {
      console.error('Error loading selected cliente:', error);
    }
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    onChange(cliente.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    if (onCreateClick) {
      onCreateClick();
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
    if (searchQuery === '' && filteredClientes.length === 0) {
      loadRecentClientes();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Cliente Display / Search Input */}
      <div className="relative">
        {selectedCliente && !isOpen ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                {selectedCliente.empresa ? (
                  <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {selectedCliente.nombre}
                </div>
                {selectedCliente.empresa && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedCliente.empresa}
                  </div>
                )}
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={handleInputClick}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Create New Button */}
          {allowCreate && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 transition-colors"
            >
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-green-600 dark:text-green-400">
                Crear nuevo cliente
              </span>
            </button>
          )}

          {/* Loading State */}
          {loading && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              Cargando clientes...
            </div>
          )}

          {/* No Results */}
          {!loading && filteredClientes.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No se encontraron clientes' : 'No hay clientes recientes'}
            </div>
          )}

          {/* Clientes List */}
          {!loading && filteredClientes.length > 0 && (
            <>
              {searchQuery === '' && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  Clientes Recientes
                </div>
              )}
              {filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => handleSelectCliente(cliente)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {cliente.empresa ? (
                      <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {cliente.nombre}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {cliente.empresa || cliente.email}
                    </div>
                  </div>
                  {cliente.stats.proyectosActivos > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      {cliente.stats.proyectosActivos} activo{cliente.stats.proyectosActivos !== 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
