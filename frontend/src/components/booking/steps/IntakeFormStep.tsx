import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Button } from '../../shared/Button'
import { 
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Lock,
  Trash2,
  Eye,
  Info,
  Shield
} from 'lucide-react'

interface IntakeFormStepProps {
  onDataChange: (data: any) => void
  service: any
  currentData: any
}

export function IntakeFormStep({ onDataChange, service, currentData }: IntakeFormStepProps) {
  const [formMethod, setFormMethod] = useState('embedded')
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [formComplete, setFormComplete] = useState(false)
  const [optionalUploads, setOptionalUploads] = useState<any[]>([])
  
  // Form data states
  const [formData, setFormData] = useState({
    immigrationStatus: '',
    immigrationGoal: '',
    specificQuestions: '',
    previousApplications: {
      expressEntry: false,
      studyPermit: false,
      workPermit: false,
      visitorVisa: false
    }
  })

  useEffect(() => {
    onDataChange({
      intakeForm: {
        method: formMethod,
        completed: formComplete,
        uploadedFiles: uploadedFiles,
        optionalUploads: optionalUploads,
        formData: formData // 🔥 Add form data
      }
    })
  }, [formMethod, formComplete, uploadedFiles, optionalUploads, formData, onDataChange])

  // Required documents based on service type
  const getRequiredDocuments = (serviceType: string) => {
    const common = [
      'Government-issued photo ID (passport, driver\'s license)',
      'Proof of current status in Canada (if applicable)'
    ]

    switch (serviceType?.toLowerCase()) {
      case 'express entry consultation':
      case '60-minute deep dive':
        return [
          ...common,
          'Educational credentials and assessments',
          'Language test results (IELTS/CELPIP)',
          'Work experience letters',
          'Proof of funds statements'
        ]
      case 'document review':
        return [
          ...common,
          'All immigration forms to be reviewed',
          'Supporting documents for application'
        ]
      case 'pnp consultation':
        return [
          ...common,
          'Educational credentials',
          'Work experience documentation',
          'Language test results',
          'Provincial connection documents'
        ]
      default:
        return common
    }
  }

  const requiredDocs = getRequiredDocuments(service?.name)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isOptional = false) => {
    const files = Array.from(event.target.files || [])
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      isOptional,
      file
    }))

    if (isOptional) {
      setOptionalUploads(prev => [...prev, ...newFiles])
    } else {
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (fileId: string, isOptional = false) => {
    if (isOptional) {
      setOptionalUploads(prev => prev.filter(f => f.id !== fileId))
    } else {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFormComplete = () => {
    setFormComplete(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Intake Form & Documents
        </h2>
        <p className="text-gray-600">
          Complete the intake form and upload required documents for your {service?.name?.toLowerCase()}.
        </p>
      </div>

      {/* Service Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{service?.name}</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Please complete the intake form and upload the required documents before your consultation.
          </p>
          <div className="bg-blue-100 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Why we need this information:</p>
                <p>Your RCIC will review these documents before your session to provide more targeted and valuable advice.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Method Selection */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Intake Method</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label 
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                formMethod === 'embedded' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="form-method"
                value="embedded"
                checked={formMethod === 'embedded'}
                onChange={(e) => setFormMethod(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Quick Form</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fill out a simplified intake form right here
                  </p>
                </div>
              </div>
            </label>

            <label 
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                formMethod === 'external' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="form-method"
                value="external"
                checked={formMethod === 'external'}
                onChange={(e) => setFormMethod(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <ExternalLink className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900">Detailed Form (Tally/Typeform)</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete a comprehensive intake form externally
                  </p>
                </div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {formMethod === 'embedded' ? (
        /* Quick Embedded Form */
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Intake Form</h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Immigration Status
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.immigrationStatus}
                    onChange={(e) => setFormData(prev => ({...prev, immigrationStatus: e.target.value}))}
                  >
                    <option value="">Select status</option>
                    <option value="visitor">Visitor</option>
                    <option value="student">International Student</option>
                    <option value="worker">Temporary Worker</option>
                    <option value="permanent-resident">Permanent Resident</option>
                    <option value="citizen">Canadian Citizen</option>
                    <option value="outside-canada">Outside Canada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Immigration Goal
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.immigrationGoal}
                    onChange={(e) => setFormData(prev => ({...prev, immigrationGoal: e.target.value}))}
                  >
                    <option value="">Select goal</option>
                    <option value="express-entry">Express Entry (PR)</option>
                    <option value="pnp">Provincial Nominee Program</option>
                    <option value="study-permit">Study Permit</option>
                    <option value="work-permit">Work Permit</option>
                    <option value="family-sponsorship">Family Sponsorship</option>
                    <option value="visitor-visa">Visitor Visa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Questions or Concerns
                </label>
                <textarea
                  rows={4}
                  placeholder="Please describe your specific questions or what you'd like to discuss during the consultation..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.specificQuestions}
                  onChange={(e) => setFormData(prev => ({...prev, specificQuestions: e.target.value}))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Previous Immigration Applications
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={formData.previousApplications.expressEntry}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        previousApplications: {
                          ...prev.previousApplications, 
                          expressEntry: e.target.checked
                        }
                      }))}
                    />
                    <span className="text-sm">Express Entry profile submitted</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={formData.previousApplications.studyPermit}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        previousApplications: {
                          ...prev.previousApplications, 
                          studyPermit: e.target.checked
                        }
                      }))}
                    />
                    <span className="text-sm">Previous study permit applications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={formData.previousApplications.workPermit}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        previousApplications: {
                          ...prev.previousApplications, 
                          workPermit: e.target.checked
                        }
                      }))}
                    />
                    <span className="text-sm">Previous work permit applications</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={formData.previousApplications.visitorVisa}
                      onChange={(e) => setFormData(prev => ({
                        ...prev, 
                        previousApplications: {
                          ...prev.previousApplications, 
                          visitorVisa: e.target.checked
                        }
                      }))}
                    />
                    <span className="text-sm">Previous visitor visa applications</span>
                  </label>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleFormComplete}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Form
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* External Form Integration */
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="h-8 w-8 text-blue-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              External Intake Form
            </h3>
            <p className="text-gray-600 mb-6">
              Complete our comprehensive intake form using Tally or Typeform for a more detailed assessment.
            </p>

            {/* Mock External Form */}
            <div className="bg-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300 mb-6">
              <div className="text-center space-y-3">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-500">Tally/Typeform Integration</p>
                <p className="text-sm text-gray-400">
                  In production, this would embed the actual form widget
                </p>
                <Button 
                  onClick={handleFormComplete}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mock: Complete External Form
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-left">
                  <p className="font-medium text-blue-900">Comprehensive Assessment</p>
                  <p className="text-blue-700">
                    The external form includes detailed questions about your background, education, work experience, and immigration history.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Documents Upload */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
          
          <div className="mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-amber-900">Please upload the following documents:</p>
                  <ul className="text-amber-800 mt-2 space-y-1">
                    {requiredDocs.map((doc, index) => (
                      <li key={index}>• {doc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Drag and drop files here, or click to select</p>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => handleFileUpload(e, false)}
                className="hidden"
                id="required-files"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('required-files')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>

          {/* Uploaded Required Files */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Uploaded Files</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(file.id, false)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Document Uploads */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Uploads</h3>
          
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Helpful additional documents (optional):</p>
                  <ul className="text-blue-800 mt-2 space-y-1">
                    <li>• GCKey credentials for account access</li>
                    <li>• Partially completed IRCC forms</li>
                    <li>• Previous refusal letters</li>
                    <li>• Immigration medical exam results</li>
                    <li>• Police clearance certificates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Optional File Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-3">Upload optional documents</p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => handleFileUpload(e, true)}
                className="hidden"
                id="optional-files"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('optional-files')?.click()}
              >
                Choose Files
              </Button>
            </div>
          </div>

          {/* Uploaded Optional Files */}
          {optionalUploads.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Optional Files</h4>
              {optionalUploads.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFile(file.id, true)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Privacy & Security</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">End-to-End Encrypted</p>
                <p className="text-green-700">All uploads are encrypted during transfer and storage</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">RCIC Confidentiality</p>
                <p className="text-green-700">Your documents are only accessible to your chosen RCIC</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Secure Storage</p>
                <p className="text-green-700">Documents stored in compliance with Canadian privacy laws</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Trash2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Auto-Delete</p>
                <p className="text-green-700">Files automatically deleted after 30 days (unless requested otherwise)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
