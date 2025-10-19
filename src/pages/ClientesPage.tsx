/**
 * ClientesPage Component
 * 
 * Main page for managing clientes.
 * Features:
 * - List of clientes with search
 * - Show statistics for each cliente
 * - Create/edit clientes
 * 
 * Requirements: 1.1, 1.3, 1.5
 * Task: 3.3
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  TrendingUp,
  FileText,
  CheckCircle,
  Briefcase,
  Edit,
  Trash2
} from 'lucide-react';
import { clienteService } from '../services/cliente.service';
import { ClienteFormModal } from '../components/clientes/ClienteFormModal';
import type { Cliente } from '../types/cliente.types';

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [sortBy, setSortBy] = useState<'nombre' | 'empresa' | 'totalFacturado' | 'createdAt'>('nombre');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    filterAndSortClientes();
  }, [clientes, searchQuery, sortBy, sortOrder]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const allClientes = await clienteService.getClientesAll();
      setClientes(allClientes);
    } catch (error) {
      console.error('Error loading clientes:', error);
      alert('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortClientes = async () => {
    try {
      let result = clientes;

      // Apply search filter
      if (searchQuery.trim()) {
        result = await clienteService.searchClientes(searchQuery);
      }

      // Apply sorting
      result = result.sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortBy) {
          case 'nombre':
            valueA = a.nombre.toLowerCase();
            valueB = b.nombre.toLowerCase();
            break;
          case 'empresa':
            valueA = (a.empresa || '').toLowerCase();
            valueB = (b.empresa || '').toLowerCase();
            break;
          case 'totalFacturado':
            valueA = a.stats.totalFacturado;
            valueB = b.stats.totalFacturado;
            break;
          case 'createdAt':
            valueA = a.createdAt.toMillis();
            valueB = b.createdAt.toMillis();
            break;
          default:
            valueA = a.nombre.toLowerCase();
            valueB = b.nombre.toLowerCase();
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setFilteredClientes(result);
    } catch (error) {
      console.error('Error filtering clientes:', error);
    }
  };

  const handleCreateCliente = () => {
    setSelectedCliente(null);
    setIsModalOpen(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleSaveCliente = (cliente: Cliente) => {
    loadClientes();
  };

  const handleDeleteCliente = async (cliente: Cliente) => {
    if (!confirm(`¿Estás seguro de eliminar al cliente "${cliente.nombre}"?`)) {
      return;
    }

    try {
      await clienteService.deleteCliente(cliente.id);
      loadClientes();
    } catch (error: any) {
      console.error('Error deleting cliente:', error);
      alert(error.message || 'Error al eliminar el cliente');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Calculate summary stats
  const totalClientes = clientes.length;
  const totalFacturado = clientes.reduce((sum, c) => sum + c.stats.totalFacturado, 0);
  const totalCobrado = clientes.reduce((sum, c) => sum + c.stats.totalCobrado, 0);
  const clientesActivos = clientes.filter(c => c.stats.proyectosActivos > 0).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Clientes
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestiona tu base de datos de clientes
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateCliente}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Cliente
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalClientes}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clientes Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {clientesActivos}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Facturado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalFacturado)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Cobrado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(totalCobrado)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, empresa o email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="nombre">Nombre</option>
                <option value="empresa">Empresa</option>
                <option value="totalFacturado">Facturado</option>
                <option value="createdAt">Fecha</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Clientes List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">Cargando clientes...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreateCliente}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Cliente
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-green-500 dark:hover:border-green-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {cliente.empresa ? (
                        <Building2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cliente.nombre}
                        </h3>
                        {cliente.stats.proyectosActivos > 0 && (
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                            {cliente.stats.proyectosActivos} proyecto{cliente.stats.proyectosActivos !== 1 ? 's' : ''} activo{cliente.stats.proyectosActivos !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {cliente.empresa && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {cliente.empresa}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {cliente.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {cliente.telefono}
                        </div>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Presupuestos</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                            {cliente.stats.totalPresupuestos}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Aprobados</p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                            {cliente.stats.presupuestosAprobados}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Facturado</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                            {formatCurrency(cliente.stats.totalFacturado)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Cobrado</p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                            {formatCurrency(cliente.stats.totalCobrado)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditCliente(cliente)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCliente(cliente)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Eliminar"
                      disabled={cliente.stats.proyectosActivos > 0}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={selectedCliente}
      />
    </div>
  );
}
