/**
 * Notifications Configuration Modal
 */

import React, { useState } from 'react';
import { X, Bell, Save } from 'lucide-react';

interface NotificationsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: NotificationsConfig) => void;
}

interface NotificationsConfig {
  email: boolean;
  projectAlerts: boolean;
  paymentReminders: boolean;
  push: boolean;
}

export function NotificationsConfigModal({ isOpen, onClose, onSave }: NotificationsConfigModalProps) {
  const [config, setConfig] = useState<NotificationsConfig>({
    email: true,
    projectAlerts: true,
    paymentReminders: false,
    push: true
  });

  const handleSave = () => {
    onSave(config);
    localStorage.setItem('notifications_config', JSON.stringify(config));
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
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Bell className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notificaciones</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>
          <div className="p-6 space-y-4">
            {[
              { key: 'email', label: 'Notificaciones por Email', desc: 'Recibir actualizaciones por correo' },
              { key: 'projectAlerts', label: 'Alertas de Proyecto', desc: 'Notificar cambios en proyectos' },
              { key: 'paymentReminders', label: 'Recordatorios de Pagos', desc: 'Avisos de pagos pendientes' },
              { key: 'push', label: 'Notificaciones Push', desc: 'Notificaciones en tiempo real' }
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={config[key as keyof NotificationsConfig]} onChange={(e) => setConfig({ ...config, [key]: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg"><Save className="w-4 h-4" />Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
