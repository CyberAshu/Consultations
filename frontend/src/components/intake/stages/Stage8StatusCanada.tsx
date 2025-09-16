import React from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { MapPin, Info, Calendar, Flag, Clock } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'
import { intakeService } from '../../../services/intakeService'

export function Stage8StatusCanada({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  // Only show this stage if user is inside Canada
  if (intake.location !== 'inside_canada') {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-6 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Stage 8: Not Applicable</h2>
          <p className="text-gray-600">
            This stage is only for applicants currently in Canada. Since you indicated you're {intake.location?.replace('_', ' ')}, we'll skip this section.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getStatusExpiryWarning = () => {
    if (!data.status_expiry) return null
    
    const expiryDate = new Date(data.status_expiry)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { type: 'expired', message: 'Your status has expired. You may need to restore your status or apply for a new one.' }
    } else if (daysUntilExpiry < 90) {
      return { type: 'expiring', message: `Your status expires in ${daysUntilExpiry} days. Consider applying for an extension or new status soon.` }
    } else if (daysUntilExpiry < 180) {
      return { type: 'warning', message: `Your status expires in ${daysUntilExpiry} days. Start planning for renewal or next steps.` }
    }
    
    return null
  }

  const statusWarning = getStatusExpiryWarning()

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Flag className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-gray-900">Status in Canada</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Since you're in Canada, we need to understand your current immigration status and legal authorization to stay.
          </p>
          
          <div className="bg-red-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Status Matters:</p>
                <p>Your current status affects which immigration programs you can apply for and whether you can apply from within Canada (inland) or must apply from outside (outland).</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q8.1 Current Status */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Flag className="inline h-5 w-5 text-red-600 mr-2" />
                Q8.1: What is your current status in Canada?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {options.canadian_status.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.current_status === option.value
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="current_status"
                      value={option.value}
                      checked={data.current_status === option.value}
                      onChange={(e) => handleFieldChange('current_status', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.current_status === option.value
                          ? 'border-red-600 bg-red-600'
                          : 'border-gray-300'
                      }`}>
                        {data.current_status === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p><strong>Visitor:</strong> Tourist, family visit (usually 6 months)</p>
                <p><strong>Student:</strong> Study permit holder</p>
                <p><strong>Worker:</strong> Work permit holder</p>
                <p><strong>PGWP:</strong> Post-Graduation Work Permit holder</p>
              </div>
            </div>

            {/* Q8.2 Status Expiry */}
            {data.current_status && data.current_status !== 'no_status' && (
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  <Calendar className="inline h-5 w-5 text-blue-600 mr-2" />
                  Q8.2: When does your current status expire?
                </label>
                <div className="max-w-xs">
                  <Input
                    type="date"
                    value={data.status_expiry ? data.status_expiry.split('T')[0] : ''}
                    onChange={(e) => handleFieldChange('status_expiry', e.target.value)}
                    className="font-medium"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Check your passport stamp, permit, or visa for the expiry date
                </p>
              </div>
            )}

            {/* Q8.3 Province Residing */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <MapPin className="inline h-5 w-5 text-green-600 mr-2" />
                Q8.3: Which province are you currently living in?
              </label>
              <div className="max-w-md">
                <select
                  value={data.province_residing || ''}
                  onChange={(e) => handleFieldChange('province_residing', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                >
                  <option value="">Select your current province</option>
                  {options.provinces.filter(p => p.value !== 'not_sure').map((province) => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Your current province may have specific immigration programs (PNP)
              </p>
            </div>

            {/* Status Expiry Warning */}
            {statusWarning && (
              <div className={`rounded-lg p-4 border ${
                statusWarning.type === 'expired' ? 'bg-red-50 border-red-200' :
                statusWarning.type === 'expiring' ? 'bg-orange-50 border-orange-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-3">
                  <Clock className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    statusWarning.type === 'expired' ? 'text-red-600' :
                    statusWarning.type === 'expiring' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                  <div className={`text-sm ${
                    statusWarning.type === 'expired' ? 'text-red-800' :
                    statusWarning.type === 'expiring' ? 'text-orange-800' :
                    'text-yellow-800'
                  }`}>
                    <p className="font-medium mb-1">
                      {statusWarning.type === 'expired' ? 'Status Expired!' :
                       statusWarning.type === 'expiring' ? 'Status Expiring Soon!' :
                       'Status Renewal Reminder'}
                    </p>
                    <p>{statusWarning.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Status-specific Information */}
            {data.current_status === 'student' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Student Status - Good Options:</p>
                    <p>As a student, you may be eligible for PGWP after graduation, CEC after work experience, and various PNP streams. Maintain your status and academic standing.</p>
                  </div>
                </div>
              </div>
            )}

            {data.current_status === 'pgwp' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">PGWP - Excellent Position!</p>
                    <p>With a PGWP, you can gain Canadian work experience for CEC, apply through PNP, and earn extra points in Express Entry. Make the most of this opportunity!</p>
                  </div>
                </div>
              </div>
            )}

            {data.current_status === 'worker' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Work Permit Holder:</p>
                    <p>Your Canadian work experience counts toward CEC eligibility. Consider Express Entry and PNP options based on your occupation and location.</p>
                  </div>
                </div>
              </div>
            )}

            {data.current_status === 'visitor' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Visitor Status:</p>
                    <p>As a visitor, you cannot work or study without proper authorization. Consider applying for appropriate permits or immigration programs from within Canada if eligible.</p>
                  </div>
                </div>
              </div>
            )}

            {data.current_status === 'no_status' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">No Status - Urgent Action Needed:</p>
                    <p>Being without status is serious. You may need to restore status, apply for a permit, or consider your immigration options urgently. Consult with an immigration lawyer.</p>
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
                data.current_status && data.province_residing ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Stage 8 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.current_status && 'Current Status',
                data.province_residing && 'Province',
                (data.current_status === 'no_status' || data.status_expiry) && 'Complete'
              ].filter(Boolean).length} of 3 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
