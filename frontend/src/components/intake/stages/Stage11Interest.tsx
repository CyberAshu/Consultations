import React from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Target, Info, MapPin, FileText, Users, GraduationCap } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'
import { intakeService } from '../../../services/intakeService'

export function Stage11Interest({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()

  const handleArrayToggle = (field: string, value: string) => {
    const currentArray = data[field] || []
    const isSelected = currentArray.includes(value)
    
    if (isSelected) {
      // Remove from array
      onChange({ [field]: currentArray.filter((item: string) => item !== value) })
    } else {
      // Add to array, but handle "not_sure" exclusively for some fields
      if (value === 'not_sure' && field === 'program_interest') {
        onChange({ [field]: ['not_sure'] })
      } else if (field === 'program_interest' && currentArray.includes('not_sure')) {
        // Remove "not_sure" when selecting specific programs
        onChange({ [field]: [value] })
      } else {
        onChange({ [field]: [...currentArray, value] })
      }
    }
  }

  const isStageComplete = () => {
    if (!data.program_interest || data.program_interest.length === 0) return false
    return true
  }

  const getSelectedPrograms = () => {
    return data.program_interest || []
  }

  const getSelectedProvinces = () => {
    return data.province_interest || []
  }

  const getProgramIcon = (programValue: string) => {
    const icons: Record<string, React.ReactNode> = {
      express_entry: <Target className="h-4 w-4" />,
      family_sponsorship: <Users className="h-4 w-4" />,
      study: <GraduationCap className="h-4 w-4" />,
      work: <FileText className="h-4 w-4" />,
      pnp: <MapPin className="h-4 w-4" />
    }
    return icons[programValue] || <Target className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Provincial/Program Interest</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Tell us about your immigration goals and location preferences to help us recommend the best pathways.
          </p>
          
          <div className="bg-indigo-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-indigo-800">
                <p className="font-medium mb-1">Strategic Planning:</p>
                <p>Different programs have different requirements and processing times. Your preferences help us create a tailored strategy that maximizes your chances of success.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q11.1 Program Interest */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Target className="inline h-5 w-5 text-indigo-600 mr-2" />
                Q11.1: Are you interested in any specific immigration program? <span className="text-red-500">*</span>
                <br />
                <span className="text-sm font-normal text-gray-600">Select all that apply</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {options.program_interest.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      getSelectedPrograms().includes(option.value)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={getSelectedPrograms().includes(option.value)}
                      onChange={() => handleArrayToggle('program_interest', option.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3 w-full">
                      <div className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center mt-0.5 ${
                        getSelectedPrograms().includes(option.value)
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {getSelectedPrograms().includes(option.value) && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getProgramIcon(option.value)}
                          <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                        </div>
                        
                        {/* Program descriptions */}
                        <p className="text-xs text-gray-600">
                          {option.value === 'express_entry' && 'Federal skilled worker program (CEC, FSW, CTC)'}
                          {option.value === 'family_sponsorship' && 'Sponsor spouse, children, parents, or grandparents'}
                          {option.value === 'study' && 'Study permits, student pathways to PR'}
                          {option.value === 'work' && 'Work permits, temporary foreign worker programs'}
                          {option.value === 'refugee_hc' && 'Refugee protection, humanitarian & compassionate'}
                          {option.value === 'pnp' && 'Provincial Nominee Programs'}
                          {option.value === 'rnip' && 'Rural and Northern Immigration Pilot'}
                          {option.value === 'aip' && 'Atlantic Immigration Program'}
                          {option.value === 'startup_visa' && 'For entrepreneurs with innovative business ideas'}
                          {option.value === 'iec' && 'International Experience Canada (Working Holiday)'}
                          {option.value === 'other' && 'Other immigration programs'}
                          {option.value === 'not_sure' && 'We\'ll help you identify the best options'}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Q11.2 Province Interest */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <MapPin className="inline h-5 w-5 text-green-600 mr-2" />
                Q11.2: Are you targeting any specific province/territory?
                <br />
                <span className="text-sm font-normal text-gray-600">Select all that apply, or leave blank if open to all</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.provinces.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      getSelectedProvinces().includes(option.value)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={getSelectedProvinces().includes(option.value)}
                      onChange={() => handleArrayToggle('province_interest', option.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 border-2 rounded flex-shrink-0 flex items-center justify-center ${
                        getSelectedProvinces().includes(option.value)
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {getSelectedProvinces().includes(option.value) && (
                          <div className="w-2 h-2 bg-white rounded-sm"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Different provinces have different PNP streams and job markets. We can help you choose based on your profile.
              </p>
            </div>

            {/* Information Cards Based on Selections */}
            {getSelectedPrograms().includes('express_entry') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Express Entry - Excellent Choice!</p>
                    <p>Express Entry is the fastest pathway to permanent residence for skilled workers. Strong language scores, education, and work experience are key to success.</p>
                  </div>
                </div>
              </div>
            )}

            {getSelectedPrograms().includes('pnp') && getSelectedProvinces().length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">PNP Strategy Identified!</p>
                    <p>You're interested in both PNP and specific provinces - perfect! We'll help you identify the best PNP streams for your selected provinces: {getSelectedProvinces().join(', ')}.</p>
                  </div>
                </div>
              </div>
            )}

            {getSelectedPrograms().includes('family_sponsorship') && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <p className="font-medium mb-1">Family Sponsorship Path:</p>
                    <p>Family sponsorship has specific requirements for both sponsor and applicant. We'll help you understand eligibility, processing times, and required documentation.</p>
                  </div>
                </div>
              </div>
            )}

            {getSelectedPrograms().includes('not_sure') && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">We're Here to Help!</p>
                    <p>No worries about being unsure! Based on your intake information, we'll recommend the most suitable immigration programs and create a personalized strategy for your success.</p>
                  </div>
                </div>
              </div>
            )}

            {(getSelectedPrograms().includes('aip') || getSelectedPrograms().includes('rnip')) && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-teal-800">
                    <p className="font-medium mb-1">Regional Programs Selected:</p>
                    <p>AIP and RNIP are excellent programs for specific regions with faster processing and lower competition. We'll help you understand community requirements and job opportunities.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selection Summary */}
      {(getSelectedPrograms().length > 0 || getSelectedProvinces().length > 0) && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-indigo-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Selection Summary</h3>
            
            {getSelectedPrograms().length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Programs of Interest:</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedPrograms().map((program: string) => {
                    const option = options.program_interest.find(p => p.value === program)
                    return (
                      <span key={program} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {getProgramIcon(program)}
                        {option?.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
            
            {getSelectedProvinces().length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Province/Territory Preferences:</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedProvinces().map((province: string) => {
                    const option = options.provinces.find(p => p.value === province)
                    return (
                      <span key={province} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        <MapPin className="h-3 w-3" />
                        {option?.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                isStageComplete() ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Stage 11 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                getSelectedPrograms().length > 0 && 'Program Interest',
                'Optional Provinces'
              ].filter(Boolean).length} of 1 required completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
