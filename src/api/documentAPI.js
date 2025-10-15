import { mockDocuments, mockProjects } from '../lib/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for documents
let documents = [...mockDocuments];

export const documentAPI = {
  async getAll() {
    await delay(300);
    return documents;
  },

  async getDocuments() {
    await delay(300);
    return documents;
  },

  async getDocument(id) {
    await delay(200);
    const document = documents.find(d => d.id === id);
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    return document;
  },

  async getById(id) {
    await delay(200);
    const document = documents.find(d => d.id === id);
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    return document;
  },

  async getByProject(projectId) {
    await delay(300);
    return documents.filter(d => d.projectId === projectId);
  },

  async getProjects() {
    await delay(300);
    return mockProjects;
  },

  async getCategories() {
    await delay(200);
    const categories = [...new Set(documents.map(d => d.category).filter(Boolean))];
    return categories.length > 0 ? categories : ['Planos', 'Contratos', 'Facturas', 'Presupuestos', 'Informes', 'General'];
  },

  async getTypes() {
    await delay(200);
    const types = [...new Set(documents.map(d => d.type).filter(Boolean))];
    return types.length > 0 ? types : ['PDF', 'DWG', 'XLSX', 'DOCX', 'JPG', 'PNG', 'ZIP'];
  },

  async delete(documentId) {
    await delay(400);
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) {
      throw new Error('Documento no encontrado');
    }
    documents.splice(index, 1);
    return { success: true };
  },

  async download(document) {
    await delay(500);
    // Simulate file download
    const blob = new Blob(['Document content'], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true };
  },

  async upload(file, metadata = {}) {
    await delay(1000);
    const newDocument = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      category: metadata.category || 'general',
      projectId: metadata.projectId || null,
      phase: metadata.phase || 'planning',
      uploadDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      status: 'active',
      tags: metadata.tags || [],
      description: metadata.description || '',
      author: 'Usuario actual',
      version: '1.0.0',
      permissions: {
        view: true,
        edit: true,
        delete: true,
        share: true,
        download: true
      }
    };
    documents.push(newDocument);
    return newDocument;
  },

  async update(documentId, updates) {
    await delay(300);
    const document = documents.find(d => d.id === documentId);
    if (!document) {
      throw new Error('Documento no encontrado');
    }
    Object.assign(document, updates, { lastModified: new Date().toISOString() });
    return document;
  },

  async search(query, filters = {}) {
    await delay(400);
    let results = documents;

    if (query) {
      results = results.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.description?.toLowerCase().includes(query.toLowerCase()) ||
        (d.tags || []).some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (filters.category) {
      results = results.filter(d => d.category === filters.category);
    }

    if (filters.type) {
      results = results.filter(d => d.type === filters.type);
    }

    if (filters.projectId) {
      results = results.filter(d => d.projectId === filters.projectId);
    }

    if (filters.phase) {
      results = results.filter(d => d.phase === filters.phase);
    }

    if (filters.dateFrom) {
      results = results.filter(d => new Date(d.uploadDate) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      results = results.filter(d => new Date(d.uploadDate) <= new Date(filters.dateTo));
    }

    return {
      documents: results,
      total: results.length,
      page: filters.page || 1,
      pageSize: filters.pageSize || 20
    };
  }
};

export default documentAPI;