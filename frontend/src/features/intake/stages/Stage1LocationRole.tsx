import React from 'react'
import { Card, CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { Button } from '../../../components/common/Button'
import { MapPin, User, Info } from 'lucide-react'
import { IntakeStageProps } from '../components/IntakeStage'
import { intakeService } from '../../../api/services/intake.service'

export function Stage1LocationRole({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Location & Role</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Let's start by understanding where you are and your role in the immigration process.
          </p>
          
          <div className="bg-blue-100 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Why we ask this:</p>
                <p>Your location determines which immigration pathways are available to you (inland vs. outland), and your role helps us understand your specific needs and obligations in the process.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Location Question */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Where are you completing this form from? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {options.location.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.location === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="location"
                      value={option.value}
                      checked={data.location === option.value}
                      onChange={(e) => handleFieldChange('location', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.location === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {data.location === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                This helps us direct you to services that match your current situation.
              </p>
            </div>

            {/* Client Role Question */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What is your role in this process? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {options.client_role.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.client_role === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="client_role"
                      value={option.value}
                      checked={data.client_role === option.value}
                      onChange={(e) => handleFieldChange('client_role', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.client_role === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {data.client_role === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional information based on selections */}
            {data.location === 'inside_canada' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Inland Application Path</p>
                    <p>Since you're in Canada, we'll focus on inland pathways and programs available to you. We'll also need to know about your current status in Canada.</p>
                  </div>
                </div>
              </div>
            )}

            {data.location === 'outside_canada' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Outland Application Path</p>
                    <p>Since you're outside Canada, we'll focus on outland pathways and help you understand the process of moving to Canada.</p>
                  </div>
                </div>
              </div>
            )}

            {data.client_role === 'sponsor' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Sponsor Role</p>
                    <p>As a sponsor, we'll focus on your eligibility to sponsor and the requirements you need to meet. We'll also gather information about the person you're sponsoring.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Messages */}
      {(!data.location || !data.client_role) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                Please complete both questions before proceeding.
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
