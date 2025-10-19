/**
 * System Configuration Modal
 */

import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Save, Download, Upload } from 'lucide-react';

interface SystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SystemConfig) => void;
}

interface SystemConfig {
  autoBackup: boolean;
  backupFrequency: string;
  apiEnabled: boolean;
  webhooksEnabled: boolean;
}

export function SystemConfigModal({ isOpen, onClose, onSave }: SystemConfigModalProps) {
  const [config, setConfig] = useState<SystemConfig>({
    autoBackup: true,
    backupFrequency: 'daily',
    apiEnabled: true,
    webhooksEnabled: false
  });

  const handleSave = () => {
    onSave(config);
    localStorage.setItem('system_config', JSON.stringify(config));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <SettingsIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sistema</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Respaldo Automático</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Crear backups periódicos</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.autoBackup} onChange={(e) => setConfig({ ...config, autoBackup: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frecuencia de Respaldo</label>
              <select
                value={config.backupFrequency}
                onChange={(e) => setConfig({ ...config, backupFrequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="hourly">Cada hora</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">API Habilitada</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Permitir acceso por API</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.apiEnabled} onChange={(e) => setConfig({ ...config, apiEnabled: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Webhooks</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Habilitar webhooks externos</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.webhooksEnabled} onChange={(e) => setConfig({ ...config, webhooksEnabled: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 dark:peer-focus:ring-gray-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-600"></div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg"><Save className="w-4 h-4" />Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
