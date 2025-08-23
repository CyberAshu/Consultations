import React, { useState, useEffect } from 'react';
import { 
  ConsultantServiceWithPricing,
  ServiceDurationOption,
  ConsultantServicePricing,
  PriceCalculationResponse 
} from '../../../services/types';
import { consultantService } from '../../../services/consultantService';
import { bookingService } from '../../../services/bookingService';

interface ServiceSelectionData {
  serviceId: number;
  serviceName: string;
  durationOptionId: number;
  durationLabel: string;
  price: number;
  durationMinutes: number;
}

interface DurationBasedServiceSelectionProps {
  consultantId: number;
  onServiceSelect: (data: ServiceSelectionData) => void;
  selectedService?: ServiceSelectionData | null;
}

export function DurationBasedServiceSelection({
  consultantId,
  onServiceSelect,
  selectedService
}: DurationBasedServiceSelectionProps) {
  const [services, setServices] = useState<ConsultantServiceWithPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    selectedService?.serviceId || null
  );
  const [selectedDurationId, setSelectedDurationId] = useState<number | null>(
    selectedService?.durationOptionId || null
  );
  const [pricingInfo, setPricingInfo] = useState<PriceCalculationResponse | null>(null);

  useEffect(() => {
    loadServices();
  }, [consultantId]);

  useEffect(() => {
    if (selectedServiceId && selectedDurationId) {
      calculatePrice();
    }
  }, [selectedServiceId, selectedDurationId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      // Get only active services with pricing for public booking
      const servicesData = await consultantService.getConsultantServicesWithPricing(consultantId, true);
      // Filter to only show services that have at least one active pricing option
      const servicesWithActivePricing = servicesData.filter(service => 
        service.is_active && service.pricing_options.some(p => p.is_active)
      );
      setServices(servicesWithActivePricing);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    if (!selectedServiceId || !selectedDurationId) return;

    try {
      const priceData = await bookingService.calculateDurationPrice({
        service_id: selectedServiceId,
        duration_option_id: selectedDurationId
      });
      setPricingInfo(priceData);
      
      // Find the service and duration details
      const service = services.find(s => s.id === selectedServiceId);
      const pricing = service?.pricing_options.find(p => p.duration_option_id === selectedDurationId);
      
      if (service && pricing?.duration_option) {
        onServiceSelect({
          serviceId: selectedServiceId,
          serviceName: service.name,
          durationOptionId: selectedDurationId,
          durationLabel: pricing.duration_option.duration_label,
          price: priceData.price,
          durationMinutes: priceData.duration_minutes
        });
      }
    } catch (err) {
      setError('Failed to calculate price');
      console.error(err);
    }
  };

  const handleServiceChange = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setSelectedDurationId(null);
    setPricingInfo(null);
  };

  const handleDurationChange = (durationId: number) => {
    setSelectedDurationId(durationId);
  };

  const getSelectedService = () => {
    return services.find(s => s.id === selectedServiceId);
  };

  const getAvailableDurations = () => {
    const service = getSelectedService();
    if (!service) return [];
    
    return service.pricing_options
      .filter(p => p.is_active)
      .sort((a, b) => (a.duration_option?.duration_minutes || 0) - (b.duration_option?.duration_minutes || 0));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
          ))}
        </div>
        <p className="text-center text-gray-500">Loading available services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="text-red-600 mb-2">{error}</div>
        <button
          onClick={loadServices}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center p-6">
        <div className="text-gray-600 mb-2">
          This consultant hasn't set up pricing for their services yet.
        </div>
        <p className="text-sm text-gray-500">
          Please contact them directly or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Select a Service
        </h3>
        
        <div className="space-y-3">
          {services.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg">
              <label className="flex items-start p-4 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="service"
                  value={service.id}
                  checked={selectedServiceId === service.id}
                  onChange={() => handleServiceChange(service.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  {service.description && (
                    <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    Available durations: {service.pricing_options
                      .filter(p => p.is_active)
                      .map(p => p.duration_option?.duration_label)
                      .join(', ')}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {selectedServiceId && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Choose Duration & Pricing
          </h3>
          
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {getAvailableDurations().map((pricing) => {
              const durationOption = pricing.duration_option;
              if (!durationOption) return null;
              
              const isSelected = selectedDurationId === durationOption.id;
              
              return (
                <div key={durationOption.id} className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}>
                  <label className="cursor-pointer">
                    <input
                      type="radio"
                      name="duration"
                      value={durationOption.id}
                      checked={isSelected}
                      onChange={() => handleDurationChange(durationOption.id)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {durationOption.duration_label}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mt-2">
                        ${pricing.price}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {durationOption.duration_minutes} minutes
                      </div>
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedServiceId && selectedDurationId && pricingInfo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Service Selected
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>{getSelectedService()?.name}</strong> - {pricingInfo.duration_label}
                </p>
                <p className="mt-1">
                  Total: <strong>${pricingInfo.price}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Choose the service that best fits your needs</li>
          <li>• Select your preferred consultation duration</li>
          <li>• The price shown is what you'll pay for that specific duration</li>
          <li>• You'll have the full allocated time with your consultant</li>
        </ul>
      </div>
    </div>
  );
}
