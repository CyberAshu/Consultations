import React, { useState, useEffect } from 'react'
import { Button } from '../shared/Button'
import { consultantService } from '../../services/consultantService'
import { serviceTemplateService } from '../../services/serviceTemplateService'
import { 
  ConsultantServiceWithPricing, 
  ServiceTemplate,
  ServiceDurationOption,
  ConsultantServicePricing,
  BulkPricingUpdate
} from '../../services/types'
import { 
  X, 
  Save, 
  Settings,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react'

interface ServiceEditModalProps {
  isOpen: boolean
  onClose: () => void
  service: ConsultantServiceWithPricing | null
  serviceTemplate: ServiceTemplate | null
  consultantId: number
  onServiceUpdate: (service: ConsultantServiceWithPricing) => void
}

export function ServiceEditModal({ 
  isOpen, 
  onClose, 
  service, 
  serviceTemplate, 
  consultantId, 
  onServiceUpdate 
}: ServiceEditModalProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [priceChanges, setPriceChanges] = useState<{[durationOptionId: number]: number}>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [durationOptions, setDurationOptions] = useState<ServiceDurationOption[]>([])
  const [loadingDurationOptions, setLoadingDurationOptions] = useState(false)

  // Load duration options when service template changes
  useEffect(() => {
    const loadDurationOptions = async () => {
      if (serviceTemplate && serviceTemplate.id) {
        try {
          setLoadingDurationOptions(true)
          const options = await consultantService.getServiceTemplateDurationOptions(serviceTemplate.id)
          setDurationOptions(options)
          console.log('🔄 Loaded duration options:', options)
        } catch (err: any) {
          console.error('❌ Failed to load duration options:', err)
          setError('Failed to load duration options')
        } finally {
          setLoadingDurationOptions(false)
        }
      }
    }
    
    loadDurationOptions()
  }, [serviceTemplate])

  // Initialize price changes when service changes
  useEffect(() => {
    if (service && durationOptions.length > 0) {
      const initialPrices: {[durationOptionId: number]: number} = {}
      service.pricing_options.forEach(pricing => {
        // Handle both duration_option_id (direct field) and duration_option.id (nested object)
        const durationOptionId = pricing.duration_option_id || pricing.duration_option?.id
        if (durationOptionId) {
          initialPrices[durationOptionId] = pricing.price
        }
      })
      setPriceChanges(initialPrices)
      setHasUnsavedChanges(false)
    }
  }, [service, durationOptions])

  // Initialize pricing if not set
  const handleInitializePricing = async () => {
    if (!service) return
    
    try {
      setLoading(true)
      setError(null)
      await consultantService.initializeServicePricing(consultantId, service.id)
      
      // Reload the specific service to get updated pricing
      const updatedServices = await consultantService.getConsultantServicesWithPricing(consultantId)
      const currentService = updatedServices.find(s => s.id === service.id)
      
      if (currentService) {
        // Update the service in the parent component
        onServiceUpdate(currentService)
        
        // Initialize price changes state with the new pricing
        const initialPrices: {[durationOptionId: number]: number} = {}
        currentService.pricing_options.forEach((pricing) => {
          // Handle both duration_option_id (direct field) and duration_option.id (nested object)
          const durationOptionId = pricing.duration_option_id || pricing.duration_option?.id
          if (durationOptionId) {
            initialPrices[durationOptionId] = pricing.price
          }
        })
        setPriceChanges(initialPrices)
        
        setSuccessMessage('Pricing initialized successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        console.error('❌ Could not find updated service with ID:', service.id)
        setError('Failed to reload service after initialization')
      }
    } catch (err: any) {
      console.error('❌ Initialize pricing error:', err)
      setError(err?.message || 'Failed to initialize pricing')
    } finally {
      setLoading(false)
    }
  }

  // Handle price change
  const handlePriceChange = (durationOptionId: number, newPrice: number) => {
    setPriceChanges(prev => ({
      ...prev,
      [durationOptionId]: newPrice
    }))
    setHasUnsavedChanges(true)
  }

  // Check if price is valid
  const isPriceValid = (price: number, durationOption: ServiceDurationOption) => {
    return price >= durationOption.min_price && price <= durationOption.max_price
  }

  // Get existing price for a duration option
  const getExistingPrice = (durationOptionId: number) => {
    if (!service) return 0
    const pricing = service.pricing_options.find(p => {
      // Handle both duration_option_id (direct field) and duration_option.id (nested object)
      const pricingDurationId = p.duration_option_id || p.duration_option?.id
      return pricingDurationId === durationOptionId
    })
    return pricing?.price || 0
  }

  // Save price changes
  const handleSavePrices = async () => {
    if (!service || !serviceTemplate) return

    try {
      setSaving(true)
      setError(null)

      // Prepare bulk pricing update
      const pricingOptions = Object.entries(priceChanges).map(([durationOptionId, price]) => ({
        consultant_service_id: service.id,
        duration_option_id: parseInt(durationOptionId),
        price: price,
        is_active: true
      }))

      const bulkUpdate: BulkPricingUpdate = {
        consultant_service_id: service.id,
        pricing_options: pricingOptions
      }

      await consultantService.setServicePricing(consultantId, service.id, bulkUpdate)
      
      // Reload the service to get updated pricing
      const updatedServices = await consultantService.getConsultantServicesWithPricing(consultantId)
      const currentService = updatedServices.find(s => s.id === service.id)
      
      if (currentService) {
        onServiceUpdate(currentService)
        setHasUnsavedChanges(false)
        setSuccessMessage('Pricing updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save pricing changes')
    } finally {
      setSaving(false)
    }
  }

  // Toggle service active status
  const handleToggleStatus = async () => {
    if (!service) return
    
    try {
      setUpdatingStatus(true)
      setError(null)
      
      // Use the toggle endpoint
      const response = await consultantService.toggleConsultantService(consultantId, service.id)
      
      // Reload the service to get updated status
      const updatedServices = await consultantService.getConsultantServicesWithPricing(consultantId)
      const currentService = updatedServices.find(s => s.id === service.id)
      
      if (currentService) {
        onServiceUpdate(currentService)
        setSuccessMessage(response.message)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update service status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
        setHasUnsavedChanges(false)
        setPriceChanges({})
        setError(null)
        setSuccessMessage(null)
      }
    } else {
      onClose()
      setPriceChanges({})
      setError(null)
      setSuccessMessage(null)
    }
  }

  if (!isOpen || !service || !serviceTemplate) return null

  const hasPricing = service.pricing_options.length > 0
  
  // Debug: Check if duration options are showing
  if (hasPricing && durationOptions.length > 0) {
    console.log('🎆 Ready to show pricing UI! Duration options:', durationOptions.length, 'Pricing options:', service.pricing_options.length)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Edit Service: {service.name}
              </h2>
              <p className="text-emerald-100">Manage pricing and duration options</p>
            </div>
            <Button
              onClick={handleClose}
              variant="outline"
              className="text-white border-white/30 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Service Information</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={handleToggleStatus}
                  disabled={updatingStatus}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    service.is_active
                      ? 'bg-emerald-600'
                      : 'bg-gray-300'
                  } ${
                    updatingStatus ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      service.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  >
                    {updatingStatus && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600" />
                    )}
                  </span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Service:</span>
                <span className="ml-2 text-gray-900">{service.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Template:</span>
                <span className="ml-2 text-gray-900">{serviceTemplate.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  service.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pricing Status:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  hasPricing 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {hasPricing ? `${service.pricing_options.length} Configured` : 'Not Set'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          {!hasPricing ? (
            <div className="text-center py-8 bg-yellow-50 rounded-lg">
              <DollarSign className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pricing Not Configured
              </h3>
              <p className="text-gray-600 mb-4">
                Initialize pricing for different consultation durations.
              </p>
              <Button
                onClick={handleInitializePricing}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="h-4 w-4 mr-2" />
                )}
                Initialize Pricing
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Duration Options & Pricing</h3>
              </div>

              <div className="space-y-3">
                {durationOptions
                  .filter(option => option.is_active)
                  .sort((a, b) => a.order_index - b.order_index)
                  .map(durationOption => {
                    const existingPrice = getExistingPrice(durationOption.id)
                    const currentPrice = priceChanges[durationOption.id] ?? existingPrice
                    const isValidPrice = isPriceValid(currentPrice, durationOption)

                    return (
                      <div
                        key={durationOption.id}
                        className="flex items-center justify-between p-4 bg-white border-2 border-gray-100 rounded-lg hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-emerald-600">
                              {durationOption.duration_minutes}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">
                              minutes
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {durationOption.duration_label}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Range: ${durationOption.min_price} - ${durationOption.max_price}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium">$</span>
                            <input
                              type="number"
                              value={currentPrice}
                              onChange={(e) => handlePriceChange(
                                durationOption.id, 
                                parseFloat(e.target.value) || 0
                              )}
                              className={`w-24 p-2 text-center border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors ${
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
                        </div>
                      </div>
                    )
                  })}
              </div>

              {hasUnsavedChanges && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    You have unsaved changes. Don't forget to save your pricing updates.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {hasPricing && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={saving}
              >
                Close
              </Button>
              <Button
                onClick={handleSavePrices}
                disabled={saving || !hasUnsavedChanges}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
