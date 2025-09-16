import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Users, Info, Heart, Baby } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'
import { intakeService } from '../../../services/intakeService'

export function Stage3Household({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [showDependantsQuestions, setShowDependantsQuestions] = useState(false)

  useEffect(() => {
    setShowDependantsQuestions(data.has_dependants === true)
  }, [data.has_dependants])

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleDependantsChange = (value: boolean) => {
    const updates: any = { has_dependants: value }
    
    // Clear dependent-related fields if "No" is selected
    if (!value) {
      updates.dependants_count = null
      updates.dependants_accompanying = null
    }
    
    onChange(updates)
  }

  const isStageComplete = () => {
    if (!data.marital_status) return false
    if (data.has_dependants === undefined || data.has_dependants === null) return false
    if (data.has_dependants && !data.dependants_count) return false
    return true
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Household Composition</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Understanding your family situation helps us recommend the right immigration pathway.
          </p>
          
          <div className="bg-purple-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-1">Why we ask this:</p>
                <p>Family composition affects eligibility for many programs, settlement funds requirements, and determines if you'll be applying as a family unit or individually.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q3.1 Marital Status */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Heart className="inline h-5 w-5 text-red-500 mr-2" />
                Q3.1: What is your marital status? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.marital_status.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.marital_status === option.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="marital_status"
                      value={option.value}
                      checked={data.marital_status === option.value}
                      onChange={(e) => handleFieldChange('marital_status', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.marital_status === option.value
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {data.marital_status === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Q3.2 Has Dependants */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Baby className="inline h-5 w-5 text-blue-500 mr-2" />
                Q3.2: Do you have children or dependants? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.has_dependants === true
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="has_dependants"
                    value="true"
                    checked={data.has_dependants === true}
                    onChange={() => handleDependantsChange(true)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      data.has_dependants === true
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {data.has_dependants === true && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Yes</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.has_dependants === false
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="has_dependants"
                    value="false"
                    checked={data.has_dependants === false}
                    onChange={() => handleDependantsChange(false)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      data.has_dependants === false
                        ? 'border-red-600 bg-red-600'
                        : 'border-gray-300'
                    }`}>
                      {data.has_dependants === false && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">No</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Questions for Dependants */}
            {showDependantsQuestions && (
              <div className="space-y-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Baby className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Dependant Information</h3>
                </div>

                {/* Q3.3 Dependants Count */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q3.3: How many dependants will be part of your application? <span className="text-red-500">*</span>
                  </label>
                  <div className="max-w-xs">
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={data.dependants_count || ''}
                      onChange={(e) => handleFieldChange('dependants_count', parseInt(e.target.value) || null)}
                      placeholder="Enter number"
                      className="text-center text-lg font-medium"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Include all children under 22 and any other dependants
                  </p>
                </div>

                {/* Q3.4 Dependants Accompanying */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q3.4: Will your dependants accompany you to Canada?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'some', label: 'Some' },
                      { value: 'none', label: 'None' },
                      { value: 'not_sure', label: 'Not Sure' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          data.dependants_accompanying === option.value
                            ? 'border-blue-600 bg-blue-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dependants_accompanying"
                          value={option.value}
                          checked={data.dependants_accompanying === option.value}
                          onChange={(e) => handleFieldChange('dependants_accompanying', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                            data.dependants_accompanying === option.value
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {data.dependants_accompanying === option.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isStageComplete() ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Stage 3 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.marital_status && 'Marital Status',
                data.has_dependants !== undefined && data.has_dependants !== null && 'Dependants Info',
                (!data.has_dependants || data.dependants_count) && 'Complete'
              ].filter(Boolean).length} of 3 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
