import { apiGet, apiPost, apiPut, apiDelete, apiPostFormData } from './api';
import { 
  Consultant, 
  ConsultantFilters,
  ConsultantServiceInDB,
  ConsultantServiceCreate,
  ConsultantServiceUpdate,
} from './types';

class ConsultantService {
  // Get list of consultants with optional filters
  async getConsultants(filters: ConsultantFilters = {}): Promise<Consultant[]> {
    return apiGet<Consultant[]>('/consultants', filters);
  }

  // Get consultant details by ID
  async getConsultantById(consultantId: number): Promise<Consultant> {
    return apiGet<Consultant>(`/consultants/${consultantId}`);
  }

  // Create new consultant
  async createConsultant(data: Partial<Consultant>): Promise<Consultant> {
    return apiPost<Consultant>('/consultants', data);
  }

  // Update consultant information
  async updateConsultant(consultantId: number, data: Partial<Consultant>): Promise<Consultant> {
    return apiPut<Consultant>(`/consultants/${consultantId}`, data);
  }
  
  // Get available time slots for a consultant
  async getConsultantAvailability(consultantId: number, date: string): Promise<{ date: string; slots: string[] }> {
    return apiGet<{ date: string; slots: string[] }>(`/consultants/${consultantId}/availability`, { date });
  }

  // Post a review for a consultant
  async postConsultantReview(consultantId: number, reviewData: { rating: number; comment: string }): Promise<void> {
    return apiPost<void>(`/consultants/${consultantId}/reviews`, reviewData);
  }

  // Service management methods
  async getConsultantServices(consultantId: number): Promise<ConsultantServiceInDB[]> {
    return apiGet<ConsultantServiceInDB[]>(`/consultants/${consultantId}/services`);
  }

  async createConsultantService(consultantId: number, serviceData: ConsultantServiceCreate): Promise<ConsultantServiceInDB> {
    return apiPost<ConsultantServiceInDB>(`/consultants/${consultantId}/services`, serviceData);
  }

  async updateConsultantService(consultantId: number, serviceId: number, serviceData: ConsultantServiceUpdate): Promise<ConsultantServiceInDB> {
    return apiPut<ConsultantServiceInDB>(`/consultants/${consultantId}/services/${serviceId}`, serviceData);
  }

  async deleteConsultantService(consultantId: number, serviceId: number): Promise<void> {
    return apiDelete<void>(`/consultants/${consultantId}/services/${serviceId}`);
  }

  // Profile management methods
  async updateConsultantProfile(consultantId: number, profileData: Partial<Consultant>): Promise<Consultant> {
    return apiPut<Consultant>(`/consultants/${consultantId}`, profileData);
  }

  // Upload profile image
  async uploadProfileImage(file: File): Promise<{url: string, filename: string, path: string}> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiPostFormData<{url: string, filename: string, path: string}>('/uploads/profile-image', formData);
  }
}

export const consultantService = new ConsultantService();

