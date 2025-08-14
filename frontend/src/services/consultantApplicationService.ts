import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './api';
import { ConsultantApplication } from './types';

class ConsultantApplicationService {
  // Create initial application with only Section 1
  async createInitialApplication(applicationData: FormData): Promise<ConsultantApplication> {
    return apiPostFormData<ConsultantApplication>('/consultant-applications/section1', applicationData);
  }

  // Create a complete consultant application
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

  // Request additional sections from applicant (Admin only)
  async requestAdditionalSections(applicationId: number, sections: number[]): Promise<ConsultantApplication> {
    const formData = new FormData();
    sections.forEach(section => formData.append('sections', section.toString()));
    return apiPostFormData<ConsultantApplication>(`/consultant-applications/${applicationId}/request-sections`, formData, 'PUT');
  }

  // Complete additional sections for existing application
  async completeAdditionalSections(applicationId: number, applicationData: FormData): Promise<ConsultantApplication> {
    return apiPostFormData<ConsultantApplication>(`/consultant-applications/${applicationId}/complete-sections`, applicationData, 'PUT');
  }

  // Upload additional document (Admin only)
  async uploadAdditionalDocument(applicationId: number, file: File): Promise<{
    message: string;
    document: {
      filename: string;
      original_name: string;
      file_path: string;
      uploaded_by: string;
      uploaded_at: string;
    };
    application_id: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiPostFormData<{
      message: string;
      document: {
        filename: string;
        original_name: string;
        file_path: string;
        uploaded_by: string;
        uploaded_at: string;
      };
      application_id: number;
    }>(`/consultant-applications/${applicationId}/additional-documents`, formData);
  }

  // Update admin notes (Admin only)
  async updateAdminNotes(applicationId: number, adminNotes: string): Promise<ConsultantApplication> {
    const formData = new FormData();
    formData.append('admin_notes', adminNotes);
    
    return apiPostFormData<ConsultantApplication>(
      `/consultant-applications/${applicationId}/admin-notes`, 
      formData,
      'PUT'
    );
  }

  // Delete additional document (Admin only)
  async deleteAdditionalDocument(applicationId: number, documentFilename: string): Promise<{ message: string }> {
    return apiDelete<{ message: string }>(`/consultant-applications/${applicationId}/additional-documents/${documentFilename}`);
  }

  // Send credentials to consultant (Admin only)
  async sendCredentials(applicationId: number): Promise<{
    success: boolean;
    message: string;
    email: string;
    full_name: string;
  }> {
    return apiPost<{
      success: boolean;
      message: string;
      email: string;
      full_name: string;
    }>(`/consultant-applications/${applicationId}/send-credentials`);
  }
}

export const consultantApplicationService = new ConsultantApplicationService();
