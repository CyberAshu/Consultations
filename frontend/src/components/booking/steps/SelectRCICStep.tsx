import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { DurationBasedServiceSelection } from './DurationBasedServiceSelection'
import { consultantService, bookingService } from '../../../services'
import { 
  Star, 
  CheckCircle, 
  Award,
  MessageSquare,
  Globe,
  Plus,
  Minus
} from 'lucide-react'

interface SelectRCICStepProps {
  onDataChange: (data: any) => void
  prefilledRCIC?: string | null
  prefilledService?: string | null
  currentData: any
}

export function SelectRCICStep({ 
  onDataChange, 
  prefilledRCIC, 
  prefilledService, 
  currentData 
}: SelectRCICStepProps) {
  const [selectedRCIC, setSelectedRCIC] = useState<any>(null)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([])
  const [rcics, setRCICs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load consultants from backend
  useEffect(() => {
    const loadConsultants = async () => {
      try {
        setLoading(true)
        const data = await consultantService.getConsultants()
        
        // Load active services for each consultant
        const consultantsWithServices = await Promise.all(
          data.map(async (rcic: any) => {
            try {
              const activeServices = await consultantService.getActiveConsultantServices(rcic.id);
              return { ...rcic, services: activeServices };
            } catch (error) {
              console.error(`Failed to load services for consultant ${rcic.id}:`, error);
              return { ...rcic, services: [] };
            }
          })
        );
        
        // If prefilledRCIC is provided, filter to show only that consultant
        if (prefilledRCIC) {
          const filteredData = consultantsWithServices.filter((rcic: any) => rcic.id === parseInt(prefilledRCIC))
          setRCICs(filteredData)
        } else {
          setRCICs(consultantsWithServices)
        }
      } catch (error) {
        console.error('Failed to fetch RCICs:', error)
        // Fallback to mock data for development
        setRCICs(getMockRCICs())
      } finally {
        setLoading(false)
      }
    }
    
    loadConsultants()
  }, [prefilledRCIC])

  // Mock data fallback for development
  const getMockRCICs = () => [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      rcic_number: 'R123456',
      rating: 4.9,
      review_count: 127,
      specialties: ['Express Entry', 'Study Permits', 'Work Permits'],
      languages: ['English', 'Mandarin', 'Cantonese'],
      experience_years: 8,
      bio: 'Experienced RCIC with 8+ years helping international students and skilled workers navigate Canadian immigration.',
      is_verified: true,
      services: [
        {
          id: 1,
          name: '30-Minute Consultation',
          duration: '30 minutes',
          price: 60,
          description: 'Quick guidance and general questions about your immigration pathway.'
        },
        {
          id: 2,
          name: '60-Minute Deep Dive',
          duration: '60 minutes', 
          price: 120,
          description: 'Comprehensive analysis of your case with detailed action plan.'
        }
      ]
    }
  ]

  useEffect(() => {
    // Handle pre-filled data
    if (prefilledRCIC && rcics.length > 0) {
      const rcic = rcics.find((r: any) => r.id === parseInt(prefilledRCIC))
      if (rcic) {
        setSelectedRCIC(rcic)
        if (prefilledService) {
          const service = rcic.services?.find((s: any) => s.id === parseInt(prefilledService))
          if (service) {
            setSelectedService(service)
          }
        }
      }
    }
  }, [prefilledRCIC, prefilledService, rcics])

  // Available addons
  const availableAddons = [
    {
      id: 'follow-up',
      name: 'Follow-Up Session',
      description: 'Schedule additional 30-minute sessions within 2 weeks of your initial consultation for continued support',
      price: 80,
      type: 'ADDON'
    },
    {
      id: 'session-extension',
      name: 'Session Extension',
      description: 'Extend your current session by 15 minutes when offered live by your RCIC consultant',
      price: 30,
      type: 'ADDON'
    },
    {
      id: 'session-summary',
      name: 'Session Summary',
      description: 'Receive a detailed written summary of your consultation session via email',
      price: 25,
      type: 'ADDON'
    },
    {
      id: 'multi-session-bundle',
      name: 'Multi-Session Bundle',
      description: 'Save with bundled packages including 3 sessions and comprehensive planning tools',
      price: 200,
      type: 'ADDON'
    }
  ]


  // Handle addon selection/deselection
  const handleAddonToggle = (addon: any) => {
    setSelectedAddons(prevAddons => {
      const isSelected = prevAddons.find(a => a.id === addon.id)
      if (isSelected) {
        return prevAddons.filter(a => a.id !== addon.id)
      } else {
        return [...prevAddons, addon]
      }
    })
  }

  // Calculate total amount
  const calculateTotal = () => {
    const basePrice = calculatedPrice || selectedService?.price || 0;
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    return basePrice + addonsPrice;
  }

  useEffect(() => {
    onDataChange({
      rcic: selectedRCIC,
      service: selectedService,
      duration: selectedDuration,
      calculatedPrice: calculatedPrice,
      selectedAddons: selectedAddons,
      totalAmount: calculateTotal()
    })
  }, [selectedRCIC, selectedService, selectedDuration, calculatedPrice, selectedAddons, onDataChange])

  const handleRCICSelect = (rcic: any) => {
    setSelectedRCIC(rcic)
    setSelectedService(null) // Reset service when RCIC changes
    setSelectedDuration(null);
    setCalculatedPrice(null);
  }

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setSelectedDuration(service.duration); // Set default duration
    setCalculatedPrice(service.price); // Set default price
  }

  const handleDurationChange = async (duration: number) => {
    if (!selectedService) return;
    
    setSelectedDuration(duration);
    if (duration >= 15 && selectedService.duration_option_id) {
      try {
        const response = await bookingService.calculateDurationPrice({
          service_id: selectedService.id,
          duration_option_id: selectedService.duration_option_id
        });
        setCalculatedPrice(response.price);
      } catch (error) {
        console.error('Failed to calculate duration price:', error);
        // Fallback to the service's default price
        setCalculatedPrice(selectedService.price);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Select Your RCIC & Service
        </h2>
        <p className="text-gray-600">
          Choose an immigration consultant and the type of service you need.
        </p>
      </div>

      {/* RCIC Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {prefilledRCIC ? 'Your Selected RCIC' : 'Available RCICs'}
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border-gray-200/50">
                <CardContent className="p-4 sm:p-6">
                  <div className="animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {rcics.map((rcic) => (
              <Card 
                key={rcic.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedRCIC?.id === rcic.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50/50' 
                    : 'bg-white/80 backdrop-blur-sm border-gray-200/50'
                }`}
                onClick={() => handleRCICSelect(rcic)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0">
                        {(rcic?.name || '').split(' ').map((n: string) => n[0]).join('') || 'N/A'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{rcic?.name || 'N/A'}</h4>
                          {rcic.is_verified && (
                            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">License: {rcic?.rcic_number || 'N/A'}</p>
                        
                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-gray-900">{rcic?.rating || 'N/A'}</span>
                            <span className="text-sm text-gray-600">({rcic?.review_count || 0} reviews)</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4" />
                            Available
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                          <div className="flex flex-wrap gap-1">
                            {(rcic.specialties || []).slice(0, 3).map((specialty: string, index: number) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {(rcic.specialties || []).length > 3 && (
                              <Badge className="bg-gray-100 text-gray-600 text-xs">
                                +{(rcic.specialties || []).length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              {(rcic.languages || []).join(', ') || 'English'}
                            </span>
                          </div>
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-gray-600 leading-relaxed">{rcic?.bio || 'No bio available'}</p>
                      </div>
                    </div>

                    {/* Experience Badge */}
                    <div className="flex-shrink-0">
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {rcic?.experience_years ? `${rcic.experience_years}+ years` : (rcic?.experience || 'N/A')}
                      </Badge>
                    </div>
                  </div>

                  {selectedRCIC?.id === rcic.id && (
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex items-center gap-2 text-blue-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Selected RCIC</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Duration-Based Service Selection */}
      {selectedRCIC && (
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <DurationBasedServiceSelection
              consultantId={selectedRCIC.id}
              onServiceSelect={(serviceData) => {
                setSelectedService({
                  id: serviceData.serviceId,
                  name: serviceData.serviceName,
                  duration: serviceData.durationMinutes,
                  price: serviceData.price,
                  duration_option_id: serviceData.durationOptionId,
                  duration_label: serviceData.durationLabel
                });
                setCalculatedPrice(serviceData.price);
              }}
              selectedService={selectedService ? {
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                durationOptionId: selectedService.duration_option_id,
                durationLabel: selectedService.duration_label,
                price: selectedService.price,
                durationMinutes: selectedService.duration
              } : null}
            />
          </CardContent>
        </Card>
      )}


      {/* Addons Selection */}
      {selectedRCIC && selectedService && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Enhance Your Experience (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAddons.map((addon) => {
              const isSelected = selectedAddons.find(a => a.id === addon.id)
              return (
                <Card 
                  key={addon.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? 'ring-2 ring-orange-500 bg-orange-50/50' 
                      : 'bg-white/80 backdrop-blur-sm border-gray-200/50 hover:border-orange-200'
                  }`}
                  onClick={() => handleAddonToggle(addon)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 text-base">{addon.name}</h4>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            {addon.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {addon.description}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-lg font-bold text-orange-600 mb-2">+${addon.price} CAD</div>
                        <div className="flex items-center gap-1">
                          {isSelected ? (
                            <><Minus className="h-4 w-4 text-orange-600" /><span className="text-sm text-orange-600">Remove</span></>
                          ) : (
                            <><Plus className="h-4 w-4 text-gray-600" /><span className="text-sm text-gray-600">Add</span></>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Added to your booking
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {selectedRCIC && selectedService && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">RCIC:</span>
                <span className="text-gray-900">{selectedRCIC?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Service:</span>
                <span className="text-gray-900">{selectedService?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-900">{selectedDuration || selectedService?.duration || 'N/A'} minutes</span>
              </div>
              
              {/* Show base service price */}
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="font-medium text-gray-700">Base Service:</span>
                <span className="text-gray-900">${(calculatedPrice || selectedService?.price || 0).toFixed(2)} CAD</span>
              </div>
              
              {/* Show selected addons */}
              {selectedAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{addon.name}:</span>
                  <span className="text-orange-600">+${addon.price} CAD</span>
                </div>
              ))}
              
              {/* Show total */}
              <div className="flex justify-between items-center pt-2 border-t border-green-300">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="font-bold text-green-600 text-xl">${calculateTotal()} CAD</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
