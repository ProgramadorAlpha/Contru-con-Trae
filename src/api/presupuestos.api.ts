/**
 * Presupuestos API - Task 6.2
 */
import type { Presupuesto } from '../types/presupuesto.types';

const API_BASE = '/api/presupuestos';

export const presupuestosAPI = {
  async getAll(): Promise<Presupuesto[]> {
    const response = await fetch(API_BASE);
    return response.json();
  },

  async getById(id: string): Promise<Presupuesto> {
    const response = await fetch(`${API_BASE}/${id}`);
    return response.json();
  },

  async create(data: Partial<Presupuesto>): Promise<Presupuesto> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async update(id: string, data: Partial<Presupuesto>): Promise<Presupuesto> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async enviar(id: string): Promise<Presupuesto> {
    const response = await fetch(`${API_BASE}/${id}/enviar`, { method: 'POST' });
    return response.json();
  },

  async aprobar(id: string): Promise<Presupuesto> {
    const response = await fetch(`${API_BASE}/${id}/aprobar`, { method: 'POST' });
    return response.json();
  },

  async rechazar(id: string, motivo: string): Promise<Presupuesto> {
    const response = await fetch(`${API_BASE}/${id}/rechazar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo })
    });
    return response.json();
  }
};
