/**
 * ClienteFormModal Component
 * 
 * Modal form for creating or editing a cliente.
 * Features:
 * - Complete form with validation
 * - Fields: nombre, empresa, email, teléfono, CIF, dirección, datos bancarios
 * - Form validation
 * 
 * Requirements: 1.1
 * Task: 3.2
 */

import React, { useState, useEffect } from 'react';
import { X, Save, User, Building2, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { clienteService } from '../../services/cliente.service';
import type { Cliente, Direccion, DatosBancarios } from '../../types/cliente.types';

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Cliente) => void;
  cliente?: Cliente | null;
}

interface FormData {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  cif: string;
  direccion: {
    calle: string;
    ciudad: string;
    provincia: string;
    codigoPostal: string;
    pais: string;
  };
  datosBancarios: {
    banco: string;
    iban: string;
    swift?: string;
  };
}

const initialFormData: FormData = {
  nombre: '',
  empresa: '',
  email: '',
  telefono: '',
  cif: '',
  direccion: {
    calle: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    pais: 'España'
  },
  datosBancarios: {
    banco: '',
    iban: '',
    swift: ''
  }
};

export function ClienteFormModal({ isOpen, onClose, onSave, cliente }: ClienteFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showBankingSection, setShowBankingSection] = useState(false);

  // Load cliente data when editing
  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre,
        empresa: cliente.empresa || '',
        email: cliente.email,
        telefono: cliente.telefono,
        cif: cliente.cif || '',
        direccion: cliente.direccion,
        datosBancarios: cliente.datosBancarios || {
          banco: '',
          iban: '',
          swift: ''
        }
      });
      setShowBankingSection(!!cliente.datosBancarios);
    } else {
      setFormData(initialFormData);
      setShowBankingSection(false);
    }
    setErrors({});
  }, [cliente, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // Required fields
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Formato de email inválido';
      }
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    // IBAN validation if provided
    if (showBankingSection && formData.datosBancarios.iban) {
      const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
      if (!ibanRegex.test(formData.datosBancarios.iban.replace(/\s/g, ''))) {
        newErrors.datosBancarios = 'Formato de IBAN inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data
      const clienteData = {
        nombre: formData.nombre.trim(),
        empresa: formData.empresa.trim() || undefined,
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        cif: formData.cif.trim() || undefined,
        direccion: formData.direccion,
        datosBancarios: showBankingSection && formData.datosBancarios.iban
          ? {
              banco: formData.datosBancarios.banco.trim(),
              iban: formData.datosBancarios.iban.replace(/\s/g, ''),
              swift: formData.datosBancarios.swift.trim() || undefined
            }
          : undefined
      };

      let savedCliente: Cliente;

      if (cliente) {
        // Update existing cliente
        savedCliente = await clienteService.updateCliente(cliente.id, clienteData);
      } else {
        // Create new cliente
        savedCliente = await clienteService.createCliente(clienteData);
      }

      onSave(savedCliente);
      onClose();
    } catch (error: any) {
      console.error('Error saving cliente:', error);
      alert(error.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCancel} />

        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className={`w-full px-3 py-2 border ${
                      errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                    placeholder="Juan Pérez"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Empresa
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Constructora ABC S.A."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.telefono ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  {errors.telefono && (
                    <p className="mt-1 text-sm text-red-500">{errors.telefono}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CIF / NIF
                  </label>
                  <input
                    type="text"
                    value={formData.cif}
                    onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="B12345678"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dirección
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calle
                  </label>
                  <input
                    type="text"
                    value={formData.direccion.calle}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, calle: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Calle Principal 123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.direccion.ciudad}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, ciudad: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Madrid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Provincia
                  </label>
                  <input
                    type="text"
                    value={formData.direccion.provincia}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, provincia: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Madrid"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.direccion.codigoPostal}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, codigoPostal: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="28001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    value={formData.direccion.pais}
                    onChange={(e) => setFormData({
                      ...formData,
                      direccion: { ...formData.direccion, pais: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="España"
                  />
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Datos Bancarios
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBankingSection(!showBankingSection)}
                  className="text-sm text-green-600 dark:text-green-400 hover:underline"
                >
                  {showBankingSection ? 'Ocultar' : 'Agregar'}
                </button>
              </div>

              {showBankingSection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Banco
                    </label>
                    <input
                      type="text"
                      value={formData.datosBancarios.banco}
                      onChange={(e) => setFormData({
                        ...formData,
                        datosBancarios: { ...formData.datosBancarios, banco: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Banco Santander"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.datosBancarios.iban}
                      onChange={(e) => setFormData({
                        ...formData,
                        datosBancarios: { ...formData.datosBancarios, iban: e.target.value }
                      })}
                      className={`w-full px-3 py-2 border ${
                        errors.datosBancarios ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                      placeholder="ES91 2100 0418 4502 0005 1332"
                    />
                    {errors.datosBancarios && (
                      <p className="mt-1 text-sm text-red-500">{errors.datosBancarios}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SWIFT / BIC
                    </label>
                    <input
                      type="text"
                      value={formData.datosBancarios.swift}
                      onChange={(e) => setFormData({
                        ...formData,
                        datosBancarios: { ...formData.datosBancarios, swift: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="BSCHESMM"
                    />
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
