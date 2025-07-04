import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { 
  Star, 
  Clock, 
  CheckCircle, 
  Award,
  MessageSquare,
  Globe
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

  // Mock RCIC data
  const rcics = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      license: 'R123456',
      rating: 4.9,
      reviews: 127,
      specialties: ['Express Entry', 'Study Permits', 'Work Permits'],
      languages: ['English', 'Mandarin', 'Cantonese'],
      experience: '8+ years',
      avatar: '/api/placeholder/100/100',
      bio: 'Experienced RCIC with 8+ years helping international students and skilled workers navigate Canadian immigration.',
      verified: true,
      responseTime: '< 2 hours',
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
        },
        {
          id: 3,
          name: 'Document Review',
          duration: '45 minutes',
          price: 200,
          description: 'Complete review of your application documents with feedback.'
        }
      ]
    },
    {
      id: 2,
      name: 'Ahmed Hassan',
      license: 'R234567',
      rating: 4.8,
      reviews: 89,
      specialties: ['Family Class', 'Refugee Law', 'Appeals'],
      languages: ['English', 'Arabic', 'French'],
      experience: '6+ years',
      avatar: '/api/placeholder/100/100',
      bio: 'Specialized in family reunification and complex immigration cases.',
      verified: true,
      responseTime: '< 4 hours',
      services: [
        {
          id: 1,
          name: '30-Minute Consultation',
          duration: '30 minutes',
          price: 55,
          description: 'Initial consultation for family class applications.'
        },
        {
          id: 2,
          name: 'Case Assessment',
          duration: '90 minutes',
          price: 180,
          description: 'Detailed assessment for complex cases.'
        }
      ]
    },
    {
      id: 3,
      name: 'Maria Rodriguez',
      license: 'R345678',
      rating: 5.0,
      reviews: 156,
      specialties: ['PNP Programs', 'Business Immigration', 'Investor Programs'],
      languages: ['English', 'Spanish', 'Portuguese'],
      experience: '10+ years',
      avatar: '/api/placeholder/100/100',
      bio: 'Expert in Provincial Nominee Programs and business immigration pathways.',
      verified: true,
      responseTime: '< 1 hour',
      services: [
        {
          id: 1,
          name: 'PNP Consultation',
          duration: '45 minutes',
          price: 85,
          description: 'Specialized consultation for Provincial Nominee Programs.'
        },
        {
          id: 2,
          name: 'Business Plan Review',
          duration: '60 minutes',
          price: 250,
          description: 'Comprehensive business plan review for investor programs.'
        }
      ]
    }
  ]

  useEffect(() => {
    // Handle pre-filled data
    if (prefilledRCIC) {
      const rcic = rcics.find(r => r.id === parseInt(prefilledRCIC))
      if (rcic) {
        setSelectedRCIC(rcic)
        if (prefilledService) {
          const service = rcic.services.find(s => s.id === parseInt(prefilledService))
          if (service) {
            setSelectedService(service)
          }
        }
      }
    }
  }, [prefilledRCIC, prefilledService])

  useEffect(() => {
    onDataChange({
      rcic: selectedRCIC,
      service: selectedService,
      totalAmount: selectedService?.price || 0
    })
  }, [selectedRCIC, selectedService])

  const handleRCICSelect = (rcic: any) => {
    setSelectedRCIC(rcic)
    setSelectedService(null) // Reset service when RCIC changes
  }

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
  }

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
        <h3 className="text-lg font-semibold text-gray-900">Available RCICs</h3>
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
                      {rcic.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{rcic.name}</h4>
                        {rcic.verified && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">License: {rcic.license}</p>
                      
                      {/* Rating & Reviews */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-gray-900">{rcic.rating}</span>
                          <span className="text-sm text-gray-600">({rcic.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MessageSquare className="h-4 w-4" />
                          {rcic.responseTime}
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {rcic.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {rcic.specialties.length > 3 && (
                            <Badge className="bg-gray-100 text-gray-600 text-xs">
                              +{rcic.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {rcic.languages.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-gray-600 leading-relaxed">{rcic.bio}</p>
                    </div>
                  </div>

                  {/* Experience Badge */}
                  <div className="flex-shrink-0">
                    <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {rcic.experience}
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
      </div>

      {/* Service Selection */}
      {selectedRCIC && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Choose a Service with {selectedRCIC.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedRCIC.services.map((service: any) => (
              <Card 
                key={service.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedService?.id === service.id 
                    ? 'ring-2 ring-green-500 bg-green-50/50' 
                    : 'bg-white/80 backdrop-blur-sm border-gray-200/50'
                }`}
                onClick={() => handleServiceSelect(service)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">{service.name}</h4>
                    <Badge className="bg-green-100 text-green-800 font-semibold">
                      ${service.price} CAD
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{service.duration}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {service.description}
                  </p>

                  {selectedService?.id === service.id && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Selected Service</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
                <span className="text-gray-900">{selectedRCIC.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Service:</span>
                <span className="text-gray-900">{selectedService.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-900">{selectedService.duration}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-green-600 text-lg">${selectedService.price} CAD</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
