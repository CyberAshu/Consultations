import { apiGet, apiPost } from './api';
import { 
  Consultant, 
  ConsultantFilters,
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
    return apiPost<Consultant>(`/consultants/${consultantId}`, data);
  }
  
  // Get available time slots for a consultant
  async getConsultantAvailability(consultantId: number, date: string): Promise<{ date: string; slots: string[] }> {
    return apiGet<{ date: string; slots: string[] }>(`/consultants/${consultantId}/availability`, { date });
  }

  // Post a review for a consultant
  async postConsultantReview(consultantId: number, reviewData: { rating: number; comment: string }): Promise<void> {
    return apiPost<void>(`/consultants/${consultantId}/reviews`, reviewData);
  }
}

export const consultantService = new ConsultantService();

