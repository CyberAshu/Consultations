import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Briefcase, Info, Building, MapPin, DollarSign, FileText } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'
import { intakeService } from '../../../services/intakeService'

export function Stage7JobOffer({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [showJobDetails, setShowJobDetails] = useState(false)

  useEffect(() => {
    setShowJobDetails(data.job_offer_status === 'yes')
  }, [data.job_offer_status])

  const handleFieldChange = (field: string, value: any) => {
    const updates: any = { [field]: value }
    
    // Clear job-related fields if no job offer
    if (field === 'job_offer_status' && value !== 'yes') {
      updates.employer_name = null
      updates.job_location = null
      updates.wage_offer = null
      updates.lmia_status = null
    }
    
    onChange(updates)
  }

  const handleLocationChange = (field: string, value: string) => {
    const currentLocation = data.job_location || {}
    onChange({
      job_location: {
        ...currentLocation,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Job Offer & LMIA</h2>
          </div>
          <p className="text-gray-600 mb-6">
            A valid job offer can significantly boost your immigration application and may be required for certain programs.
          </p>
          
          <div className="bg-green-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Job Offer Benefits:</p>
                <p>A valid job offer can earn 50-200 extra points in Express Entry, qualify you for Provincial Nominee Programs, and provide a clear path to permanent residence.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q7.1 Job Offer Status */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Briefcase className="inline h-5 w-5 text-green-600 mr-2" />
                Q7.1: Do you have a job offer in Canada?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {options.job_offer_status.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.job_offer_status === option.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="job_offer_status"
                      value={option.value}
                      checked={data.job_offer_status === option.value}
                      onChange={(e) => handleFieldChange('job_offer_status', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.job_offer_status === option.value
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {data.job_offer_status === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Job Details */}
            {showJobDetails && (
              <div className="space-y-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Job Offer Details</h3>
                </div>

                {/* Q7.2 Employer Name */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    <Building className="inline h-4 w-4 mr-1" />
                    Q7.2: Employer/company name (if known)
                  </label>
                  <div className="max-w-md">
                    <Input
                      type="text"
                      value={data.employer_name || ''}
                      onChange={(e) => handleFieldChange('employer_name', e.target.value)}
                      placeholder="Enter employer name"
                      className="font-medium"
                    />
                  </div>
                </div>

                {/* Q7.3 Job Location */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Q7.3: Province & city of job offer
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Province</label>
                      <select
                        value={data.job_location?.province || ''}
                        onChange={(e) => handleLocationChange('province', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select province</option>
                        {options.provinces.map((province) => (
                          <option key={province.value} value={province.value}>
                            {province.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">City</label>
                      <Input
                        type="text"
                        value={data.job_location?.city || ''}
                        onChange={(e) => handleLocationChange('city', e.target.value)}
                        placeholder="Enter city name"
                      />
                    </div>
                  </div>
                </div>

                {/* Q7.4 Wage Offer */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Q7.4: What is the offered wage (CAD/hour)?
                  </label>
                  <div className="max-w-xs">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="number"
                        min="10"
                        max="200"
                        step="0.25"
                        value={data.wage_offer || ''}
                        onChange={(e) => handleFieldChange('wage_offer', parseFloat(e.target.value) || null)}
                        placeholder="25.00"
                        className="pl-10 text-center font-medium"
                      />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Enter the hourly wage in Canadian dollars. Annual salaries can be divided by 2080 hours.
                  </p>
                </div>

                {/* Q7.5 LMIA Status */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Q7.5: LMIA status
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    {options.lmia_status.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          data.lmia_status === option.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="lmia_status"
                          value={option.value}
                          checked={data.lmia_status === option.value}
                          onChange={(e) => handleFieldChange('lmia_status', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                            data.lmia_status === option.value
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {data.lmia_status === option.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600 space-y-1">
                    <p><strong>LMIA:</strong> Labour Market Impact Assessment - usually required for foreign workers</p>
                    <p><strong>Exempt:</strong> Some positions (NAFTA, intra-company transfers) don't need LMIA</p>
                  </div>
                </div>
              </div>
            )}

            {/* Information Cards Based on Selection */}
            {data.job_offer_status === 'yes' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Excellent! Job Offer Benefits:</p>
                    <p>A valid job offer supported by LMIA can earn 50-200 points in Express Entry, qualify you for PNP streams, and provide a direct pathway to permanent residence.</p>
                  </div>
                </div>
              </div>
            )}

            {data.job_offer_status === 'interviewing' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Good Progress!</p>
                    <p>Keep us updated on your interview progress. A job offer can significantly improve your immigration prospects.</p>
                  </div>
                </div>
              </div>
            )}

            {data.job_offer_status === 'no' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">No Job Offer - Other Options:</p>
                    <p>You can still immigrate through Express Entry, PNP, or other programs without a job offer. Strong language scores and education can compensate.</p>
                  </div>
                </div>
              </div>
            )}

            {data.lmia_status === 'exempt' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">LMIA Exempt - Bonus Points!</p>
                    <p>LMIA-exempt job offers often earn the maximum 200 points in Express Entry. This significantly boosts your chances.</p>
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
                data.job_offer_status ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Stage 7 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.job_offer_status && 'Job Offer Status',
                (data.job_offer_status !== 'yes' || data.employer_name) && 'Complete'
              ].filter(Boolean).length} of 2 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
