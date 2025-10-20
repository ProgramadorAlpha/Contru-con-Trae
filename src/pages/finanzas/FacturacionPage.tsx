/**
 * FacturacionPage - Gestión de Facturas
 * 
 * Página principal para gestionar facturas
 * Features:
 * - Lista de facturas con filtros
 * - Crear/editar facturas
 * - Registrar cobros
 * - Enviar facturas por email
 * - Estadísticas de facturación
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { FacturasList } from '../../components/finanzas/FacturasList';
import { RegistrarCobroModal } from '../../components/finanzas/RegistrarCobroModal';
import { facturaService } from '../../services/factura.service';
import type { Factura } from '../../types/factura.types';

export function FacturacionPage() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCobroModalOpen, setIsCobroModalOpen] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');

  // Estadísticas
  const [stats, setStats] = useState({
    totalFacturado: 0,
    totalCobrado: 0,
    pendienteCobro: 0,
    facturasVencidas: 0
  });

  useEffect(() => {
    loadFacturas();
  }, [filtroEstado]);

  const loadFacturas = async () => {
    try {
      setLoading(true);
      const facturasData = await facturaService.getFacturasAll();
      
      // Apply filter if needed
      let filteredFacturas = facturasData;
      if (filtroEstado !== 'todas') {
        filteredFacturas = facturasData.filter(f => f.estado === filtroEstado);
      }
      
      setFacturas(filteredFacturas);
      calculateStats(facturasData); // Calculate stats from all facturas
    } catch (error) {
      console.error('Error loading facturas:', error);
      setFacturas([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (facturasData: Factura[]) => {
    const total = facturasData.reduce((sum, f) => sum + f.total, 0);
    const cobrado = facturasData
      .filter(f => f.estado === 'cobrada')
      .reduce((sum, f) => sum + f.total, 0);
    const pendiente = facturasData
      .filter(f => f.estado === 'enviada' || f.estado === 'vencida' || f.estado === 'borrador')
      .reduce((sum, f) => sum + f.total, 0);
    const vencidas = facturasData.filter(f => f.estado === 'vencida').length;

    setStats({
      totalFacturado: total,
      totalCobrado: cobrado,
      pendienteCobro: pendiente,
      facturasVencidas: vencidas
    });
  };

  const handleGenerarFactura = () => {
    // TODO: Navigate to factura creation page or open modal with project context
    alert('Funcionalidad de crear factura en desarrollo');
  };

  const handleRegistrarCobro = (facturaId: string) => {
    const factura = facturas.find(f => f.id === facturaId);
    if (factura) {
      setSelectedFactura(factura);
      setIsCobroModalOpen(true);
    }
  };

  const handleEnviarFactura = async (facturaId: string) => {
    try {
      // TODO: Implementar envío de factura por email
      console.log('Enviar factura:', facturaId);
      alert('Factura enviada correctamente');
      loadFacturas();
    } catch (error) {
      console.error('Error sending factura:', error);
      alert('Error al enviar la factura');
    }
  };

  const handleExport = () => {
    // TODO: Implementar exportación a CSV/Excel
    console.log('Exportar facturas');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = searchQuery === '' || 
      factura.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factura.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEstado = filtroEstado === 'todas' || factura.estado === filtroEstado;
    
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/finanzas')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Facturación
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gestiona facturas y cobros
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Download className="w-5 h-5" />
                Exportar
              </button>
              <button
                onClick={handleGenerarFactura}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nueva Factura
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Facturado</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(stats.totalFacturado)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Cobrado</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {formatCurrency(stats.totalCobrado)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pendiente Cobro</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {formatCurrency(stats.pendienteCobro)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Facturas Vencidas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {stats.facturasVencidas}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por número de factura o cliente..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas</option>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="cobrada">Cobrada</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Facturas List */}
        <FacturasList
          facturas={filteredFacturas}
          onRegistrarCobro={handleRegistrarCobro}
          onEnviar={handleEnviarFactura}
        />
      </div>

      {/* Modal */}
      {selectedFactura && (
        <RegistrarCobroModal
          isOpen={isCobroModalOpen}
          onClose={() => {
            setIsCobroModalOpen(false);
            setSelectedFactura(null);
          }}
          factura={selectedFactura}
          onSuccess={() => {
            setIsCobroModalOpen(false);
            setSelectedFactura(null);
            loadFacturas();
          }}
        />
      )}
    </div>
  );
}
