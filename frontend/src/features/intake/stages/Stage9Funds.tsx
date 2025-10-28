import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { CreditCard, Info, Users, DollarSign, Heart } from 'lucide-react'
import { IntakeStageProps } from '../components/IntakeStage'
import { intakeService } from '../../../api/services/intake.service'

export function Stage9Funds({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [showRelationshipType, setShowRelationshipType] = useState(false)

  useEffect(() => {
    setShowRelationshipType(data.family_ties === true)
  }, [data.family_ties])

  const handleFieldChange = (field: string, value: any) => {
    const updates: any = { [field]: value }
    
    // Clear relationship type if no family ties
    if (field === 'family_ties' && value !== true) {
      updates.relationship_type = null
    }
    
    onChange(updates)
  }

  const isStageComplete = () => {
    if (!data.proof_of_funds) return false
    if (data.family_ties === undefined || data.family_ties === null) return false
    if (data.family_ties && !data.relationship_type) return false
    return true
  }

  const getFundsRequirement = () => {
    const familySize = (data.has_dependants ? (data.dependants_count || 0) : 0) + 1
    
    const requirements = {
      1: '$13,757',
      2: '$17,127',
      3: '$21,055',
      4: '$25,564',
      5: '$28,994',
      6: '$32,700',
      7: '$36,407'
    }
    
    return requirements[Math.min(familySize, 7) as keyof typeof requirements] || '$36,407+'
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Proof of Funds & Settlement Ties</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Financial resources and family connections in Canada can significantly impact your immigration success.
          </p>
          
          <div className="bg-emerald-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-emerald-800">
                <p className="font-medium mb-1">Why This Matters:</p>
                <p>Proof of funds shows you can support yourself and your family initially. Family ties can provide adaptation points and support networks for successful settlement.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q9.1 Proof of Funds */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <DollarSign className="inline h-5 w-5 text-emerald-600 mr-2" />
                Q9.1: How much do you have available to support yourself/family? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {options.proof_of_funds.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.proof_of_funds === option.value
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="proof_of_funds"
                      value={option.value}
                      checked={data.proof_of_funds === option.value}
                      onChange={(e) => handleFieldChange('proof_of_funds', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full justify-center">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.proof_of_funds === option.value
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300'
                      }`}>
                        {data.proof_of_funds === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm text-center">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Funds Requirement Info */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Estimated Requirement:</p>
                    <p>
                      For Express Entry, a family of {((data.has_dependants ? (data.dependants_count || 0) : 0) + 1)} typically needs <strong>{getFundsRequirement()}</strong> CAD.
                      This covers initial settlement costs for 3-6 months.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Q9.2 Family Ties */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Users className="inline h-5 w-5 text-purple-600 mr-2" />
                Q9.2: Do you have close family in Canada? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.family_ties === true
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="family_ties"
                    value="true"
                    checked={data.family_ties === true}
                    onChange={() => handleFieldChange('family_ties', true)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      data.family_ties === true
                        ? 'border-green-600 bg-green-600'
                        : 'border-gray-300'
                    }`}>
                      {data.family_ties === true && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">Yes</span>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    data.family_ties === false
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="family_ties"
                    value="false"
                    checked={data.family_ties === false}
                    onChange={() => handleFieldChange('family_ties', false)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      data.family_ties === false
                        ? 'border-red-600 bg-red-600'
                        : 'border-gray-300'
                    }`}>
                      {data.family_ties === false && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900">No</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Relationship Type */}
            {showRelationshipType && (
              <div className="space-y-4 bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Family Member Details</h3>
                </div>

                {/* Q9.3 Relationship Type */}
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-3">
                    Q9.3: What is their relationship to you? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {options.relationship_types.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          data.relationship_type === option.value
                            ? 'border-purple-600 bg-purple-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="relationship_type"
                          value={option.value}
                          checked={data.relationship_type === option.value}
                          onChange={(e) => handleFieldChange('relationship_type', e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-2 w-full justify-center">
                          <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${
                            data.relationship_type === option.value
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-gray-300'
                          }`}>
                            {data.relationship_type === option.value && (
                              <div className="w-full h-full rounded-full bg-white scale-50"></div>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Close family members can provide adaptation points in Express Entry
                  </p>
                </div>
              </div>
            )}

            {/* Information Cards Based on Selection */}
            {data.proof_of_funds === 'over_50k' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">Excellent Financial Position!</p>
                    <p>Having over $50,000 puts you well above minimum requirements and shows strong financial stability for immigration officers.</p>
                  </div>
                </div>
              </div>
            )}

            {data.proof_of_funds === 'under_5k' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Consider Building Your Funds:</p>
                    <p>Most immigration programs require higher funds for settlement. Consider saving more or exploring programs with lower financial requirements.</p>
                  </div>
                </div>
              </div>
            )}

            {data.family_ties === true && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Family Ties Advantage:</p>
                    <p>Having close family in Canada can earn you 5-15 extra points in Express Entry and provides valuable settlement support.</p>
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
                Stage 9 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.proof_of_funds && 'Proof of Funds',
                data.family_ties !== undefined && data.family_ties !== null && 'Family Ties',
                (!data.family_ties || data.relationship_type) && 'Complete'
              ].filter(Boolean).length} of 3 completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
