import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ServiceTemplate, ServiceDurationOption, ServiceDurationOptionCreate, ServiceDurationOptionUpdate } from './types';

class ServiceTemplateService {
  // Get all active service templates
  async getServiceTemplates(): Promise<ServiceTemplate[]> {
    // Trailing slash to match FastAPI route and avoid 307
    return apiGet<ServiceTemplate[]>('/service-templates/');
  }

  // Get service template by ID
  async getServiceTemplateById(templateId: number): Promise<ServiceTemplate> {
    return apiGet<ServiceTemplate>(`/service-templates/${templateId}`);
  }

  // Admin only: Create new service template
  async createServiceTemplate(templateData: Partial<ServiceTemplate>): Promise<ServiceTemplate> {
    // Trailing slash to match FastAPI route and avoid 307
    return apiPost<ServiceTemplate>('/service-templates/', templateData);
  }

  // Admin only: Update service template
  async updateServiceTemplate(templateId: number, templateData: Partial<ServiceTemplate>): Promise<ServiceTemplate> {
    return apiPut<ServiceTemplate>(`/service-templates/${templateId}`, templateData);
  }

  // Admin only: Delete service template
  async deleteServiceTemplate(templateId: number): Promise<void> {
    return apiDelete<void>(`/service-templates/${templateId}`);
  }

  // Duration Options Management
  
  // Get duration options for a service template
  async getDurationOptionsForTemplate(templateId: number): Promise<ServiceDurationOption[]> {
    return apiGet<ServiceDurationOption[]>(`/service-duration-options/template/${templateId}`);
  }

  // Admin only: Create new duration option
  async createDurationOption(optionData: ServiceDurationOptionCreate): Promise<ServiceDurationOption> {
    // Trailing slash to match FastAPI route and avoid 307
    return apiPost<ServiceDurationOption>('/service-duration-options/', optionData);
  }

  // Admin only: Update duration option
  async updateDurationOption(optionId: number, optionData: ServiceDurationOptionUpdate): Promise<ServiceDurationOption> {
    return apiPut<ServiceDurationOption>(`/service-duration-options/${optionId}`, optionData);
  }

  // Admin only: Delete duration option
  async deleteDurationOption(optionId: number): Promise<void> {
    return apiDelete<void>(`/service-duration-options/${optionId}`);
  }
}

export const serviceTemplateService = new ServiceTemplateService();
