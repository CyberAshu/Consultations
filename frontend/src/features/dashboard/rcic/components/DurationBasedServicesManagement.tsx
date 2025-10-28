import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../../../components/common/Card'
import { Badge } from '../../../../components/common/Badge'
import { Button } from '../../../../components/common/Button'
import { consultantService } from '../../../../api/services/consultant.service'
import { serviceTemplateService } from '../../../../api/services/serviceTemplate.service'
import { 
  ConsultantServiceWithPricing, 
  ServicePricingOptions, 
  ServiceTemplate,
  ServiceDurationOption,
  ConsultantServicePricing,
  BulkPricingUpdate
} from '../../../../types/service.types'
import { 
  Wrench, 
  DollarSign, 
  Clock, 
  Plus, 
  Edit2, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react'

interface DurationBasedServicesManagementProps {
  consultantId: number
  onServicesChange?: () => void
}

export function DurationBasedServicesManagement({ consultantId, onServicesChange }: DurationBasedServicesManagementProps) {
  const [services, setServices] = useState<ConsultantServiceWithPricing[]>([])
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingPrices, setEditingPrices] = useState<{[serviceId: number]: boolean}>({})
  const [priceChanges, setPriceChanges] = useState<{[serviceId: number]: {[durationOptionId: number]: number}}>({})
  const [savingPrices, setSavingPrices] = useState<{[serviceId: number]: boolean}>({})
  const [showAddService, setShowAddService] = useState(false)
  const [newServiceTemplate, setNewServiceTemplate] = useState<number>(0)
  const [addingService, setAddingService] = useState(false)

  // Load services with pricing
  const loadServices = async () => {
    try {
      setLoading(true)
      setError(null)
      const servicesWithPricing = await consultantService.getConsultantServicesWithPricing(consultantId)
      setServices(servicesWithPricing)
    } catch (err: any) {
      setError(err?.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  // Load service templates
  const loadServiceTemplates = async () => {
    try {
      const templates = await serviceTemplateService.getServiceTemplates()
      setServiceTemplates(templates)
    } catch (err: any) {
      console.error('Failed to load service templates:', err)
    }
  }

  useEffect(() => {
    loadServices()
    loadServiceTemplates()
  }, [consultantId])

  // Initialize pricing for a service
  const handleInitializePricing = async (serviceId: number) => {
    try {
      setSavingPrices(prev => ({ ...prev, [serviceId]: true }))
      setError(null)
      setSuccessMessage(null)
      
      const service = services.find(s => s.id === serviceId)
      await consultantService.initializeServicePricing(consultantId, serviceId)
      await loadServices() // Reload to get updated pricing data
      
      setSuccessMessage(`Pricing has been initialized for ${service?.name || 'service'}. You can now edit the prices.`)
      setTimeout(() => setSuccessMessage(null), 5000) // Clear success message after 5 seconds
      
      onServicesChange?.()
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize pricing')
    } finally {
      setSavingPrices(prev => ({ ...prev, [serviceId]: false }))
    }
  }

  // Start editing prices for a service
  const startEditingPrices = (serviceId: number, pricingOptions: ConsultantServicePricing[]) => {
    setEditingPrices(prev => ({ ...prev, [serviceId]: true }))
    const initialPrices: {[durationOptionId: number]: number} = {}
    pricingOptions.forEach(pricing => {
      if (pricing.duration_option_id) {
        initialPrices[pricing.duration_option_id] = pricing.price
      }
    })
    setPriceChanges(prev => ({ ...prev, [serviceId]: initialPrices }))
  }

  // Update a price change
  const handlePriceChange = (serviceId: number, durationOptionId: number, newPrice: number) => {
    setPriceChanges(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [durationOptionId]: newPrice
      }
    }))
  }

  // Save price changes
  const savePriceChanges = async (serviceId: number) => {
    try {
      setSavingPrices(prev => ({ ...prev, [serviceId]: true }))
      setError(null)
      setSuccessMessage(null)
      
      const service = services.find(s => s.id === serviceId)
      if (!service) return

      // Prepare bulk pricing update
      const pricingOptions = Object.entries(priceChanges[serviceId] || {}).map(([durationOptionId, price]) => ({
        consultant_service_id: serviceId,
        duration_option_id: parseInt(durationOptionId),
        price: price,
        is_active: true
      }))

      const bulkUpdate: BulkPricingUpdate = {
        consultant_service_id: serviceId,
        pricing_options: pricingOptions
      }

      await consultantService.setServicePricing(consultantId, serviceId, bulkUpdate)
      await loadServices() // Reload to get updated data
      
      // Clear editing state
      setEditingPrices(prev => ({ ...prev, [serviceId]: false }))
      setPriceChanges(prev => ({ ...prev, [serviceId]: {} }))
      
      setSuccessMessage(`Pricing for ${service?.name || 'service'} has been updated successfully!`)
      setTimeout(() => setSuccessMessage(null), 5000) // Clear success message after 5 seconds
      
      onServicesChange?.()
    } catch (err: any) {
      setError(err?.message || 'Failed to save pricing changes')
    } finally {
      setSavingPrices(prev => ({ ...prev, [serviceId]: false }))
    }
  }

  // Cancel editing prices
  const cancelEditingPrices = (serviceId: number) => {
    setEditingPrices(prev => ({ ...prev, [serviceId]: false }))
    setPriceChanges(prev => ({ ...prev, [serviceId]: {} }))
  }

  // Add new service
  const handleAddService = async () => {
    if (!newServiceTemplate) return
    
    try {
      setAddingService(true)
      const template = serviceTemplates.find(t => t.id === newServiceTemplate)
      if (!template) return

      // Create the service with template data
      await consultantService.createConsultantService(consultantId, {
        service_template_id: newServiceTemplate,
        name: template.name,
        duration: parseInt(template.default_duration) || 30,
        price: template.min_price,
        description: template.default_description,
        is_active: true
      })

      await loadServices()
      setShowAddService(false)
      setNewServiceTemplate(0)
      onServicesChange?.()
    } catch (err: any) {
      setError(err?.message || 'Failed to add service')
    } finally {
      setAddingService(false)
    }
  }

  // Get duration options for a service template
  const getDurationOptionsForService = (service: ConsultantServiceWithPricing) => {
    if (!service.service_template_id) return []
    const template = serviceTemplates.find(t => t.id === service.service_template_id)
    return template?.duration_options || []
  }

  // Check if price is within valid range
  const isPriceValid = (price: number, durationOption: ServiceDurationOption) => {
    return price >= durationOption.min_price && price <= durationOption.max_price
  }

  // Get existing pricing for a duration option
  const getExistingPrice = (service: ConsultantServiceWithPricing, durationOptionId: number) => {
    const pricing = service.pricing_options.find(p => p.duration_option_id === durationOptionId)
    return pricing?.price || 0
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
              Duration-Based Services & Pricing
            </h2>
            <p className="text-emerald-100">Set different prices for various consultation durations</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{services.filter(s => s.is_active).length}</div>
              <div className="text-xs text-emerald-100">Active Services</div>
            </div>
            <Button
              onClick={() => setShowAddService(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
      </div>

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
            <X className="h-3 w-3" />
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
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddService && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-emerald-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-600" />
                Add New Service
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddService(false)
                  setNewServiceTemplate(0)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Service Template
                </label>
                <select
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  value={newServiceTemplate}
                  onChange={(e) => setNewServiceTemplate(parseInt(e.target.value))}
                >
                  <option value={0}>Choose a service...</option>
                  {serviceTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} (${template.min_price} - ${template.max_price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddService}
                  disabled={!newServiceTemplate || addingService}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {addingService ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add Service
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddService(false)
                    setNewServiceTemplate(0)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      {services.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Services Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create your first service with duration-based pricing to start accepting client bookings.
            </p>
            <Button
              onClick={() => setShowAddService(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {services.map(service => {
            const durationOptions = getDurationOptionsForService(service)
            const isEditing = editingPrices[service.id]
            const isSaving = savingPrices[service.id]
            const hasPricing = service.pricing_options.length > 0

            return (
              <Card
                key={service.id}
                className={`bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-200 ${
                  isEditing ? 'ring-2 ring-emerald-200 bg-emerald-50/30' : 'border-gray-200/50'
                }`}
              >
                <CardContent className="p-6">
                  {/* Service Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        service.is_active 
                          ? 'bg-emerald-100 text-emerald-600' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`${
                            service.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {hasPricing ? (
                            <Badge className="bg-blue-100 text-blue-800">
                              {service.pricing_options.length} Duration{service.pricing_options.length !== 1 ? 's' : ''} Configured
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Pricing Not Set
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!hasPricing ? (
                        <Button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleInitializePricing(service.id)
                          }}
                          disabled={isSaving}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <Settings className="h-4 w-4 mr-2" />
                          )}
                          Set Up Pricing
                        </Button>
                      ) : isEditing ? (
                        <>
                          <Button
                            onClick={() => savePriceChanges(service.id)}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            {isSaving ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => cancelEditingPrices(service.id)}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => startEditingPrices(service.id, service.pricing_options)}
                          variant="outline"
                          className="hover:bg-emerald-50 hover:border-emerald-200"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Pricing
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Duration Options Table */}
                  {durationOptions.length > 0 && hasPricing && (
                    <div className="overflow-x-auto">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Clock className="h-5 w-5 text-emerald-600" />
                          Duration Options & Pricing
                        </h4>
                        
                        <div className="space-y-3">
                          {durationOptions
                            .filter(option => option.is_active)
                            .sort((a, b) => a.order_index - b.order_index)
                            .map(durationOption => {
                              const existingPrice = getExistingPrice(service, durationOption.id)
                              const currentPrice = isEditing 
                                ? (priceChanges[service.id]?.[durationOption.id] ?? existingPrice)
                                : existingPrice
                              const isValidPrice = isPriceValid(currentPrice, durationOption)

                              return (
                                <div
                                  key={durationOption.id}
                                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                                    isEditing
                                      ? 'bg-white border-emerald-200'
                                      : 'bg-white border-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-emerald-600">
                                        {durationOption.duration_minutes}
                                      </div>
                                      <div className="text-xs text-gray-500 uppercase tracking-wide">
                                        minutes
                                      </div>
                                    </div>
                                    <div>
                                      <h5 className="font-semibold text-gray-900">
                                        {durationOption.duration_label}
                                      </h5>
                                      <p className="text-sm text-gray-600">
                                        Price range: ${durationOption.min_price} - ${durationOption.max_price}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4">
                                    {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-600 font-medium">$</span>
                                        <input
                                          type="number"
                                          value={currentPrice}
                                          onChange={(e) => handlePriceChange(
                                            service.id, 
                                            durationOption.id, 
                                            parseFloat(e.target.value) || 0
                                          )}
                                          className={`w-24 p-2 text-center border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                                            isValidPrice 
                                              ? 'border-gray-300' 
                                              : 'border-red-300 bg-red-50'
                                          }`}
                                          min={durationOption.min_price}
                                          max={durationOption.max_price}
                                          step="5"
                                        />
                                        {isValidPrice ? (
                                          <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <AlertTriangle className="h-5 w-5 text-red-500" />
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-right">
                                        <div className="text-2xl font-bold text-emerald-600">
                                          ${currentPrice}
                                        </div>
                                        <div className="text-xs text-gray-500">CAD</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                        </div>

                        {isEditing && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Prices must be within the specified ranges for each duration option.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No pricing configured state */}
                  {durationOptions.length > 0 && !hasPricing && (
                    <div className="text-center py-8 bg-yellow-50 rounded-xl">
                      <DollarSign className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Pricing Not Configured
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Set up pricing for different consultation durations to start accepting bookings.
                      </p>
                    </div>
                  )}

                  {/* No duration options available */}
                  {durationOptions.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        No Duration Options Available
                      </h4>
                      <p className="text-gray-600">
                        This service template doesn't have duration options configured.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
