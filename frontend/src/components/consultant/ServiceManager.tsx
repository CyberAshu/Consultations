import React, { useState, useEffect } from 'react';
import { 
  ConsultantServiceInDB, 
  ServiceTemplate, 
  ConsultantServiceUpdate 
} from '../../services/types';
import { consultantService } from '../../services/consultantService';
import { serviceTemplateService } from '../../services/serviceTemplateService';

interface ServiceManagerProps {
  consultantId: number;
}

export function ServiceManager({ consultantId }: ServiceManagerProps) {
  const [services, setServices] = useState<ConsultantServiceInDB[]>([]);
  const [templates, setTemplates] = useState<ServiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    duration: number;
    price: number;
    description: string;
    is_active: boolean;
  }>({
    duration: 15,
    price: 0,
    description: '',
    is_active: false
  });

  useEffect(() => {
    loadData();
  }, [consultantId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, templatesData] = await Promise.all([
        consultantService.getAllConsultantServices(consultantId),
        serviceTemplateService.getServiceTemplates()
      ]);
      setServices(servicesData);
      setTemplates(templatesData);
    } catch (err) {
      setError('Failed to load services and templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTemplateForService = (service: ConsultantServiceInDB): ServiceTemplate | undefined => {
    return templates.find(t => t.id === service.service_template_id);
  };

  const handleEdit = (service: ConsultantServiceInDB) => {
    setEditingService(service.id);
    setEditForm({
      duration: service.duration,
      price: service.price,
      description: service.description || '',
      is_active: service.is_active
    });
  };

  const handleSave = async (serviceId: number) => {
    try {
      const updateData: ConsultantServiceUpdate = {
        duration: editForm.duration,
        price: editForm.price,
        description: editForm.description,
        is_active: editForm.is_active
      };

      await consultantService.updateConsultantService(consultantId, serviceId, updateData);
      await loadData(); // Reload data
      setEditingService(null);
    } catch (err) {
      setError('Failed to update service');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditingService(null);
    setEditForm({ duration: 15, price: 0, description: '', is_active: false });
  };

  const validateDuration = (duration: number): boolean => {
    return duration >= 15;
  };

  const validatePrice = (price: number, template: ServiceTemplate): boolean => {
    return consultantService.validateServicePrice(price, template);
  };

  if (loading) {
    return <div className="p-4">Loading services...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Your Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            You have access to 8 predefined immigration consulting services. 
            You can customize the price and description for each service within the allowed ranges.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {services.map((service) => {
            const template = getTemplateForService(service);
            const isEditing = editingService === service.id;
            
            return (
              <div key={service.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.duration} minutes</p>
                    
                    {isEditing ? (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Duration (minimum 15 minutes)
                          </label>
                          <input
                            type="number"
                            min={15}
                            step={5}
                            value={editForm.duration}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              duration: parseInt(e.target.value) || 15
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {!validateDuration(editForm.duration) && (
                            <p className="text-red-600 text-sm mt-1">
                              Duration must be at least 15 minutes
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Price (${template?.min_price} - ${template?.max_price})
                          </label>
                          <input
                            type="number"
                            min={template?.min_price}
                            max={template?.max_price}
                            step={0.01}
                            value={editForm.price}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              price: parseFloat(e.target.value) || 0
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          {template && !validatePrice(editForm.price, template) && (
                            <p className="text-red-600 text-sm mt-1">
                              Price must be between ${template.min_price} and ${template.max_price}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Custom Description
                          </label>
                          <textarea
                            rows={4}
                            value={editForm.description}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              description: e.target.value
                            })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder={template?.default_description}
                          />
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              is_active: e.target.checked
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm text-gray-900">
                            Service is active and available for booking
                          </label>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleSave(service.id)}
                            disabled={(template && !validatePrice(editForm.price, template)) || !validateDuration(editForm.duration)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-gray-700">{service.description}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <span className="text-lg font-semibold text-green-600">
                            ${service.price}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            service.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {template && (
                            <span className="text-sm text-gray-500">
                              Range: ${template.min_price} - ${template.max_price}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(service)}
                      className="ml-4 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Important Notes:</h3>
        <ul className="mt-2 text-sm text-blue-800 space-y-1">
          <li>• You cannot add custom services - only the 8 predefined services are available</li>
          <li>• Prices must be within the specified range for each service</li>
          <li>• You can customize the description to reflect your experience and approach</li>
          <li>• Only active services will be visible to clients for booking</li>
        </ul>
      </div>
    </div>
  );
}
