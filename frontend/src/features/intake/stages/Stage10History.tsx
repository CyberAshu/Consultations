import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { History, Info, AlertCircle, FileX, Shield, Clock } from 'lucide-react'
import { IntakeStageProps } from '../components/IntakeStage'
import { intakeService } from '../../../api/services/intake.service'

export function Stage10History({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [showOutcomes, setShowOutcomes] = useState(false)

  useEffect(() => {
    setShowOutcomes(data.prior_applications === true)
  }, [data.prior_applications])

  const handleFieldChange = (field: string, value: any) => {
    const updates: any = { [field]: value }
    
    // Clear outcomes if no prior applications
    if (field === 'prior_applications' && value !== true) {
      updates.application_outcomes = []
    }
    
    onChange(updates)
  }

  const handleArrayToggle = (field: string, value: string) => {
    const currentArray = data[field] || []
    const isSelected = currentArray.includes(value)
    
    if (isSelected) {
      // Remove from array
      onChange({ [field]: currentArray.filter((item: string) => item !== value) })
    } else {
      // Add to array
      onChange({ [field]: [...currentArray, value] })
    }
  }

  const isStageComplete = () => {
    if (data.prior_applications === undefined || data.prior_applications === null) return false
    if (!data.inadmissibility_flags || data.inadmissibility_flags.length === 0) return false
    return true
  }

  const hasSerious = () => {
    const seriousFlags = ['criminality', 'medical', 'misrepresentation', 'overstay']
    return data.inadmissibility_flags?.some((flag: string) => seriousFlags.includes(flag))
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="h-6 w-6 text-amber-600" />
            <h2 className="text-xl font-bold text-gray-900">Application History & Inadmissibility</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Your immigration history and any potential inadmissibility issues help us assess your case accurately.
          </p>
          
          <div className="bg-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Honesty is Critical:</p>
                <p>Being transparent about your history is essential. Misrepresentation can result in bans from Canada. Most issues can be addressed with proper planning and disclosure.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q10.1 Prior Applications */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Clock className="inline h-5 w-5 text-amber-600 mr-2" />
                Q10.1: Have you previously applied to Canada? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.prior_applications === true
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="prior_applications"
                    value="true"
                    checked={data.prior_applications === true}
                    onChange={() => handleFieldChange('prior_applications', true)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      data.prior_applications === true
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300'
                    }`}>
                      {data.prior_applications === true && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Yes</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.prior_applications === false
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="prior_applications"
                    value="false"
                    checked={data.prior_applications === false}
                    onChange={() => handleFieldChange('prior_applications', false)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      data.prior_applications === false
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {data.prior_applications === false && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">No</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Application Outcomes */}
            {showOutcomes && (
              <div className="space-y-4 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <FileX className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Application History Details</h3>
                </div>

                {/* Q10.2 Application Outcomes */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q10.2: Any prior refusals or withdrawals? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {options.application_outcomes.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          data.application_outcomes?.includes(option.value)
                            ? 'border-blue-600 bg-blue-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={data.application_outcomes?.includes(option.value) || false}
                          onChange={() => handleArrayToggle('application_outcomes', option.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className={`w-4 h-4 border-2 rounded flex-shrink-0 flex items-center justify-center ${
                            data.application_outcomes?.includes(option.value)
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {data.application_outcomes?.includes(option.value) && (
                              <div className="w-2 h-2 bg-white rounded-sm"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Being honest about past refusals helps us understand your case better and plan accordingly.
                  </p>
                </div>
              </div>
            )}

            {/* Q10.3 Inadmissibility Flags */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Shield className="inline h-5 w-5 text-red-600 mr-2" />
                Q10.3: Have you ever faced any of these issues in Canada or any country? <span className="text-red-500">*</span>
                <br />
                <span className="text-sm font-normal text-gray-600">Select all that apply</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {options.inadmissibility_flags.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.inadmissibility_flags?.includes(option.value)
                        ? (option.value === 'none' ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50')
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={data.inadmissibility_flags?.includes(option.value) || false}
                      onChange={() => handleArrayToggle('inadmissibility_flags', option.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3 w-full">
                      <div className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center mt-0.5 ${
                        data.inadmissibility_flags?.includes(option.value)
                          ? (option.value === 'none' ? 'border-green-600 bg-green-600' : 'border-red-600 bg-red-600')
                          : 'border-gray-300'
                      }`}>
                        {data.inadmissibility_flags?.includes(option.value) && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                        {option.value === 'criminality' && (
                          <p className="text-xs text-gray-600 mt-1">Includes arrests, charges, convictions, even if dismissed</p>
                        )}
                        {option.value === 'medical' && (
                          <p className="text-xs text-gray-600 mt-1">Serious health conditions that may pose public health risks</p>
                        )}
                        {option.value === 'misrepresentation' && (
                          <p className="text-xs text-gray-600 mt-1">Providing false information or documents to immigration</p>
                        )}
                        {option.value === 'overstay' && (
                          <p className="text-xs text-gray-600 mt-1">Staying in Canada past authorized period</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Warning Messages */}
            {hasSerious() && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Potential Inadmissibility Issues Identified:</p>
                    <p>You've indicated potential inadmissibility issues. This doesn't automatically disqualify you, but it's crucial to work with an immigration lawyer to address these properly. Many issues can be overcome with the right approach.</p>
                  </div>
                </div>
              </div>
            )}

            {data.prior_applications === true && data.application_outcomes?.includes('refusal') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Previous Refusal Noted:</p>
                    <p>Having a previous refusal doesn't prevent future success, but we need to understand the reasons and address them properly. This often strengthens subsequent applications.</p>
                  </div>
                </div>
              </div>
            )}

            {data.inadmissibility_flags?.includes('none') && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Clean Record - Excellent!</p>
                    <p>Having no inadmissibility issues simplifies your immigration process significantly and improves your chances of success.</p>
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
                Stage 10 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.prior_applications !== undefined && data.prior_applications !== null && 'Prior Applications',
                data.inadmissibility_flags && data.inadmissibility_flags.length > 0 && 'Inadmissibility Check'
              ].filter(Boolean).length} of 2 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
