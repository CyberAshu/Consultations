import { apiGet, apiPost, apiPut, apiPatch, apiPostFormData } from '../client';
import { 
  Consultant, 
  ConsultantFilters,
  ConsultantServiceInDB,
  ConsultantServiceCreate,
  ConsultantServiceUpdate,
  ConsultantServiceWithPricing,
  ServicePricingOptions,
  BulkPricingUpdate,
  ServiceDurationOption,
} from '../../types/service.types';

class ConsultantService {
  // Get list of consultants with optional filters
  async getConsultants(filters: ConsultantFilters = {}): Promise<Consultant[]> {
    // Use trailing slash to match FastAPI route mounted at "/consultants/" and avoid 307 redirects
    return apiGet<Consultant[]>('/consultants/', filters);
  }

  // Get consultant details by ID
  async getConsultantById(consultantId: number): Promise<Consultant> {
    return apiGet<Consultant>(`/consultants/${consultantId}`);
  }

  // Create new consultant
  async createConsultant(data: Partial<Consultant>): Promise<Consultant> {
    // Trailing slash to match FastAPI route and avoid 307
    return apiPost<Consultant>('/consultants/', data);
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

  // Get all consultant services (including inactive ones) for management
  async getAllConsultantServices(consultantId: number): Promise<ConsultantServiceInDB[]> {
    // Updated to use the new endpoint that returns all services for consultant's own management
    return apiGet<ConsultantServiceInDB[]>(`/consultants/${consultantId}/services`);
  }

  // Get only active services for public view (for booking) - no authentication required
  async getActiveConsultantServices(consultantId: number): Promise<ConsultantServiceInDB[]> {
    return apiGet<ConsultantServiceInDB[]>(`/consultants/${consultantId}/services/active`);
  }

  // Get consultant services - public or authenticated based on user status
  async getConsultantServicesPublic(consultantId: number, isAuthenticated: boolean = false): Promise<ConsultantServiceInDB[]> {
    if (isAuthenticated) {
      // Use authenticated endpoint for full access
      return apiGet<ConsultantServiceInDB[]>(`/consultants/${consultantId}/services`);
    } else {
      // Use public endpoint for unauthenticated users
      return apiGet<ConsultantServiceInDB[]>(`/consultants/${consultantId}/services/active`);
    }
  }

  async createConsultantService(consultantId: number, serviceData: ConsultantServiceCreate): Promise<ConsultantServiceInDB> {
    // Validate that service_template_id is provided
    if (!serviceData.service_template_id) {
      throw new Error('Service template is required. Custom services are not allowed.');
    }
    return apiPost<ConsultantServiceInDB>(`/consultants/${consultantId}/services`, serviceData);
  }

  async updateConsultantService(consultantId: number, serviceId: number, serviceData: ConsultantServiceUpdate): Promise<ConsultantServiceInDB> {
    return apiPut<ConsultantServiceInDB>(`/consultants/${consultantId}/services/${serviceId}`, serviceData);
  }

  // Toggle service active/inactive status (replaces delete functionality)
  async toggleConsultantService(consultantId: number, serviceId: number): Promise<{
    success: boolean;
    message: string;
    service_id: number;
    is_active: boolean;
    service_name: string;
  }> {
    return apiPatch<{
      success: boolean;
      message: string;
      service_id: number;
      is_active: boolean;
      service_name: string;
    }>(`/consultants/${consultantId}/services/${serviceId}/toggle`);
  }

  // Validate price against template range
  validateServicePrice(price: number, template: { min_price: number; max_price: number }): boolean {
    return price >= template.min_price && price <= template.max_price;
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

  // Duration-based pricing methods
  
  // Get services with pricing options for RCIC management
  async getConsultantServicesWithPricing(consultantId: number, activeOnly = false): Promise<ConsultantServiceWithPricing[]> {
    return apiGet<ConsultantServiceWithPricing[]>(
      `/consultants/${consultantId}/services-with-pricing`,
      { active_only: activeOnly }
    );
  }

  // Get pricing options for a specific service
  async getServicePricingOptions(consultantId: number, serviceId: number): Promise<ServicePricingOptions> {
    return apiGet<ServicePricingOptions>(`/consultants/${consultantId}/services/${serviceId}/pricing-options`);
  }

  // Set pricing for a service's duration options
  async setServicePricing(consultantId: number, serviceId: number, pricingData: BulkPricingUpdate): Promise<{
    success: boolean;
    message: string;
    service_id: number;
    updated_pricing: any[];
  }> {
    return apiPost<{
      success: boolean;
      message: string;
      service_id: number;
      updated_pricing: any[];
    }>(`/consultants/${consultantId}/services/${serviceId}/set-pricing`, pricingData);
  }

  // Initialize default pricing for a service
  async initializeServicePricing(consultantId: number, serviceId: number): Promise<{
    success: boolean;
    message: string;
    service_id: number;
    pricing_options: any[];
  }> {
    return apiPost<{
      success: boolean;
      message: string;
      service_id: number;
      pricing_options: any[];
    }>(`/consultants/${consultantId}/services/${serviceId}/initialize-pricing`, {});
  }

  // Get duration options for a service template
  async getServiceTemplateDurationOptions(templateId: number): Promise<ServiceDurationOption[]> {
    return apiGet<ServiceDurationOption[]>(`/service-duration-options/template/${templateId}`);
  }

  // Validate price against duration option range
  validateDurationPrice(price: number, durationOption: ServiceDurationOption): boolean {
    return price >= durationOption.min_price && price <= durationOption.max_price;
  }
}

export const consultantService = new ConsultantService();

