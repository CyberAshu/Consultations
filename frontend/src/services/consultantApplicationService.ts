import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './api';
import { ConsultantApplication } from './types';

class ConsultantApplicationService {
  // Create a new consultant application
  async createApplication(applicationData: FormData): Promise<ConsultantApplication> {
    return apiPostFormData<ConsultantApplication>('/consultant-applications', applicationData);
  }

  // Get all consultant applications (admin only)
  async getApplications(filters?: { 
    skip?: number; 
    limit?: number; 
    status?: string; 
  }): Promise<ConsultantApplication[]> {
    return apiGet<ConsultantApplication[]>('/consultant-applications', filters);
  }

  // Get application statistics (admin only)
  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return apiGet<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>('/consultant-applications/stats');
  }

  // Get specific application by ID
  async getApplicationById(applicationId: number): Promise<ConsultantApplication> {
    return apiGet<ConsultantApplication>(`/consultant-applications/${applicationId}`);
  }

  // Update application (admin only)
  async updateApplication(
    applicationId: number, 
    updateData: Partial<ConsultantApplication>
  ): Promise<ConsultantApplication> {
    return apiPut<ConsultantApplication>(`/consultant-applications/${applicationId}`, updateData);
  }

  // Approve application (admin only)
  async approveApplication(applicationId: number): Promise<ConsultantApplication> {
    return apiPost<ConsultantApplication>(`/consultant-applications/${applicationId}/approve`);
  }

  // Reject application (admin only)
  async rejectApplication(applicationId: number): Promise<ConsultantApplication> {
    return apiPost<ConsultantApplication>(`/consultant-applications/${applicationId}/reject`);
  }

  // Delete application (admin only)
  async deleteApplication(applicationId: number): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`/consultant-applications/${applicationId}`);
  }

  // View/Download document by filename
  async viewDocument(filename: string): Promise<void> {
    try {
      // Get signed URL from backend using our apiGet helper
      const data = await apiGet<{url: string}>(`/consultant-applications/documents/${filename}`);
      
      if (data.url) {
        // Open document in new tab/window
        window.open(data.url, '_blank');
      } else {
        throw new Error('No URL received from server');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      alert('Failed to open document. Please try again.');
    }
  }

  // Get document URL for viewing
  getDocumentUrl(filename: string): string {
    const baseUrl = process.env.REACT_APP_API_BASE_URL;
    return `${baseUrl}/api/v1/consultant-applications/documents/${filename}`;
  }
}

export const consultantApplicationService = new ConsultantApplicationService();
