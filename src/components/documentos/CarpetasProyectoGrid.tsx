/**
 * CarpetasProyectoGrid Component
 * 
 * Grid display of project folders with document counts
 * Requirements: 7B
 * Task: 13.1, 13.2, 13.3, 13.4
 */

import { Folder, Sparkles } from 'lucide-react';
import { useCarpetasProyecto } from '@/hooks/useCarpetasProyecto';
import { getFolderEmoji, getDocumentColor } from '@/utils/documentos.utils';

interface CarpetasProyectoGridProps {
  proyectoId: string;
  onCarpetaClick: (tipo: string) => void;
  className?: string;
}

export default function CarpetasProyectoGrid({
  proyectoId,
  onCarpetaClick,
  className = ''
}: CarpetasProyectoGridProps) {
  const { carpetas, loading, error } = useCarpetasProyecto(proyectoId);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error al cargar carpetas</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {carpetas.map((carpeta) => {
        const colors = getDocumentColor(carpeta.tipo);
        const isEmpty = carpeta.count === 0;

        return (
          <button
            key={carpeta.tipo}
            onClick={() => onCarpetaClick(carpeta.tipo)}
            disabled={isEmpty}
            className={`
              group relative bg-white border-2 rounded-lg p-6
              transition-all duration-200
              ${isEmpty 
                ? 'border-gray-200 opacity-60 cursor-not-allowed' 
                : `${colors.border} hover:shadow-lg hover:scale-105 cursor-pointer`
              }
            `}
          >
            {/* AI Badge */}
            {carpeta.hasAI && !isEmpty && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  <span>IA</span>
                </div>
              </div>
            )}

            {/* Folder Icon */}
            <div className={`
              w-16 h-16 rounded-lg flex items-center justify-center mb-4
              ${isEmpty ? 'bg-gray-100' : colors.bg}
              ${!isEmpty && 'group-hover:scale-110'}
              transition-transform duration-200
            `}>
              <span className="text-3xl">{getFolderEmoji(carpeta.tipo)}</span>
            </div>

            {/* Folder Name */}
            <h3 className={`
              font-semibold text-lg mb-1
              ${isEmpty ? 'text-gray-400' : colors.text}
            `}>
              {carpeta.nombre}
            </h3>

            {/* Document Count */}
            <p className={`
              text-sm
              ${isEmpty ? 'text-gray-400' : 'text-gray-600'}
            `}>
              {carpeta.count} {carpeta.count === 1 ? 'archivo' : 'archivos'}
            </p>

            {/* Hover Effect */}
            {!isEmpty && (
              <div className={`
                absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                ${colors.bg}
              `} style={{ zIndex: -1 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
