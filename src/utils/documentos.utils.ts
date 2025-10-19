/**
 * Documentos Utilities
 * 
 * Utility functions for document formatting and display
 * Requirements: UX
 * Task: 16.4
 */

import { 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File, 
  FileCheck,
  FileBarChart,
  Award,
  Folder
} from 'lucide-react';

/**
 * Format file size from bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeDate(d);
  }

  const options: Intl.DateTimeFormatOptions = format === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: '2-digit', day: '2-digit' };

  return d.toLocaleDateString('es-MX', options);
}

/**
 * Format date as relative time (e.g., "hace 2 horas")
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'hace un momento';
  if (diffMins < 60) return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'semana' : 'semanas'}`;
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'mes' : 'meses'}`;
  return `hace ${Math.floor(diffDays / 365)} ${Math.floor(diffDays / 365) === 1 ? 'año' : 'años'}`;
}

/**
 * Get icon component for document type
 */
export function getDocumentIcon(tipo: string, mimeType?: string) {
  // Check by document type first
  switch (tipo) {
    case 'Contrato':
      return FileText;
    case 'Plano':
      return Image;
    case 'Factura':
      return FileCheck;
    case 'Permiso':
      return FileCheck;
    case 'Reporte':
      return FileBarChart;
    case 'Certificado':
      return Award;
    case 'Otro':
      return Folder;
    default:
      break;
  }

  // Check by MIME type
  if (mimeType) {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
    if (mimeType.includes('pdf')) return FileText;
  }

  return File;
}

/**
 * Get color classes for document type
 */
export function getDocumentColor(tipo: string): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  const colors = {
    'Contrato': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: 'text-blue-500'
    },
    'Plano': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: 'text-purple-500'
    },
    'Factura': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: 'text-green-500'
    },
    'Permiso': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      icon: 'text-yellow-500'
    },
    'Reporte': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: 'text-indigo-500'
    },
    'Certificado': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: 'text-orange-500'
    },
    'Otro': {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: 'text-gray-500'
    }
  };

  return colors[tipo as keyof typeof colors] || colors['Otro'];
}

/**
 * Get folder emoji for document type
 */
export function getFolderEmoji(tipo: string): string {
  const emojis: Record<string, string> = {
    'Contrato': '📄',
    'Plano': '📐',
    'Factura': '🧾',
    'Permiso': '✅',
    'Reporte': '📊',
    'Certificado': '🏆',
    'Otro': '📁'
  };

  return emojis[tipo] || '📁';
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Check if file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a PDF
 */
export function isPDFFile(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Get confidence level color
 */
export function getConfidenceColor(confidence: number): {
  bg: string;
  text: string;
  label: string;
} {
  if (confidence >= 80) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      label: 'Alta'
    };
  } else if (confidence >= 60) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      label: 'Media'
    };
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      label: 'Baja'
    };
  }
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      const prefix = type.slice(0, -2);
      return file.type.startsWith(prefix);
    }
    return file.type === type;
  });
}

/**
 * Get readable file type name
 */
export function getFileTypeName(mimeType: string): string {
  const types: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'Imagen JPEG',
    'image/png': 'Imagen PNG',
    'image/gif': 'Imagen GIF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'application/vnd.ms-excel': 'Excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel'
  };

  return types[mimeType] || 'Archivo';
}
