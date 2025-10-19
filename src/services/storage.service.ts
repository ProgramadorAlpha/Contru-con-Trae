/**
 * Storage Service
 * 
 * Service for managing file storage with project-based organization,
 * image compression, and secure access.
 * 
 * Requirements: 8, Performance, Security
 * Task: 6.1, 6.2, 6.3
 */

export interface UploadResult {
  url: string;
  size: number;
  mime_type: string;
  compressed: boolean;
}

export interface StorageUsage {
  proyecto_id: string;
  total_files: number;
  total_size_bytes: number;
  total_size_gb: number;
  by_type: Record<string, {
    count: number;
    size_bytes: number;
  }>;
}

export interface SignedUrlOptions {
  expirationMinutes?: number;
  download?: boolean;
  filename?: string;
}

class StorageService {
  private readonly MAX_IMAGE_SIZE_MB = 2;
  private readonly MAX_FILE_SIZE_MB = 20;
  private readonly STORAGE_BASE = '/storage';

  /**
   * Upload file with project-based organization
   * Structure: /proyectos/{id}/{tipo}/{archivo}
   * Requirement: 8
   * Task: 6.1
   */
  async uploadFile(
    proyectoId: string,
    tipo: string,
    file: File,
    options?: {
      compress?: boolean;
      userId?: string;
    }
  ): Promise<UploadResult> {
    try {
      // Validate file size
      const maxSize = this.isImage(file.type) 
        ? this.MAX_IMAGE_SIZE_MB 
        : this.MAX_FILE_SIZE_MB;
      
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size exceeds ${maxSize}MB limit`);
      }

      // Compress image if needed
      let fileToUpload = file;
      let compressed = false;

      if (this.isImage(file.type) && options?.compress !== false) {
        fileToUpload = await this.compressImage(file, this.MAX_IMAGE_SIZE_MB);
        compressed = fileToUpload.size < file.size;
      }

      // Generate file path
      const timestamp = Date.now();
      const sanitizedName = this.sanitizeFilename(file.name);
      const filePath = `${this.STORAGE_BASE}/proyectos/${proyectoId}/${tipo}/${timestamp}-${sanitizedName}`;

      // In real implementation, would upload to S3 or similar
      // For now, simulate upload
      console.log('Uploading file:', {
        path: filePath,
        size: fileToUpload.size,
        compressed
      });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        url: filePath,
        size: fileToUpload.size,
        mime_type: fileToUpload.type,
        compressed
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Compress image before upload
   * Requirement: Performance
   * Task: 6.2
   */
  async compressImage(file: File, maxSizeMB: number): Promise<File> {
    try {
      // Check if compression is needed
      if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
      }

      // Create image element
      const img = await this.loadImage(file);
      
      // Calculate new dimensions
      const maxDimension = 2048;
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      // Create canvas and compress
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels until size is acceptable
      let quality = 0.9;
      let blob: Blob | null = null;

      while (quality > 0.1) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (b) => resolve(b),
            'image/jpeg',
            quality
          );
        });

        if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
          break;
        }

        quality -= 0.1;
      }

      if (!blob) {
        throw new Error('Could not compress image');
      }

      // Create new File from blob
      const compressedFile = new File(
        [blob],
        file.name.replace(/\.[^/.]+$/, '.jpg'),
        { type: 'image/jpeg' }
      );

      console.log('Image compressed:', {
        original: file.size,
        compressed: compressedFile.size,
        reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
      });

      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      // Return original file if compression fails
      return file;
    }
  }

  /**
   * Get signed URL for secure file access
   * Requirement: Security
   * Task: 6.3
   */
  async getSignedUrl(
    fileUrl: string,
    options: SignedUrlOptions = {}
  ): Promise<string> {
    try {
      const {
        expirationMinutes = 60,
        download = false,
        filename
      } = options;

      // In real implementation, would generate signed URL with expiration
      // For now, return URL with query parameters
      const url = new URL(fileUrl, window.location.origin);
      url.searchParams.set('expires', (Date.now() + expirationMinutes * 60 * 1000).toString());
      
      if (download) {
        url.searchParams.set('download', '1');
      }
      
      if (filename) {
        url.searchParams.set('filename', filename);
      }

      // In real implementation, would add signature
      // url.searchParams.set('signature', generateSignature(url.pathname, expiration));

      return url.toString();
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // In real implementation, would delete from S3 or similar
      console.log('Deleting file:', fileUrl);
      
      // Simulate deletion delay
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get storage usage for a project
   */
  async getProjectStorageUsage(proyectoId: string): Promise<StorageUsage> {
    try {
      // In real implementation, would query database or storage service
      // For now, return mock data
      return {
        proyecto_id: proyectoId,
        total_files: 0,
        total_size_bytes: 0,
        total_size_gb: 0,
        by_type: {
          'Contrato': { count: 0, size_bytes: 0 },
          'Plano': { count: 0, size_bytes: 0 },
          'Factura': { count: 0, size_bytes: 0 },
          'Permiso': { count: 0, size_bytes: 0 },
          'Reporte': { count: 0, size_bytes: 0 },
          'Certificado': { count: 0, size_bytes: 0 },
          'Otro': { count: 0, size_bytes: 0 }
        }
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      throw error;
    }
  }

  /**
   * Copy file to new location
   */
  async copyFile(
    sourceUrl: string,
    destinationProyectoId: string,
    destinationTipo: string
  ): Promise<string> {
    try {
      // Extract filename from source URL
      const filename = sourceUrl.split('/').pop() || 'file';
      const newPath = `${this.STORAGE_BASE}/proyectos/${destinationProyectoId}/${destinationTipo}/${filename}`;

      // In real implementation, would copy file in storage
      console.log('Copying file:', { from: sourceUrl, to: newPath });

      return newPath;
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  /**
   * Move file to new location
   */
  async moveFile(
    sourceUrl: string,
    destinationProyectoId: string,
    destinationTipo: string
  ): Promise<string> {
    try {
      const newPath = await this.copyFile(sourceUrl, destinationProyectoId, destinationTipo);
      await this.deleteFile(sourceUrl);
      return newPath;
    } catch (error) {
      console.error('Error moving file:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileUrl: string): Promise<{
    size: number;
    mime_type: string;
    last_modified: string;
  }> {
    try {
      // In real implementation, would fetch metadata from storage
      return {
        size: 0,
        mime_type: 'application/octet-stream',
        last_modified: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // Helper methods

  private isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  private sanitizeFilename(filename: string): string {
    // Remove special characters and spaces
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2);
        return file.type.startsWith(prefix);
      }
      return file.type === type;
    });
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
