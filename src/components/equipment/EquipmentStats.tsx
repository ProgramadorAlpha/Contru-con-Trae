import React from 'react';
import { Settings, DollarSign, Clock, AlertCircle, TrendingUp, Package } from 'lucide-react';

interface EquipmentStatsProps {
  stats: {
    total: number;
    available: number;
    inUse: number;
    inMaintenance: number;
    retired: number;
    totalValue: number;
    utilizationRate: number;
    upcomingMaintenance: number;
    overdueMaintenance: number;
  };
}

const EquipmentStats: React.FC<EquipmentStatsProps> = ({ stats }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statCards = [
    {
      title: 'Total Equipos',
      value: stats.total,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Disponibles',
      value: stats.available,
      icon: Settings,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'En Uso',
      value: stats.inUse,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'En Mantenimiento',
      value: stats.inMaintenance,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Valor Total',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
    },
    {
      title: 'Tasa de Uso',
      value: `${stats.utilizationRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'teal',
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
          </div>
        </div>
      ))}

      {/* Maintenance Alerts */}
      {(stats.upcomingMaintenance > 0 || stats.overdueMaintenance > 0) && (
        <div className="col-span-2 md:col-span-3 lg:col-span-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Alertas de Mantenimiento</h3>
                  <p className="text-sm text-gray-600">
                    {stats.upcomingMaintenance > 0 && (
                      <span className="text-orange-600">
                        {stats.upcomingMaintenance} mantenimientos próximos
                      </span>
                    )}
                    {stats.upcomingMaintenance > 0 && stats.overdueMaintenance > 0 && ' • '}
                    {stats.overdueMaintenance > 0 && (
                      <span className="text-red-600">
                        {stats.overdueMaintenance} mantenimientos vencidos
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Ver Calendario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentStats;