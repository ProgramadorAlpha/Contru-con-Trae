/**
 * Security Configuration Modal
 */

import React, { useState } from 'react';
import { X, Shield, Save, Key, Smartphone } from 'lucide-react';

interface SecurityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SecurityConfig) => void;
}

interface SecurityConfig {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  activityLog: boolean;
  loginNotifications: boolean;
}

export function SecurityConfigModal({ isOpen, onClose, onSave }: SecurityConfigModalProps) {
  const [config, setConfig] = useState<SecurityConfig>({
    twoFactorAuth: false,
    sessionTimeout: 30,
    activityLog: true,
    loginNotifications: true
  });

  const handleSave = () => {
    onSave(config);
    localStorage.setItem('security_config', JSON.stringify(config));
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
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Seguridad</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Autenticación de Dos Factores</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Seguridad adicional con 2FA</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.twoFactorAuth} onChange={(e) => setConfig({ ...config, twoFactorAuth: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <input
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => setConfig({ ...config, sessionTimeout: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="5"
                max="120"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Registro de Actividad</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Guardar log de acciones</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.activityLog} onChange={(e) => setConfig({ ...config, activityLog: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Notificaciones de Inicio de Sesión</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avisar cuando alguien inicie sesión</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.loginNotifications} onChange={(e) => setConfig({ ...config, loginNotifications: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 dark:peer-focus:ring-yellow-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-yellow-600"></div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg"><Save className="w-4 h-4" />Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
