/**
 * Settings Page
 * 
 * Página completa de configuración de la aplicación con múltiples secciones.
 */

import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Bell, 
  Shield, 
  Palette, 
  Settings as SettingsIcon,
  Save,
  Key,
  Globe,
  Database,
  Zap,
  Bot
} from 'lucide-react';
import { AIConfigModal } from '@/components/settings/AIConfigModal';
import { N8NConfigModal } from '@/components/settings/N8NConfigModal';
import { ProfileConfigModal } from '@/components/settings/ProfileConfigModal';
import { CompanyConfigModal } from '@/components/settings/CompanyConfigModal';
import { NotificationsConfigModal } from '@/components/settings/NotificationsConfigModal';
import { SecurityConfigModal } from '@/components/settings/SecurityConfigModal';
import { AppearanceConfigModal } from '@/components/settings/AppearanceConfigModal';
import { SystemConfigModal } from '@/components/settings/SystemConfigModal';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  items: string[];
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Perfil de Usuario',
    description: 'Gestiona tu información personal y preferencias',
    icon: User,
    items: ['Información personal', 'Cambiar contraseña', 'Preferencias de idioma', 'Zona horaria']
  },
  {
    id: 'company',
    title: 'Empresa',
    description: 'Configuración de la empresa y usuarios',
    icon: Building2,
    items: ['Datos de la empresa', 'Gestión de usuarios', 'Roles y permisos', 'Configuración fiscal']
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Controla cómo y cuándo recibir notificaciones',
    icon: Bell,
    items: ['Notificaciones por email', 'Alertas de proyecto', 'Recordatorios de pagos', 'Notificaciones push']
  },
  {
    id: 'security',
    title: 'Seguridad',
    description: 'Configuración de seguridad y privacidad',
    icon: Shield,
    items: ['Autenticación de dos factores', 'Sesiones activas', 'Registro de actividad', 'Configuración de privacidad']
  },
  {
    id: 'appearance',
    title: 'Apariencia',
    description: 'Personaliza la interfaz de usuario',
    icon: Palette,
    items: ['Tema claro/oscuro', 'Colores personalizados', 'Diseño de dashboard', 'Configuración de vista']
  },
  {
    id: 'system',
    title: 'Sistema',
    description: 'Configuración avanzada del sistema',
    icon: SettingsIcon,
    items: ['Respaldo de datos', 'Importar/Exportar', 'Integraciones', 'API y webhooks']
  },
  {
    id: 'ai',
    title: 'Inteligencia Artificial',
    description: 'Configuración de Claude AI',
    icon: Bot,
    items: ['API Key de Claude', 'Modelo de IA', 'Límites de uso', 'Historial de conversaciones']
  },
  {
    id: 'n8n',
    title: 'Automatización N8N',
    description: 'Configuración de workflows automáticos',
    icon: Zap,
    items: ['URL de N8N', 'Webhooks', 'Workflows activos', 'Logs de ejecución']
  }
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showN8NModal, setShowN8NModal] = useState(false);

  const handleConfigure = (sectionId: string) => {
    setActiveSection(sectionId);
    
    const modals: Record<string, () => void> = {
      profile: () => setShowProfileModal(true),
      company: () => setShowCompanyModal(true),
      notifications: () => setShowNotificationsModal(true),
      security: () => setShowSecurityModal(true),
      appearance: () => setShowAppearanceModal(true),
      system: () => setShowSystemModal(true),
      ai: () => setShowAIModal(true),
      n8n: () => setShowN8NModal(true)
    };

    modals[sectionId]?.();
  };

  const handleSaveConfig = (type: string, config: any) => {
    console.log(`Configuración de ${type} guardada:`, config);
    localStorage.setItem(`${type}_config`, JSON.stringify(config));
  };

  const handleSaveAll = () => {
    console.log('✅ Todas las configuraciones guardadas');
    alert('Configuración guardada exitosamente');
  };

  const handleBackup = () => {
    const allConfigs = {
      profile: localStorage.getItem('profile_config'),
      company: localStorage.getItem('company_config'),
      notifications: localStorage.getItem('notifications_config'),
      security: localStorage.getItem('security_config'),
      appearance: localStorage.getItem('appearance_config'),
      system: localStorage.getItem('system_config'),
      ai: localStorage.getItem('ai_config'),
      n8n: localStorage.getItem('n8n_config')
    };

    const dataStr = JSON.stringify(allConfigs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `constructpro-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✅ Backup creado');
  };

  const handleViewIntegrations = () => {
    const integrations = {
      ai: localStorage.getItem('ai_config') ? 'Configurado' : 'No configurado',
      n8n: localStorage.getItem('n8n_config') ? 'Configurado' : 'No configurado'
    };
    alert(`Integraciones:\n\nClaude AI: ${integrations.ai}\nN8N: ${integrations.n8n}`);
  };

  return (
    <main role="main" className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona las preferencias de tu cuenta y empresa
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <SettingsIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Información de la Cuenta
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Tu información actual en el sistema
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              AD
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Demo</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">admin@demo.com</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Empresa: Constructora Demo S.A. de C.V.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Section Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  section.id === 'profile' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  section.id === 'company' ? 'bg-green-100 dark:bg-green-900/30' :
                  section.id === 'notifications' ? 'bg-red-100 dark:bg-red-900/30' :
                  section.id === 'security' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  section.id === 'appearance' ? 'bg-purple-100 dark:bg-purple-900/30' :
                  section.id === 'system' ? 'bg-gray-100 dark:bg-gray-700' :
                  section.id === 'ai' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                  'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    section.id === 'profile' ? 'text-blue-600 dark:text-blue-400' :
                    section.id === 'company' ? 'text-green-600 dark:text-green-400' :
                    section.id === 'notifications' ? 'text-red-600 dark:text-red-400' :
                    section.id === 'security' ? 'text-yellow-600 dark:text-yellow-400' :
                    section.id === 'appearance' ? 'text-purple-600 dark:text-purple-400' :
                    section.id === 'system' ? 'text-gray-600 dark:text-gray-400' :
                    section.id === 'ai' ? 'text-indigo-600 dark:text-indigo-400' :
                    'text-orange-600 dark:text-orange-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Section Items */}
              <ul className="space-y-2 mb-4">
                {section.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* Configure Button */}
              <button
                onClick={() => handleConfigure(section.id)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Configurar
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleSaveAll}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <Save className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Guardar Configuración</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Aplicar cambios</div>
            </div>
          </button>
          <button 
            onClick={handleBackup}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Respaldar Datos</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Crear backup</div>
            </div>
          </button>
          <button 
            onClick={handleViewIntegrations}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">Ver Integraciones</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">APIs conectadas</div>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <ProfileConfigModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={(config) => handleSaveConfig('profile', config)}
      />

      <CompanyConfigModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onSave={(config) => handleSaveConfig('company', config)}
      />

      <NotificationsConfigModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSave={(config) => handleSaveConfig('notifications', config)}
      />

      <SecurityConfigModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onSave={(config) => handleSaveConfig('security', config)}
      />

      <AppearanceConfigModal
        isOpen={showAppearanceModal}
        onClose={() => setShowAppearanceModal(false)}
        onSave={(config) => handleSaveConfig('appearance', config)}
      />

      <SystemConfigModal
        isOpen={showSystemModal}
        onClose={() => setShowSystemModal(false)}
        onSave={(config) => handleSaveConfig('system', config)}
      />

      <AIConfigModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onSave={(config) => handleSaveConfig('ai', config)}
      />

      <N8NConfigModal
        isOpen={showN8NModal}
        onClose={() => setShowN8NModal(false)}
        onSave={(config) => handleSaveConfig('n8n', config)}
      />
    </main>
  );
}
