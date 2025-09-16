import React, { useState } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Briefcase, Info, Clock, Globe, Award, Building } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'
import { intakeService } from '../../../services/intakeService'

export function Stage6Work({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [nocInput, setNocInput] = useState('')
  const [countryInput, setCountryInput] = useState('')

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleArrayAdd = (field: string, value: string, inputSetter?: (value: string) => void) => {
    if (!value.trim()) return
    
    const currentArray = data[field] || []
    if (!currentArray.includes(value.trim())) {
      onChange({ [field]: [...currentArray, value.trim()] })
    }
    if (inputSetter) inputSetter('')
  }

  const handleArrayRemove = (field: string, valueToRemove: string) => {
    const currentArray = data[field] || []
    onChange({ [field]: currentArray.filter((item: string) => item !== valueToRemove) })
  }

  const isStageComplete = () => {
    return data.years_experience !== undefined && data.years_experience !== null
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-900">Work History</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Your professional experience is crucial for immigration programs, especially Express Entry.
          </p>
          
          <div className="bg-orange-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Work Experience & Points:</p>
                <p>Skilled work experience can earn up to 80 points in Express Entry. Canadian experience earns additional points. NOC codes help classify your occupation level.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q6.1 Years of Experience */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Clock className="inline h-5 w-5 text-orange-600 mr-2" />
                Q6.1: How many years of full-time skilled work experience do you have? <span className="text-red-500">*</span>
              </label>
              <div className="max-w-xs">
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={data.years_experience || ''}
                  onChange={(e) => handleFieldChange('years_experience', parseInt(e.target.value) || 0)}
                  placeholder="Enter years"
                  className="text-center text-lg font-medium"
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Count only full-time skilled work (NOC TEER 0, 1, 2, or 3). Part-time work counts as half.
              </p>
            </div>

            {/* Q6.2 NOC Codes */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Award className="inline h-5 w-5 text-blue-600 mr-2" />
                Q6.2: What job titles have you held (NOC if known)?
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={nocInput}
                    onChange={(e) => setNocInput(e.target.value)}
                    placeholder="e.g., Software Engineer, NOC 21231"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleArrayAdd('noc_codes', nocInput, setNocInput)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('noc_codes', nocInput, setNocInput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* Display added NOC codes */}
                {data.noc_codes && data.noc_codes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.noc_codes.map((noc: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {noc}
                        <button
                          onClick={() => handleArrayRemove('noc_codes', noc)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Add your main job titles. Include NOC codes if you know them (e.g., 21211 for Data Scientists).
              </p>
            </div>

            {/* Q6.3 TEER Level */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Building className="inline h-5 w-5 text-green-600 mr-2" />
                Q6.3: TEER level of your main occupation (if known)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {options.teer_levels.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      data.teer_level === option.value
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="teer_level"
                      value={option.value}
                      checked={data.teer_level === option.value}
                      onChange={(e) => handleFieldChange('teer_level', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2 w-full justify-center">
                      <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                        data.teer_level === option.value
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {data.teer_level === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p><strong>TEER 0:</strong> Management occupations</p>
                <p><strong>TEER 1:</strong> Professional occupations (university degree)</p>
                <p><strong>TEER 2:</strong> Technical occupations (college/apprenticeship)</p>
                <p><strong>TEER 3:</strong> Technical support (high school + training)</p>
              </div>
            </div>

            {/* Q6.4 Regulated Occupation */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Q6.4: Is your job a regulated occupation in Canada?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'not_sure', label: 'Not sure' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.regulated_occupation === option.value
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="regulated_occupation"
                      value={option.value}
                      checked={data.regulated_occupation === option.value}
                      onChange={(e) => handleFieldChange('regulated_occupation', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.regulated_occupation === option.value
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-300'
                      }`}>
                        {data.regulated_occupation === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Regulated occupations (like doctors, engineers, teachers) require licensing in Canada.
              </p>
            </div>

            {/* Q6.5 Work Countries */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Globe className="inline h-5 w-5 text-indigo-600 mr-2" />
                Q6.5: Where did you gain this experience?
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={countryInput}
                    onChange={(e) => setCountryInput(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select a country</option>
                    {options.countries.map((country) => (
                      <option key={country.value} value={country.label}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleArrayAdd('work_country', countryInput, setCountryInput)}
                    disabled={!countryInput}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                
                {/* Display added countries */}
                {data.work_country && data.work_country.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {data.work_country.map((country: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {country}
                        <button
                          onClick={() => handleArrayRemove('work_country', country)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Canadian work experience earns additional points in Express Entry.
              </p>
            </div>

            {/* Information Cards */}
            {data.years_experience > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Work Experience Points:</p>
                    <p>
                      {data.years_experience >= 6 && "Excellent! 6+ years earns maximum work experience points (80)."}
                      {data.years_experience >= 3 && data.years_experience < 6 && "Great! 3+ years earns good points in Express Entry."}
                      {data.years_experience >= 1 && data.years_experience < 3 && "Good start! 1+ years qualifies for Express Entry."}
                      {data.years_experience < 1 && "Consider gaining more skilled work experience for better Express Entry eligibility."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {data.regulated_occupation === 'yes' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Regulated Occupation:</p>
                    <p>You'll need to obtain a license from the relevant provincial regulatory body before working in Canada. This process can take time, so plan accordingly.</p>
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
                Stage 6 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.years_experience !== undefined && data.years_experience !== null && 'Experience Years',
                data.noc_codes && data.noc_codes.length > 0 && 'Job Titles',
                data.teer_level && 'TEER Level'
              ].filter(Boolean).length} of 3 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
