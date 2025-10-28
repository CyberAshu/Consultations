import React, { useState, useEffect } from 'react';
import { 
  ConsultantServiceWithPricing,
  ServiceDurationOption,
  ConsultantServicePricing,
  PriceCalculationResponse 
} from '../../../types/service.types';
import { consultantService } from '../../../api/services/consultant.service';
import { bookingService } from '../../../api/services/booking.service';

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
    if (consultantId) {
      loadServices();
    }
  }, [consultantId]);

  useEffect(() => {
    if (selectedServiceId && selectedDurationId) {
      calculatePrice();
    }
  }, [selectedServiceId, selectedDurationId]);
  
  // Handle prefilled service selection
  useEffect(() => {
    // Check if we have prefilled service from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledServiceId = urlParams.get('service');
    
    if (prefilledServiceId && services.length > 0 && !selectedServiceId) {
      console.log('🔍 Handling prefilled service:', prefilledServiceId);
      
      // Find the service with matching ID
      const matchingService = services.find(s => s.id === parseInt(prefilledServiceId));
      if (matchingService && matchingService.pricing_options.length > 0) {
        console.log('🔍 Found matching service for prefill:', matchingService);
        
        // Auto-select the service
        setSelectedServiceId(matchingService.id);
        
        // Auto-select the first available duration option
        const firstActiveDuration = matchingService.pricing_options.find(p => p.is_active);
        if (firstActiveDuration && firstActiveDuration.duration_option) {
          console.log('🔍 Auto-selecting duration:', firstActiveDuration);
          setSelectedDurationId(firstActiveDuration.duration_option.id);
        }
      } else {
        console.warn('⚠️ Prefilled service not found or no pricing options:', prefilledServiceId);
      }
    }
  }, [services, selectedServiceId]);

  const loadServices = async () => {
    console.log('🔍 Loading services for consultant:', consultantId);
    console.log('🔍 consultantService object:', consultantService);
    console.log('🔍 consultantService.getConsultantServicesWithPricing:', typeof consultantService.getConsultantServicesWithPricing);
    
    try {
      setLoading(true);
      console.log('🔍 About to call API...');
      // Get only active services with pricing for public booking
      const servicesData = await consultantService.getConsultantServicesWithPricing(consultantId, true);
      console.log('🔍 API call successful! Raw services data:', servicesData);
      
      // Filter to only show services that have at least one active pricing option
      const servicesWithActivePricing = servicesData.filter(service => 
        service.is_active && service.pricing_options.some(p => p.is_active)
      );
      
      console.log('🔍 Filtered services with pricing:', servicesWithActivePricing);
      setServices(servicesWithActivePricing);
      
      if (servicesWithActivePricing.length === 0) {
        console.warn('⚠️ No services with active pricing found for consultant', consultantId);
      }
    } catch (err) {
      console.error('❌ Error loading services for consultant', consultantId, ':', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    console.log('🔍 calculatePrice called with:', { selectedServiceId, selectedDurationId });
    
    if (!selectedServiceId || !selectedDurationId) {
      console.log('⚠️ calculatePrice: missing serviceId or durationId');
      return;
    }

    try {
      console.log('🔍 About to call calculateDurationPrice API...');
      const priceData = await bookingService.calculateDurationPrice({
        service_id: selectedServiceId,
        duration_option_id: selectedDurationId
      });
      console.log('🔍 calculateDurationPrice API successful:', priceData);
      setPricingInfo(priceData);
      
      // Find the service and duration details
      const service = services.find(s => s.id === selectedServiceId);
      
      console.log('🔍 Service found:', service);
      console.log('🔍 Service pricing_options:', service?.pricing_options);
      console.log('🔍 Looking for selectedDurationId:', selectedDurationId);
      
      const pricing = service?.pricing_options.find(p => {
        console.log('🔍 Pricing option keys:', Object.keys(p));
        console.log('🔍 Pricing option:', p);
        console.log('🔍 Duration option:', p.duration_option);
        console.log('🔍 Comparing:', p.duration_option?.id, '===', selectedDurationId);
        return p.duration_option?.id === selectedDurationId;
      });
      
      console.log('🔍 Pricing found:', pricing);
      console.log('🔍 Duration option:', pricing?.duration_option);
      
      if (service && pricing?.duration_option) {
        const serviceData = {
          serviceId: selectedServiceId,
          serviceName: service.name,
          durationOptionId: selectedDurationId,
          durationLabel: pricing.duration_option.duration_label,
          price: priceData.price,
          durationMinutes: priceData.duration_minutes
        };
        
        console.log('🔍 DurationBasedServiceSelection sending data:', serviceData);
        onServiceSelect(serviceData);
      }
    } catch (err) {
      setError('Failed to calculate price');
      console.error(err);
    }
  };

  const handleServiceChange = (serviceId: number) => {
    console.log('🔍 Service changed to:', serviceId);
    setSelectedServiceId(serviceId);
    setSelectedDurationId(null);
    setPricingInfo(null);
  };

  const handleDurationChange = (durationId: number) => {
    console.log('🔍 Duration changed to:', durationId);
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
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl h-32 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full animate-shimmer"></div>
            </div>
          ))}
        </div>
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">Loading available services...</span>
          </div>
        </div>
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
        
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
              selectedServiceId === service.id
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-500 shadow-lg'
                : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
            }`}>
              <label className="flex items-start p-6 cursor-pointer relative z-10">
                <div className="flex items-center justify-center">
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={selectedServiceId === service.id}
                    onChange={() => handleServiceChange(service.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 transition-colors"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{service.name}</h4>
                    {selectedServiceId === service.id && (
                      <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Selected
                      </div>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-gray-600 mb-3 leading-relaxed">{service.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.pricing_options
                        .filter(p => p.is_active)
                        .map(p => p.duration_option?.duration_label)
                        .join(', ')}
                    </div>
                  </div>
                </div>
              </label>
              {/* Accent border for selected state */}
              {selectedServiceId === service.id && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedServiceId && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Choose Duration & Pricing
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {getAvailableDurations().map((pricing) => {
              const durationOption = pricing.duration_option;
              if (!durationOption) return null;
              
              const isSelected = selectedDurationId === durationOption.id;
              
              return (
                <div key={durationOption.id} className={`group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                }`}>
                  <label className="block cursor-pointer p-6 relative z-10">
                    <input
                      type="radio"
                      name="duration"
                      value={durationOption.id}
                      checked={isSelected}
                      onChange={() => handleDurationChange(durationOption.id)}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className={`text-sm font-medium mb-2 ${
                        isSelected ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {durationOption.duration_label}
                      </div>
                      <div className={`text-3xl font-bold mb-1 ${
                        isSelected ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${pricing.price}
                      </div>
                      <div className={`text-sm ${
                        isSelected ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {durationOption.duration_minutes} minutes
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </label>
                  
                  {/* Hover effect background */}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedServiceId && selectedDurationId && pricingInfo && (
        <div className="relative overflow-hidden bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                Perfect! Service Selected
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-medium">{getSelectedService()?.name}</span>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {pricingInfo.duration_label}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-green-200">
                  <span className="text-green-700">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-800">${pricingInfo.price}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8 opacity-10">
            <svg className="w-full h-full text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
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
