import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Input } from '../../ui/Input'
import { Languages, Info, Calendar, Target, Award } from 'lucide-react'
import { IntakeStageProps } from './IntakeStage'

export function Stage5Language({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const [showTestDetails, setShowTestDetails] = useState(false)
  const [showScores, setShowScores] = useState(false)

  useEffect(() => {
    const hasTest = data.language_test_taken === 'yes'
    setShowTestDetails(hasTest)
    setShowScores(hasTest && data.test_type)
  }, [data.language_test_taken, data.test_type])

  const handleFieldChange = (field: string, value: any) => {
    const updates: any = { [field]: value }
    
    // Clear dependent fields when test status changes
    if (field === 'language_test_taken' && value !== 'yes') {
      updates.test_type = null
      updates.test_date = null
      updates.language_scores = null
    }
    
    onChange(updates)
  }

  const handleScoreChange = (skill: string, score: number) => {
    const currentScores = data.language_scores || {}
    onChange({
      language_scores: {
        ...currentScores,
        [skill]: score
      }
    })
  }

  const getScoreRange = (testType: string) => {
    switch (testType) {
      case 'ielts':
        return { min: 0, max: 9, step: 0.5 }
      case 'celpip':
        return { min: 1, max: 12, step: 1 }
      case 'tef':
        return { min: 0, max: 450, step: 1 }
      case 'tcf':
        return { min: 0, max: 699, step: 1 }
      default:
        return { min: 0, max: 10, step: 0.5 }
    }
  }

  const scoreRange = data.test_type ? getScoreRange(data.test_type) : { min: 0, max: 10, step: 0.5 }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Languages className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Language Skills</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Language proficiency is crucial for Express Entry and most immigration programs.
          </p>
          
          <div className="bg-blue-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Language & Points:</p>
                <p>Strong language scores can earn up to 136 points in Express Entry. IELTS and CELPIP are most common, while TEF and TCF are for French.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q5.1 Language Test Taken */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Target className="inline h-5 w-5 text-blue-600 mr-2" />
                Q5.1: Have you taken a language test?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'booked', label: 'Booked' },
                  { value: 'not_sure', label: 'Not sure' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.language_test_taken === option.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="language_test_taken"
                      value={option.value}
                      checked={data.language_test_taken === option.value}
                      onChange={(e) => handleFieldChange('language_test_taken', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full justify-center">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.language_test_taken === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {data.language_test_taken === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Test Details */}
            {showTestDetails && (
              <div className="space-y-6 bg-green-50 p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Test Details</h3>
                </div>

                {/* Q5.2 Test Type */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q5.2: What test did you take?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { value: 'ielts', label: 'IELTS' },
                      { value: 'celpip', label: 'CELPIP' },
                      { value: 'tef', label: 'TEF' },
                      { value: 'tcf', label: 'TCF' }
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          data.test_type === option.value
                            ? 'border-green-600 bg-green-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="test_type"
                          value={option.value}
                          checked={data.test_type === option.value}
                          onChange={(e) => handleFieldChange('test_type', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                            data.test_type === option.value
                              ? 'border-green-600 bg-green-600'
                              : 'border-gray-300'
                          }`}>
                            {data.test_type === option.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Q5.3 Test Date */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Q5.3: Date of most recent test
                  </label>
                  <div className="max-w-xs">
                    <Input
                      type="date"
                      value={data.test_date ? data.test_date.split('T')[0] : ''}
                      onChange={(e) => handleFieldChange('test_date', e.target.value)}
                      className="font-medium"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Language test results are typically valid for 2 years
                  </p>
                </div>

                {/* Q5.4 Language Scores */}
                {showScores && (
                  <div>
                    <label className="block text-md font-semibold text-gray-700 mb-4">
                      Q5.4: Enter your scores for {data.test_type?.toUpperCase()}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {['listening', 'speaking', 'reading', 'writing'].map((skill) => (
                        <div key={skill} className="bg-white p-4 border-2 border-gray-200 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {skill}
                          </label>
                          <Input
                            type="number"
                            min={scoreRange.min}
                            max={scoreRange.max}
                            step={scoreRange.step}
                            value={data.language_scores?.[skill] || ''}
                            onChange={(e) => handleScoreChange(skill, parseFloat(e.target.value) || 0)}
                            placeholder={`${scoreRange.min}-${scoreRange.max}`}
                            className="text-center text-lg font-medium"
                          />
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            {scoreRange.min} - {scoreRange.max}
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Score Information */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="font-medium text-blue-800 mb-1">CLB Levels:</p>
                        <p className="text-blue-700">
                          {data.test_type === 'ielts' && 'IELTS 6.0+ typically = CLB 7+ (good for Express Entry)'}
                          {data.test_type === 'celpip' && 'CELPIP 7+ typically = CLB 7+ (good for Express Entry)'}
                          {data.test_type === 'tef' && 'TEF scores vary by skill for CLB equivalency'}
                          {data.test_type === 'tcf' && 'TCF scores vary by skill for CLB equivalency'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium text-green-800 mb-1">Express Entry:</p>
                        <p className="text-green-700">
                          Higher scores = more points. CLB 9+ in all skills can earn maximum language points.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Information Cards Based on Selection */}
            {data.language_test_taken === 'no' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Language Test Recommended:</p>
                    <p>Most immigration programs require official language test results. Consider taking IELTS or CELPIP for English, or TEF/TCF for French.</p>
                  </div>
                </div>
              </div>
            )}

            {data.language_test_taken === 'booked' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Test Booked:</p>
                    <p>Great! Once you receive your results, you can update this information. Focus on achieving CLB 7+ in all skills for better Express Entry chances.</p>
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
                data.language_test_taken ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Stage 5 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.language_test_taken && 'Test Status',
                data.test_type && 'Test Type',
                data.language_scores && 'Scores'
              ].filter(Boolean).length} of 3 possible completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
