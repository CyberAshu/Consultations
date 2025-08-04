import { apiPostFormData } from './api';

class UploadService {
  // Upload profile image
  async uploadProfileImage(file: File): Promise<{ url: string; filename: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiPostFormData<{ url: string; filename: string; path: string }>('/uploads/profile-image', formData);
  }

  // Upload document
  async uploadDocument(file: File): Promise<{ url: string; filename: string; original_name: string; path: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiPostFormData<{ url: string; filename: string; original_name: string; path: string }>('/uploads/document', formData);
  }
}

export const uploadService = new UploadService();
