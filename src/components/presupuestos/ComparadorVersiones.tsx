/**
 * ComparadorVersiones Component
 * Requirements: 12.4
 * Task: 10.2
 * 
 * Compares two versions of a presupuesto showing:
 * - Differences in partidas
 * - Differences in amounts
 * - Visual highlighting of changes
 */

import React, { useMemo } from 'react';
import { ArrowRight, Plus, Minus, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import type { Presupuesto, Partida } from '../../types/presupuesto.types';
import { formatearMoneda } from '../../utils/presupuesto.utils';

interface ComparadorVersionesProps {
  versionAnterior: Presupuesto;
  versionNueva: Presupuesto;
}

interface PartidaComparison {
  codigo: string;
  nombre: string;
  tipo: 'igual' | 'modificada' | 'nueva' | 'eliminada';
  anterior?: {
    cantidad: number;
    precioUnitario: number;
    total: number;
  };
  nueva?: {
    cantidad: number;
    precioUnitario: number;
    total: number;
  };
  diferencia?: number;
}

export function ComparadorVersiones({ versionAnterior, versionNueva }: ComparadorVersionesProps) {
  
  const comparacion = useMemo(() => {
    const partidasComparadas: PartidaComparison[] = [];
    
    // Compare each fase
    versionNueva.fases.forEach((faseNueva, faseIndex) => {
      const faseAnterior = versionAnterior.fases[faseIndex];
      
      if (!faseAnterior) {
        // Nueva fase completa
        faseNueva.partidas.forEach(partida => {
          partidasComparadas.push({
            codigo: partida.codigo,
            nombre: partida.nombre,
            tipo: 'nueva',
            nueva: {
              cantidad: partida.cantidad,
              precioUnitario: partida.precioUnitario,
              total: partida.total
            }
          });
        });
        return;
      }
      
      // Compare partidas within fase
      const partidasAnteriores = new Map(faseAnterior.partidas.map(p => [p.codigo, p]));
      const partidasNuevas = new Map(faseNueva.partidas.map(p => [p.codigo, p]));
      
      // Check for modified and new partidas
      faseNueva.partidas.forEach(partidaNueva => {
        const partidaAnterior = partidasAnteriores.get(partidaNueva.codigo);
        
        if (!partidaAnterior) {
          // Nueva partida
          partidasComparadas.push({
            codigo: partidaNueva.codigo,
            nombre: partidaNueva.nombre,
            tipo: 'nueva',
            nueva: {
              cantidad: partidaNueva.cantidad,
              precioUnitario: partidaNueva.precioUnitario,
              total: partidaNueva.total
            }
          });
        } else {
          // Check if modified
          const esIgual = 
            partidaAnterior.cantidad === partidaNueva.cantidad &&
            partidaAnterior.precioUnitario === partidaNueva.precioUnitario;
          
          partidasComparadas.push({
            codigo: partidaNueva.codigo,
            nombre: partidaNueva.nombre,
            tipo: esIgual ? 'igual' : 'modificada',
            anterior: {
              cantidad: partidaAnterior.cantidad,
              precioUnitario: partidaAnterior.precioUnitario,
              total: partidaAnterior.total
            },
            nueva: {
              cantidad: partidaNueva.cantidad,
              precioUnitario: partidaNueva.precioUnitario,
              total: partidaNueva.total
            },
            diferencia: partidaNueva.total - partidaAnterior.total
          });
        }
      });
      
      // Check for deleted partidas
      faseAnterior.partidas.forEach(partidaAnterior => {
        if (!partidasNuevas.has(partidaAnterior.codigo)) {
          partidasComparadas.push({
            codigo: partidaAnterior.codigo,
            nombre: partidaAnterior.nombre,
            tipo: 'eliminada',
            anterior: {
              cantidad: partidaAnterior.cantidad,
              precioUnitario: partidaAnterior.precioUnitario,
              total: partidaAnterior.total
            }
          });
        }
      });
    });
    
    return partidasComparadas;
  }, [versionAnterior, versionNueva]);

  const resumen = useMemo(() => {
    const nuevas = comparacion.filter(p => p.tipo === 'nueva').length;
    const modificadas = comparacion.filter(p => p.tipo === 'modificada').length;
    const eliminadas = comparacion.filter(p => p.tipo === 'eliminada').length;
    const diferenciaTotal = versionNueva.montos.total - versionAnterior.montos.total;
    const porcentajeCambio = (diferenciaTotal / versionAnterior.montos.total) * 100;
    
    return {
      nuevas,
      modificadas,
      eliminadas,
      diferenciaTotal,
      porcentajeCambio
    };
  }, [comparacion, versionAnterior, versionNueva]);

  const getTipoBadgeClass = (tipo: PartidaComparison['tipo']) => {
    switch (tipo) {
      case 'nueva':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'modificada':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'eliminada':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTipoIcon = (tipo: PartidaComparison['tipo']) => {
    switch (tipo) {
      case 'nueva':
        return <Plus className="w-4 h-4" />;
      case 'eliminada':
        return <Minus className="w-4 h-4" />;
      case 'modificada':
        return <ArrowRight className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-4">Comparación de Versiones</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Versión Anterior</p>
            <p className="font-semibold">v{versionAnterior.version} - {versionAnterior.numero}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {versionAnterior.fechaCreacion.toDate 
                ? versionAnterior.fechaCreacion.toDate().toLocaleDateString('es-ES')
                : new Date(versionAnterior.fechaCreacion as any).toLocaleDateString('es-ES')}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Versión Nueva</p>
            <p className="font-semibold">v{versionNueva.version} - {versionNueva.numero}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {versionNueva.fechaCreacion.toDate 
                ? versionNueva.fechaCreacion.toDate().toLocaleDateString('es-ES')
                : new Date(versionNueva.fechaCreacion as any).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{resumen.nuevas}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Nuevas</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{resumen.modificadas}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Modificadas</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{resumen.eliminadas}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Eliminadas</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {resumen.diferenciaTotal > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : resumen.diferenciaTotal < 0 ? (
                <TrendingDown className="w-5 h-5 text-red-600" />
              ) : null}
              <p className={`text-2xl font-bold ${
                resumen.diferenciaTotal > 0 ? 'text-green-600' :
                resumen.diferenciaTotal < 0 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {resumen.porcentajeCambio > 0 ? '+' : ''}
                {resumen.porcentajeCambio.toFixed(1)}%
              </p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cambio Total</p>
          </div>
        </div>
      </div>

      {/* Total Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold mb-4">Comparación de Montos</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <span className="font-medium">Versión Anterior (v{versionAnterior.version})</span>
            <span className="text-lg font-bold">
              {formatearMoneda(versionAnterior.montos.total, versionAnterior.montos.moneda)}
            </span>
          </div>
          
          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
            <span className="font-medium">Versión Nueva (v{versionNueva.version})</span>
            <span className="text-lg font-bold">
              {formatearMoneda(versionNueva.montos.total, versionNueva.montos.moneda)}
            </span>
          </div>
          
          <div className={`flex items-center justify-between p-3 rounded ${
            resumen.diferenciaTotal > 0 ? 'bg-green-50 dark:bg-green-900/20' :
            resumen.diferenciaTotal < 0 ? 'bg-red-50 dark:bg-red-900/20' :
            'bg-gray-50 dark:bg-gray-900'
          }`}>
            <span className="font-medium">Diferencia</span>
            <span className={`text-lg font-bold ${
              resumen.diferenciaTotal > 0 ? 'text-green-600' :
              resumen.diferenciaTotal < 0 ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {resumen.diferenciaTotal > 0 ? '+' : ''}
              {formatearMoneda(resumen.diferenciaTotal, versionNueva.montos.moneda)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-bold mb-4">Detalle de Cambios en Partidas</h3>
        
        {comparacion.filter(p => p.tipo !== 'igual').length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No hay cambios entre las versiones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comparacion
              .filter(p => p.tipo !== 'igual')
              .map((partida, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTipoBadgeClass(partida.tipo)}`}>
                          {getTipoIcon(partida.tipo)}
                          {partida.tipo === 'nueva' ? 'Nueva' :
                           partida.tipo === 'modificada' ? 'Modificada' :
                           'Eliminada'}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {partida.codigo}
                        </span>
                      </div>
                      <p className="font-medium">{partida.nombre}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {partida.anterior && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Versión Anterior
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Cantidad:</span>
                            <span className="font-medium">{partida.anterior.cantidad}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>P. Unitario:</span>
                            <span className="font-medium">
                              {formatearMoneda(partida.anterior.precioUnitario, versionAnterior.montos.moneda)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">
                              {formatearMoneda(partida.anterior.total, versionAnterior.montos.moneda)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {partida.nueva && (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          Versión Nueva
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Cantidad:</span>
                            <span className={`font-medium ${
                              partida.anterior && partida.anterior.cantidad !== partida.nueva.cantidad
                                ? 'text-orange-600'
                                : ''
                            }`}>
                              {partida.nueva.cantidad}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>P. Unitario:</span>
                            <span className={`font-medium ${
                              partida.anterior && partida.anterior.precioUnitario !== partida.nueva.precioUnitario
                                ? 'text-orange-600'
                                : ''
                            }`}>
                              {formatearMoneda(partida.nueva.precioUnitario, versionNueva.montos.moneda)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">
                              {formatearMoneda(partida.nueva.total, versionNueva.montos.moneda)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {partida.diferencia !== undefined && partida.diferencia !== 0 && (
                    <div className={`mt-3 p-2 rounded text-sm font-medium text-center ${
                      partida.diferencia > 0
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      Diferencia: {partida.diferencia > 0 ? '+' : ''}
                      {formatearMoneda(partida.diferencia, versionNueva.montos.moneda)}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
