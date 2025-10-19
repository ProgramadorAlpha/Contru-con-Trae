/**
 * StorageService Tests
 * 
 * Unit tests for StorageService
 */

import { describe, it, expect } from 'vitest';
import { storageService } from './storage.service';

describe('StorageService', () => {
  describe('uploadFile', () => {
    it('should upload a file', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await storageService.uploadFile('proj-1', 'Contrato', mockFile);

      expect(result).toBeDefined();
      expect(result.url).toContain('/proyectos/proj-1/Contrato/');
      expect(result.size).toBe(mockFile.size);
      expect(result.mime_type).toBe('application/pdf');
    });

    it('should reject files that are too large', async () => {
      // Create a large file (21MB)
      const largeContent = new Array(21 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

      await expect(
        storageService.uploadFile('proj-1', 'Contrato', largeFile)
      ).rejects.toThrow('exceeds');
    });

    it('should organize files by project and type', async () => {
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const result = await storageService.uploadFile('proj-123', 'Factura', mockFile);

      expect(result.url).toContain('/proyectos/proj-123/Factura/');
    });
  });

  describe('compressImage', () => {
    it('should return original file if already small enough', async () => {
      const smallImage = new File(['small'], 'small.jpg', { type: 'image/jpeg' });
      
      const result = await storageService.compressImage(smallImage, 2);

      expect(result.size).toBeLessThanOrEqual(2 * 1024 * 1024);
    });
  });

  describe('getSignedUrl', () => {
    it('should generate a signed URL', async () => {
      const fileUrl = '/storage/proyectos/proj-1/Contrato/test.pdf';
      
      const signedUrl = await storageService.getSignedUrl(fileUrl);

      expect(signedUrl).toContain(fileUrl);
      expect(signedUrl).toContain('expires=');
    });

    it('should include download parameter when requested', async () => {
      const fileUrl = '/storage/test.pdf';
      
      const signedUrl = await storageService.getSignedUrl(fileUrl, {
        download: true
      });

      expect(signedUrl).toContain('download=1');
    });

    it('should include custom filename when provided', async () => {
      const fileUrl = '/storage/test.pdf';
      
      const signedUrl = await storageService.getSignedUrl(fileUrl, {
        filename: 'custom-name.pdf'
      });

      expect(signedUrl).toContain('filename=custom-name.pdf');
    });
  });

  describe('getProjectStorageUsage', () => {
    it('should return storage usage statistics', async () => {
      const usage = await storageService.getProjectStorageUsage('proj-1');

      expect(usage).toBeDefined();
      expect(usage.proyecto_id).toBe('proj-1');
      expect(usage).toHaveProperty('total_files');
      expect(usage).toHaveProperty('total_size_bytes');
      expect(usage).toHaveProperty('total_size_gb');
      expect(usage).toHaveProperty('by_type');
    });

    it('should include breakdown by document type', async () => {
      const usage = await storageService.getProjectStorageUsage('proj-1');

      expect(usage.by_type).toHaveProperty('Contrato');
      expect(usage.by_type).toHaveProperty('Plano');
      expect(usage.by_type).toHaveProperty('Factura');
    });
  });

  describe('validateFileType', () => {
    it('should validate exact mime types', () => {
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      
      const isValid = storageService.validateFileType(pdfFile, ['application/pdf']);

      expect(isValid).toBe(true);
    });

    it('should validate wildcard mime types', () => {
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      
      const isValid = storageService.validateFileType(imageFile, ['image/*']);

      expect(isValid).toBe(true);
    });

    it('should reject invalid types', () => {
      const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      const isValid = storageService.validateFileType(textFile, ['application/pdf', 'image/*']);

      expect(isValid).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(storageService.formatFileSize(0)).toBe('0 Bytes');
      expect(storageService.formatFileSize(1024)).toBe('1 KB');
      expect(storageService.formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(storageService.formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      const result = storageService.formatFileSize(1536); // 1.5 KB
      expect(result).toContain('1.5');
      expect(result).toContain('KB');
    });
  });
});
