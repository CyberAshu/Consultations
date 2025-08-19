import { apiGet, apiPost, apiPut, apiDelete } from './api';
import { ServiceTemplate } from './types';

class ServiceTemplateService {
  // Get all active service templates
  async getServiceTemplates(): Promise<ServiceTemplate[]> {
    return apiGet<ServiceTemplate[]>('/service-templates');
  }

  // Get service template by ID
  async getServiceTemplateById(templateId: number): Promise<ServiceTemplate> {
    return apiGet<ServiceTemplate>(`/service-templates/${templateId}`);
  }

  // Admin only: Create new service template
  async createServiceTemplate(templateData: Partial<ServiceTemplate>): Promise<ServiceTemplate> {
    return apiPost<ServiceTemplate>('/service-templates', templateData);
  }

  // Admin only: Update service template
  async updateServiceTemplate(templateId: number, templateData: Partial<ServiceTemplate>): Promise<ServiceTemplate> {
    return apiPut<ServiceTemplate>(`/service-templates/${templateId}`, templateData);
  }

  // Admin only: Delete service template
  async deleteServiceTemplate(templateId: number): Promise<void> {
    return apiDelete<void>(`/service-templates/${templateId}`);
  }
}

export const serviceTemplateService = new ServiceTemplateService();
