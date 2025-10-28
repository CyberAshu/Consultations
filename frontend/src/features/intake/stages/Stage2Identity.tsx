import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { Button } from '../../../components/common/Button'
import { User, Mail, Phone, Globe, Shield, Info, Check } from 'lucide-react'
import { IntakeStageProps } from '../components/IntakeStage'
import { intakeService } from '../../../api/services/intake.service'

export function Stage2Identity({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [showOtherLanguage, setShowOtherLanguage] = useState(false)

  useEffect(() => {
    setShowOtherLanguage(data.preferred_language === 'other')
  }, [data.preferred_language])

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleConsentChange = (consentItem: string, checked: boolean) => {
    const currentConsents = data.consent_acknowledgement || []
    if (checked) {
      if (!currentConsents.includes(consentItem)) {
        onChange({ consent_acknowledgement: [...currentConsents, consentItem] })
      }
    } else {
      onChange({ 
        consent_acknowledgement: currentConsents.filter((item: string) => item !== consentItem)
      })
    }
  }

  const requiredConsents = [
    'data_use',
    'not_legal_advice',
    'privacy_terms'
  ]

  const consentLabels = {
    data_use: 'I agree to the use of my data to recommend immigration services.',
    not_legal_advice: 'I understand that this is not legal advice.',
    privacy_terms: 'I agree to the Privacy Policy and Terms of Service.'
  }

  const allConsentsChecked = requiredConsents.every(consent => 
    data.consent_acknowledgement?.includes(consent)
  )

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Identity, Contact & Consent</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Let's collect your basic contact information and ensure you understand how we'll use your data.
          </p>
          
          <div className="bg-green-100 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Privacy & Security:</p>
                <p>All information is encrypted and stored securely. We only use your data to provide better immigration services and will never share it without your explicit consent.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={data.full_name || ''}
                    onChange={(e) => handleFieldChange('full_name', e.target.value)}
                    className="pl-10"
                    placeholder="Enter your full legal name"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Use the name exactly as it appears on your official documents
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={data.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className="pl-10"
                    placeholder="your.email@example.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  We'll use this for all communication about your case
                </p>
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative max-w-md">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => handleFieldChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Include country code if outside North America
              </p>
            </div>

            {/* Language Preference */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Preferred Language for Communication *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {options.preferred_language.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.preferred_language === option.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="preferred_language"
                      value={option.value}
                      checked={data.preferred_language === option.value}
                      onChange={(e) => handleFieldChange('preferred_language', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.preferred_language === option.value
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {data.preferred_language === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Other Language Input */}
              {showOtherLanguage && (
                <div className="max-w-md">
                  <Input
                    type="text"
                    value={data.preferred_language_other || ''}
                    onChange={(e) => handleFieldChange('preferred_language_other', e.target.value)}
                    placeholder="Please specify your preferred language"
                    className="mt-2"
                  />
                </div>
              )}
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Timezone *
              </label>
              <div className="relative max-w-md">
                <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={data.timezone || ''}
                  onChange={(e) => handleFieldChange('timezone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select timezone</option>
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                  <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                  <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                  <option value="America/Halifax">Atlantic Time (Halifax)</option>
                  <option value="America/St_Johns">Newfoundland Time</option>
                  <option value="UTC">UTC/GMT</option>
                  <option value="Europe/London">London Time</option>
                  <option value="Asia/Dubai">Dubai Time</option>
                  <option value="Asia/Manila">Manila Time</option>
                  <option value="Asia/Kolkata">India Standard Time</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                This helps us schedule meetings at convenient times
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consent & Privacy */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Consent & Privacy</h3>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important Information:</p>
                <p>By proceeding, you acknowledge that this intake process is for assessment purposes only. Any consultation or advice will be provided by a licensed RCIC during your actual appointment.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {requiredConsents.map((consent) => (
              <label
                key={consent}
                className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.consent_acknowledgement?.includes(consent)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`mt-1 w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center ${
                  data.consent_acknowledgement?.includes(consent)
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {data.consent_acknowledgement?.includes(consent) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={data.consent_acknowledgement?.includes(consent) || false}
                  onChange={(e) => handleConsentChange(consent, e.target.checked)}
                  className="sr-only"
                />
                <div className="text-sm text-gray-900 leading-relaxed">
                  {consentLabels[consent as keyof typeof consentLabels]}
                  {consent === 'privacy_terms' && (
                    <div className="mt-2">
                      <a href="/privacy-policy" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                        Privacy Policy
                      </a>
                      {' • '}
                      <a href="/terms-of-service" target="_blank" className="text-blue-600 hover:text-blue-700 underline">
                        Terms of Service
                      </a>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {!allConsentsChecked && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Please acknowledge all consent items to proceed.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Summary */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                data.full_name && data.email && data.preferred_language && data.timezone && allConsentsChecked
                  ? 'bg-green-600'
                  : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Stage 2 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.full_name && 'Name',
                data.email && 'Email',
                data.preferred_language && 'Language',
                data.timezone && 'Timezone',
                allConsentsChecked && 'Consents'
              ].filter(Boolean).length} of 5 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
