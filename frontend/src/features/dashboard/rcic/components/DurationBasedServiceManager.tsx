import React, { useState, useEffect } from 'react';
import { 
  ConsultantServiceWithPricing,
  ServiceDurationOption,
  ConsultantServicePricing,
  BulkPricingUpdate
} from '../../../../types/service.types';
import { consultantService } from '../../../../api/services/consultant.service';

interface DurationBasedServiceManagerProps {
  consultantId: number;
}

interface PricingFormData {
  [durationOptionId: number]: {
    price: number;
    is_active: boolean;
  };
}

export function DurationBasedServiceManager({ consultantId }: DurationBasedServiceManagerProps) {
  const [services, setServices] = useState<ConsultantServiceWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [pricingForms, setPricingForms] = useState<{ [serviceId: number]: PricingFormData }>({});
  const [savingService, setSavingService] = useState<number | null>(null);

  useEffect(() => {
    loadServicesWithPricing();
  }, [consultantId]);

  const loadServicesWithPricing = async () => {
    try {
      setLoading(true);
      setError(null);
      const servicesData = await consultantService.getConsultantServicesWithPricing(consultantId, false);
      setServices(servicesData);
      
      // Initialize pricing forms for services that don't have pricing set
      for (const service of servicesData) {
        if (service.pricing_options.length === 0) {
          await initializeServicePricing(service.id);
        }
      }
      
      // Reload after initialization
      const updatedServicesData = await consultantService.getConsultantServicesWithPricing(consultantId, false);
      setServices(updatedServicesData);
      
    } catch (err) {
      setError('Failed to load services with pricing information');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const initializeServicePricing = async (serviceId: number) => {
    try {
      await consultantService.initializeServicePricing(consultantId, serviceId);
    } catch (err) {
      console.error('Failed to initialize pricing for service:', serviceId, err);
    }
  };

  const handleEdit = (service: ConsultantServiceWithPricing) => {
    setEditingService(service.id);
    
    // Initialize the form data for this service
    const formData: PricingFormData = {};
    service.pricing_options.forEach(pricing => {
      formData[pricing.duration_option_id] = {
        price: pricing.price,
        is_active: pricing.is_active
      };
    });
    
    setPricingForms({
      ...pricingForms,
      [service.id]: formData
    });
  };

  const handlePriceChange = (serviceId: number, durationOptionId: number, price: number) => {
    setPricingForms({
      ...pricingForms,
      [serviceId]: {
        ...pricingForms[serviceId],
        [durationOptionId]: {
          ...pricingForms[serviceId][durationOptionId],
          price
        }
      }
    });
  };

  const handleActiveToggle = (serviceId: number, durationOptionId: number, is_active: boolean) => {
    setPricingForms({
      ...pricingForms,
      [serviceId]: {
        ...pricingForms[serviceId],
        [durationOptionId]: {
          ...pricingForms[serviceId][durationOptionId],
          is_active
        }
      }
    });
  };

  const handleSave = async (serviceId: number) => {
    try {
      setSavingService(serviceId);
      const formData = pricingForms[serviceId];
      
      if (!formData) {
        throw new Error('No pricing data to save');
      }

      const pricingOptions = Object.entries(formData).map(([durationOptionId, data]) => ({
        consultant_service_id: serviceId,
        duration_option_id: parseInt(durationOptionId),
        price: data.price,
        is_active: data.is_active
      }));

      const bulkUpdate: BulkPricingUpdate = {
        consultant_service_id: serviceId,
        pricing_options: pricingOptions
      };

      await consultantService.setServicePricing(consultantId, serviceId, bulkUpdate);
      await loadServicesWithPricing(); // Reload data
      setEditingService(null);
      
      // Clear the form data
      const updatedForms = { ...pricingForms };
      delete updatedForms[serviceId];
      setPricingForms(updatedForms);
      
    } catch (err) {
      setError('Failed to update service pricing');
      console.error('Error saving pricing:', err);
    } finally {
      setSavingService(null);
    }
  };

  const handleCancel = (serviceId: number) => {
    setEditingService(null);
    
    // Clear the form data
    const updatedForms = { ...pricingForms };
    delete updatedForms[serviceId];
    setPricingForms(updatedForms);
  };

  const validatePrice = (price: number, durationOption: ServiceDurationOption): boolean => {
    return consultantService.validateDurationPrice(price, durationOption);
  };

  const getDurationOption = (pricing: ConsultantServicePricing): ServiceDurationOption | undefined => {
    return pricing.duration_option;
  };

  const hasValidationErrors = (serviceId: number): boolean => {
    const formData = pricingForms[serviceId];
    if (!formData) return false;

    const service = services.find(s => s.id === serviceId);
    if (!service) return false;

    return service.pricing_options.some(pricing => {
      const durationOption = getDurationOption(pricing);
      if (!durationOption) return false;
      
      const formEntry = formData[pricing.duration_option_id];
      return formEntry?.is_active && !validatePrice(formEntry.price, durationOption);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadServicesWithPricing}
          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Manage Your Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            Set individual prices for different consultation durations. Each service can have multiple duration options with separate pricing.
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {services.map((service) => {
            const isEditing = editingService === service.id;
            const isSaving = savingService === service.id;
            const formData = pricingForms[service.id] || {};
            
            return (
              <div key={service.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    
                    {isEditing ? (
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Duration Options & Pricing</h4>
                        <div className="space-y-4">
                          {service.pricing_options.map((pricing) => {
                            const durationOption = getDurationOption(pricing);
                            if (!durationOption) return null;
                            
                            const formEntry = formData[pricing.duration_option_id] || {
                              price: pricing.price,
                              is_active: pricing.is_active
                            };
                            
                            const isValidPrice = validatePrice(formEntry.price, durationOption);
                            
                            return (
                              <div key={pricing.id} className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h5 className="font-medium text-gray-900">
                                      {durationOption.duration_label} ({durationOption.duration_minutes} minutes)
                                    </h5>
                                    <p className="text-sm text-gray-600">
                                      Allowed range: ${durationOption.min_price} - ${durationOption.max_price}
                                    </p>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={formEntry.is_active}
                                      onChange={(e) => handleActiveToggle(service.id, pricing.duration_option_id, e.target.checked)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 text-sm text-gray-900">Active</label>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                      Price ($)
                                    </label>
                                    <input
                                      type="number"
                                      min={durationOption.min_price}
                                      max={durationOption.max_price}
                                      step={0.01}
                                      value={formEntry.price}
                                      onChange={(e) => handlePriceChange(
                                        service.id, 
                                        pricing.duration_option_id, 
                                        parseFloat(e.target.value) || 0
                                      )}
                                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                        !isValidPrice && formEntry.is_active ? 'border-red-300 bg-red-50' : ''
                                      }`}
                                    />
                                    {!isValidPrice && formEntry.is_active && (
                                      <p className="text-red-600 text-sm mt-1">
                                        Price must be between ${durationOption.min_price} and ${durationOption.max_price}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex space-x-3 mt-6">
                          <button
                            onClick={() => handleSave(service.id)}
                            disabled={isSaving || hasValidationErrors(service.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                          >
                            {isSaving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </button>
                          <button
                            onClick={() => handleCancel(service.id)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        {service.pricing_options.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Current Pricing</h4>
                            {service.pricing_options
                              .filter(p => p.is_active)
                              .map(pricing => (
                              <div key={pricing.id} className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-700">
                                  {pricing.duration_option?.duration_label}
                                </span>
                                <span className="font-semibold text-green-600">
                                  ${pricing.price}
                                </span>
                              </div>
                            ))}
                            {service.pricing_options.filter(p => p.is_active).length === 0 && (
                              <p className="text-sm text-gray-500">No active pricing options set</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No pricing set for this service
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(service)}
                      className="ml-4 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100"
                    >
                      Edit Pricing
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900">Duration-Based Pricing Guide:</h3>
        <ul className="mt-2 text-sm text-blue-800 space-y-1">
          <li>• Each service offers multiple consultation durations (e.g., 30 min, 1 hour, 1.5 hours)</li>
          <li>• You can set different prices for each duration within admin-defined ranges</li>
          <li>• Only activate durations you want to offer to clients</li>
          <li>• Clients will see your pricing when booking and can choose their preferred duration</li>
          <li>• You must set pricing for at least one duration before clients can book your services</li>
        </ul>
      </div>
    </div>
  );
}
