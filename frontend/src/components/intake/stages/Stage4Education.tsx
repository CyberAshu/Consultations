import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { GraduationCap, Info, Award, FileCheck, BookOpen } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'
import { intakeService } from '../../../services/intakeService'

export function Stage4Education({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [showECAProvider, setShowECAProvider] = useState(false)
  const [showECAResult, setShowECAResult] = useState(false)

  useEffect(() => {
    setShowECAProvider(data.eca_status === 'yes')
    setShowECAResult(data.eca_status === 'yes')
  }, [data.eca_status])

  const handleFieldChange = (field: string, value: any) => {
    const updates: any = { [field]: value }
    
    // Clear ECA-related fields if status is not "yes"
    if (field === 'eca_status' && value !== 'yes') {
      updates.eca_provider = null
      updates.eca_result = null
    }
    
    onChange(updates)
  }

  const isStageComplete = () => {
    return !!data.highest_education
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Education History</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Your education credentials help determine eligibility for skilled worker programs and points calculation.
          </p>
          
          <div className="bg-indigo-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-indigo-800">
                <p className="font-medium mb-1">Education & Immigration:</p>
                <p>Higher education levels typically earn more points in Express Entry. An Educational Credential Assessment (ECA) validates foreign education for Canadian equivalency.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q4.1 Highest Education */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <BookOpen className="inline h-5 w-5 text-indigo-600 mr-2" />
                Q4.1: What is your highest completed level of education? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {options.highest_education.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.highest_education === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="highest_education"
                      value={option.value}
                      checked={data.highest_education === option.value}
                      onChange={(e) => handleFieldChange('highest_education', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.highest_education === option.value
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {data.highest_education === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Q4.2 ECA Status */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Award className="inline h-5 w-5 text-blue-600 mr-2" />
                Q4.2: Have you had your education assessed by an ECA organization?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {options.eca_status.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.eca_status === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="eca_status"
                      value={option.value}
                      checked={data.eca_status === option.value}
                      onChange={(e) => handleFieldChange('eca_status', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.eca_status === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {data.eca_status === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                An ECA (Educational Credential Assessment) validates your foreign education for Canadian immigration purposes.
              </p>
            </div>

            {/* Conditional ECA Questions */}
            {showECAProvider && (
              <div className="space-y-6 bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">ECA Assessment Details</h3>
                </div>

                {/* Q4.3 ECA Provider */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q4.3: Who issued your ECA?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {options.eca_provider.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          data.eca_provider === option.value
                            ? 'border-green-600 bg-green-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="eca_provider"
                          value={option.value}
                          checked={data.eca_provider === option.value}
                          onChange={(e) => handleFieldChange('eca_provider', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                            data.eca_provider === option.value
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300'
                          }`}>
                            {data.eca_provider === option.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q4.4 ECA Result */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q4.4: What Canadian equivalency was shown on your ECA?
                  </label>
                  <div className="max-w-md">
                    <select
                      value={data.eca_result || ''}
                      onChange={(e) => handleFieldChange('eca_result', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                    >
                      <option value="">Select Canadian equivalency</option>
                      <option value="below_high_school">Below high school</option>
                      <option value="secondary_school">Secondary school</option>
                      <option value="one_year">1-year certificate/diploma</option>
                      <option value="two_plus_years">2+ year diploma</option>
                      <option value="bachelors">Bachelor's degree</option>
                      <option value="masters">Master's degree</option>
                      <option value="doctorate">Doctorate degree</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    This is the Canadian educational equivalency stated in your ECA report
                  </p>
                </div>
              </div>
            )}

            {/* Information Cards Based on Selection */}
            {data.highest_education === 'bachelors' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Bachelor's Degree - Express Entry Points:</p>
                    <p>A bachelor's degree typically earns 120 points in Express Entry. Consider getting an ECA if completed outside Canada.</p>
                  </div>
                </div>
              </div>
            )}

            {data.highest_education === 'masters' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Master's Degree - Excellent for Immigration:</p>
                    <p>Master's degree earns 135 points in Express Entry and may qualify you for additional programs. Definitely get an ECA if completed outside Canada.</p>
                  </div>
                </div>
              </div>
            )}

            {data.eca_status === 'no' && data.highest_education && !['high_school'].includes(data.highest_education) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Consider Getting an ECA:</p>
                    <p>If your education was completed outside Canada, an ECA is typically required for Express Entry and most economic programs. It can significantly improve your application.</p>
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
                Stage 4 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.highest_education && 'Education Level',
                data.eca_status && 'ECA Status'
              ].filter(Boolean).length} of 2 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
