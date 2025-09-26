import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../shared/Button'
import { consultantService } from '../../services/consultantService'
import { serviceTemplateService } from '../../services/serviceTemplateService'
import { ServiceEditModal } from './ServiceEditModal'
import { 
  ConsultantServiceWithPricing, 
  ServiceTemplate
} from '../../services/types'
import { 
  Wrench, 
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react'

interface ServicesTableViewProps {
  consultantId: number
  onServicesChange?: () => void
}

export function ServicesTableView({ consultantId, onServicesChange }: ServicesTableViewProps) {
  const [services, setServices] = useState<ConsultantServiceWithPricing[]>([])
  const [allServiceTemplates, setAllServiceTemplates] = useState<ServiceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Modal states
  const [selectedService, setSelectedService] = useState<ConsultantServiceWithPricing | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Adding service states
  const [addingServices, setAddingServices] = useState<{[templateId: number]: boolean}>({})

  // Load services and templates
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load both services and templates in parallel
      const [servicesWithPricing, templates] = await Promise.all([
        consultantService.getConsultantServicesWithPricing(consultantId),
        serviceTemplateService.getServiceTemplates()
      ])
      
      setServices(servicesWithPricing)
      setAllServiceTemplates(templates)
      
      // Get templates that don't have corresponding services yet
      // (We compute directly when rendering)
    } catch (err: any) {
      setError(err?.message || 'Failed to load services and templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [consultantId])

  // Handle service click - open modal
  const handleServiceClick = (service: ConsultantServiceWithPricing) => {
    const template = allServiceTemplates.find(t => t.id === service.service_template_id)
    if (template) {
      setSelectedService(service)
      setSelectedTemplate(template)
      setIsModalOpen(true)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedService(null)
    setSelectedTemplate(null)
  }

  // Handle service update from modal
  const handleServiceUpdate = (updatedService: ConsultantServiceWithPricing) => {
    setServices(prev => prev.map(s => 
      s.id === updatedService.id ? updatedService : s
    ))
    
    // Also update the selectedService if it's currently selected
    if (selectedService && selectedService.id === updatedService.id) {
      setSelectedService(updatedService)
    }
    
    onServicesChange?.()
  }

  // Add service for template
  const handleAddService = async (template: ServiceTemplate) => {
    try {
      setAddingServices(prev => ({ ...prev, [template.id]: true }))
      setError(null)
      
      await consultantService.createConsultantService(consultantId, {
        service_template_id: template.id,
        name: template.name,
        duration: parseInt(template.default_duration) || 30,
        price: template.min_price,
        description: template.default_description,
        is_active: true
      })

      // Reload data to reflect the new service
      await loadData()
      
      setSuccessMessage(`${template.name} service has been added successfully!`)
      setTimeout(() => setSuccessMessage(null), 5000)
      
      onServicesChange?.()
    } catch (err: any) {
      setError(err?.message || 'Failed to add service')
    } finally {
      setAddingServices(prev => ({ ...prev, [template.id]: false }))
    }
  }

  // Get pricing status for a service
  const getPricingStatus = (service: ConsultantServiceWithPricing) => {
    const hasPricing = service.pricing_options.length > 0
    const activePricingCount = service.pricing_options.filter(p => p.is_active).length
    
    if (!hasPricing) {
      return { status: 'not-set', label: 'Not Set', count: 0 }
    }
    
    return { 
      status: 'configured', 
      label: `${activePricingCount} Configured`, 
      count: activePricingCount 
    }
  }

  // Get price range for a service
  const getPriceRange = (service: ConsultantServiceWithPricing) => {
    if (service.pricing_options.length === 0) return 'Not set'
    
    const activePricing = service.pricing_options.filter(p => p.is_active)
    if (activePricing.length === 0) return 'Not set'
    
    const prices = activePricing.map(p => p.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    return minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading services...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              Services Management
            </h2>
            <p className="text-emerald-100">Manage your consultation services and pricing</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{services.filter(s => s.is_active).length}</div>
              <div className="text-xs text-emerald-100">Active Services</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{services.filter(s => s.pricing_options.length > 0).length}</div>
              <div className="text-xs text-emerald-100">With Pricing</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMessage}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSuccessMessage(null)}
            className="ml-auto"
          >
            ×
          </Button>
        </div>
      )}

      {/* Services Table */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900">Service</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Pricing Status</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Price Range</th>
                  <th className="text-left p-4 font-semibold text-gray-900">Duration Options</th>
                  <th className="text-center p-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Existing Services */}
                {allServiceTemplates.map(template => {
                  const service = services.find(s => s.service_template_id === template.id)
                  const pricingStatus = service ? getPricingStatus(service) : null
                  const priceRange = service ? getPriceRange(service) : null
                  const durationOptions = template.duration_options?.filter(d => d.is_active).length || 0

                  return (
                    <tr 
                      key={template.id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        service ? 'cursor-pointer' : ''
                      }`}
                      onClick={service ? () => handleServiceClick(service) : undefined}
                    >
                      {/* Service Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            service?.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Wrench className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-500">{template.default_description}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {service ? (
                          <Badge className={
                            service.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">
                            Not Added
                          </Badge>
                        )}
                      </td>

                      {/* Pricing Status */}
                      <td className="p-4">
                        {service && pricingStatus ? (
                          <Badge className={
                            pricingStatus.status === 'configured' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {pricingStatus.label}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Price Range */}
                      <td className="p-4">
                        {service ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium text-gray-900">{priceRange}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Duration Options */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{durationOptions} options</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        {service ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleServiceClick(service)
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleAddService(template)}
                            disabled={addingServices[template.id]}
                            className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1"
                          >
                            {addingServices[template.id] ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                            ) : (
                              <Plus className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline">Add</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {allServiceTemplates.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Service Templates</h3>
              <p className="text-gray-500">Contact your administrator to set up service templates.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Edit Modal */}
      <ServiceEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        service={selectedService}
        serviceTemplate={selectedTemplate}
        consultantId={consultantId}
        onServiceUpdate={handleServiceUpdate}
      />
    </div>
  )
}
