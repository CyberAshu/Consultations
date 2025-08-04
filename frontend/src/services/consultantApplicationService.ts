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
}

export const consultantApplicationService = new ConsultantApplicationService();
