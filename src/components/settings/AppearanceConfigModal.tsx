/**
 * Appearance Configuration Modal
 */

import React, { useState } from 'react';
import { X, Palette, Save } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface AppearanceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AppearanceConfig) => void;
}

interface AppearanceConfig {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  compactMode: boolean;
}

export function AppearanceConfigModal({ isOpen, onClose, onSave }: AppearanceConfigModalProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [config, setConfig] = useState<AppearanceConfig>({
    theme: isDarkMode ? 'dark' : 'light',
    primaryColor: '#3B82F6',
    compactMode: false
  });

  const handleSave = () => {
    onSave(config);
    localStorage.setItem('appearance_config', JSON.stringify(config));
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apariencia</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tema</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: '☀️ Claro' },
                  { value: 'dark', label: '🌙 Oscuro' },
                  { value: 'auto', label: '🔄 Auto' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setConfig({ ...config, theme: value as any })}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      config.theme === value
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Color Principal</label>
              <div className="grid grid-cols-6 gap-2">
                {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, primaryColor: color })}
                    className={`w-12 h-12 rounded-lg border-2 ${
                      config.primaryColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Modo Compacto</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reducir espaciado en la interfaz</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={config.compactMode} onChange={(e) => setConfig({ ...config, compactMode: e.target.checked })} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg"><Save className="w-4 h-4" />Guardar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
