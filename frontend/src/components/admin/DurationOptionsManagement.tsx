import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../shared/Button'
import { serviceTemplateService } from '../../services/serviceTemplateService'
import { 
  ServiceTemplate,
  ServiceDurationOption,
  ServiceDurationOptionCreate,
  ServiceDurationOptionUpdate
} from '../../services/types'
import { 
  Clock, 
  Plus, 
  Edit2, 
  Save, 
  X, 
  AlertTriangle,
  CheckCircle,
  Settings,
  Trash2,
  DollarSign
} from 'lucide-react'

interface DurationOptionsManagementProps {
  onClose?: () => void
}

export function DurationOptionsManagement({ onClose }: DurationOptionsManagementProps) {
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null)
  const [durationOptions, setDurationOptions] = useState<ServiceDurationOption[]>([])
  const [durationOptionsCount, setDurationOptionsCount] = useState<{[key: number]: number}>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingOption, setEditingOption] = useState<ServiceDurationOption | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOption, setNewOption] = useState<ServiceDurationOptionCreate>({
    service_template_id: 0,
    duration_minutes: 30,
    duration_label: '30 minutes',
    min_price: 50,
    max_price: 150,
    order_index: 1,
    is_active: true
  })

  // Load duration options count for all templates
  const loadDurationOptionsCount = async (templates: ServiceTemplate[]) => {
    try {
      console.log('🔄 Starting to load duration options count for', templates.length, 'templates')
      const counts: {[key: number]: number} = {}
      
      // Load duration options count for each template
      await Promise.all(
        templates.map(async (template) => {
          try {
            console.log(`🔄 Loading duration options for template ${template.id} (${template.name})`)
            const options = await serviceTemplateService.getDurationOptionsForTemplate(template.id)
            counts[template.id] = options.length
            console.log(`✅ Template ${template.id} has ${options.length} duration options`)
          } catch (err) {
            console.warn(`❌ Failed to load duration options for template ${template.id}:`, err)
            counts[template.id] = 0
          }
        })
      )
      
      console.log('🎯 Final duration options counts:', counts)
      setDurationOptionsCount(counts)
      console.log('✅ Duration options count state updated')
    } catch (err: any) {
      console.error('❌ Failed to load duration options count:', err)
    }
  }

  // Load service templates
  const loadServiceTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const templates = await serviceTemplateService.getServiceTemplates()
      setServiceTemplates(templates)
      
      console.log('🔄 Loaded service templates for admin:', templates.length)
      
      // Load duration options count for all templates
      await loadDurationOptionsCount(templates)
      
      if (templates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(templates[0])
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load service templates')
      console.error('Failed to load service templates:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load duration options for selected template
  const loadDurationOptions = async (templateId: number) => {
    try {
      setError(null)
      const options = await serviceTemplateService.getDurationOptionsForTemplate(templateId)
      setDurationOptions(options)
      
      console.log('🔄 Loaded duration options:', options.length, 'for template:', templateId)
      
    } catch (err: any) {
      setError(err?.message || 'Failed to load duration options')
      console.error('Failed to load duration options:', err)
    }
  }

  useEffect(() => {
    loadServiceTemplates()
  }, [])

  useEffect(() => {
    if (selectedTemplate) {
      loadDurationOptions(selectedTemplate.id)
    }
  }, [selectedTemplate])

  // Handle template selection
  const handleTemplateSelect = (template: ServiceTemplate) => {
    setSelectedTemplate(template)
    setEditingOption(null)
    setShowAddForm(false)
  }

  // Start adding new option
  const startAddingOption = () => {
    if (!selectedTemplate) return
    
    setNewOption({
      service_template_id: selectedTemplate.id,
      duration_minutes: 30,
      duration_label: '30 minutes',
      min_price: selectedTemplate.min_price || 50,
      max_price: selectedTemplate.max_price || 150,
      order_index: Math.max(...durationOptions.map(o => o.order_index), 0) + 1,
      is_active: true
    })
    setShowAddForm(true)
    setEditingOption(null)
  }

  // Start editing option
  const startEditingOption = (option: ServiceDurationOption) => {
    setEditingOption(option)
    setShowAddForm(false)
  }

  // Save new option
  const saveNewOption = async () => {
    if (!selectedTemplate) return

    try {
      setSaving(true)
      setError(null)
      
      const created = await serviceTemplateService.createDurationOption(newOption)
      await loadDurationOptions(selectedTemplate.id)
      
      // Update duration options count for this template
      setDurationOptionsCount(prev => ({
        ...prev,
        [selectedTemplate.id]: (prev[selectedTemplate.id] || 0) + 1
      }))
      
      setShowAddForm(false)
      setSuccessMessage(`Duration option "${newOption.duration_label}" added successfully!`)
      setTimeout(() => setSuccessMessage(null), 5000)
      
    } catch (err: any) {
      setError(err?.message || 'Failed to create duration option')
    } finally {
      setSaving(false)
    }
  }

  // Update existing option
  const updateOption = async (optionId: number, updates: ServiceDurationOptionUpdate) => {
    if (!selectedTemplate) return

    try {
      setSaving(true)
      setError(null)
      
      await serviceTemplateService.updateDurationOption(optionId, updates)
      await loadDurationOptions(selectedTemplate.id)
      
      setEditingOption(null)
      setSuccessMessage('Duration option updated successfully!')
      setTimeout(() => setSuccessMessage(null), 5000)
      
    } catch (err: any) {
      setError(err?.message || 'Failed to update duration option')
    } finally {
      setSaving(false)
    }
  }

  // Delete option
  const deleteOption = async (optionId: number) => {
    if (!selectedTemplate) return
    
    if (!window.confirm('Are you sure you want to delete this duration option? This will affect all consultants using this service template.')) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      await serviceTemplateService.deleteDurationOption(optionId)
      await loadDurationOptions(selectedTemplate.id)
      
      // Update duration options count for this template
      setDurationOptionsCount(prev => ({
        ...prev,
        [selectedTemplate.id]: Math.max(0, (prev[selectedTemplate.id] || 0) - 1)
      }))
      
      setSuccessMessage('Duration option deleted successfully!')
      setTimeout(() => setSuccessMessage(null), 5000)
      
    } catch (err: any) {
      setError(err?.message || 'Failed to delete duration option')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading service templates...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Duration Options Management
            </h2>
            <p className="text-blue-100">Configure duration options for service templates</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{serviceTemplates.length}</div>
              <div className="text-xs text-blue-100">Templates</div>
            </div>
            {onClose && (
              <Button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Templates List */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Service Templates
            </h3>
            
            <div className="space-y-3">
              {serviceTemplates.map(template => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedTemplate?.id === template.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Price: ${template.min_price} - ${template.max_price}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Duration Options: {selectedTemplate?.id === template.id ? durationOptions.length : (durationOptionsCount[template.id] || 0)}
                        {/* Debug: {JSON.stringify(durationOptionsCount)} */}
                      </p>
                    </div>
                    <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Duration Options Management */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Duration Options
                {selectedTemplate && (
                  <span className="text-sm font-normal text-gray-500">
                    for {selectedTemplate.name}
                  </span>
                )}
              </h3>
              {selectedTemplate && (
                <Button
                  onClick={startAddingOption}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}
            </div>

            {!selectedTemplate ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p>Select a service template to manage duration options</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Add New Option Form */}
                {showAddForm && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-4">Add New Duration Option</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newOption.duration_minutes}
                          onChange={(e) => setNewOption((prev: ServiceDurationOptionCreate) => ({
                            ...prev,
                            duration_minutes: parseInt(e.target.value) || 0
                          }))}
                          min="15"
                          step="15"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duration Label
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newOption.duration_label}
                          onChange={(e) => setNewOption((prev: ServiceDurationOptionCreate) => ({
                            ...prev,
                            duration_label: e.target.value
                          }))}
                          placeholder="e.g., 30 minutes"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Price ($)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newOption.min_price}
                          onChange={(e) => setNewOption((prev: ServiceDurationOptionCreate) => ({
                            ...prev,
                            min_price: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="5"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Price ($)
                        </label>
                        <input
                          type="number"
                          className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={newOption.max_price}
                          onChange={(e) => setNewOption((prev: ServiceDurationOptionCreate) => ({
                            ...prev,
                            max_price: parseFloat(e.target.value) || 0
                          }))}
                          min="0"
                          step="5"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={saveNewOption}
                        disabled={saving || !newOption.duration_label || newOption.min_price >= newOption.max_price}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Option
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddForm(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Duration Options List */}
                {durationOptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p>No duration options configured yet</p>
                    <p className="text-sm">Click "Add Option" to create the first one</p>
                  </div>
                ) : (
                  durationOptions
                    .sort((a, b) => a.order_index - b.order_index)
                    .map(option => (
                      <DurationOptionItem
                        key={option.id}
                        option={option}
                        isEditing={editingOption?.id === option.id}
                        onStartEdit={() => startEditingOption(option)}
                        onSave={(updates) => updateOption(option.id, updates)}
                        onDelete={() => deleteOption(option.id)}
                        onCancelEdit={() => setEditingOption(null)}
                        saving={saving}
                      />
                    ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface DurationOptionItemProps {
  option: ServiceDurationOption
  isEditing: boolean
  onStartEdit: () => void
  onSave: (updates: ServiceDurationOptionUpdate) => void
  onDelete: () => void
  onCancelEdit: () => void
  saving: boolean
}

function DurationOptionItem({ 
  option, 
  isEditing, 
  onStartEdit, 
  onSave, 
  onDelete, 
  onCancelEdit, 
  saving 
}: DurationOptionItemProps) {
  const [editData, setEditData] = useState<ServiceDurationOptionUpdate>({
    duration_minutes: option.duration_minutes,
    duration_label: option.duration_label,
    min_price: option.min_price,
    max_price: option.max_price,
    order_index: option.order_index,
    is_active: option.is_active
  })

  useEffect(() => {
    if (isEditing) {
      setEditData({
        duration_minutes: option.duration_minutes,
        duration_label: option.duration_label,
        min_price: option.min_price,
        max_price: option.max_price,
        order_index: option.order_index,
        is_active: option.is_active
      })
    }
  }, [isEditing, option])

  const handleSave = () => {
    onSave(editData)
  }

  return (
    <div className={`border-2 rounded-lg p-4 transition-all ${
      isEditing ? 'border-purple-200 bg-purple-50' : 'border-gray-200 bg-white'
    }`}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={editData.duration_minutes}
                onChange={(e) => setEditData((prev: ServiceDurationOptionUpdate) => ({
                  ...prev,
                  duration_minutes: parseInt(e.target.value) || 0
                }))}
                min="15"
                step="15"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration Label
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={editData.duration_label || ''}
                onChange={(e) => setEditData((prev: ServiceDurationOptionUpdate) => ({
                  ...prev,
                  duration_label: e.target.value
                }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price ($)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={editData.min_price}
                onChange={(e) => setEditData((prev: ServiceDurationOptionUpdate) => ({
                  ...prev,
                  min_price: parseFloat(e.target.value) || 0
                }))}
                min="0"
                step="5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price ($)
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={editData.max_price}
                onChange={(e) => setEditData((prev: ServiceDurationOptionUpdate) => ({
                  ...prev,
                  max_price: parseFloat(e.target.value) || 0
                }))}
                min="0"
                step="5"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={editData.is_active}
                onChange={(e) => setEditData((prev: ServiceDurationOptionUpdate) => ({
                  ...prev,
                  is_active: e.target.checked
                }))}
              />
              Active
            </label>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !editData.duration_label || (editData.min_price !== undefined && editData.max_price !== undefined && editData.min_price >= editData.max_price)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={onCancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {option.duration_minutes}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                minutes
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-gray-900">
                {option.duration_label}
              </h5>
              <p className="text-sm text-gray-600">
                ${option.min_price} - ${option.max_price}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={option.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
              {option.is_active ? 'Active' : 'Inactive'}
            </Badge>
            
            <Button
              size="sm"
              variant="outline"
              onClick={onStartEdit}
              disabled={saving}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            
            <Button
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              onClick={onDelete}
              disabled={saving}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
