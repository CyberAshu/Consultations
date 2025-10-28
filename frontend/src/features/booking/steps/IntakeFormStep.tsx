import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../../components/common/Card'
import { Button } from '../../../components/common/Button'
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
  Shield,
  RefreshCw
} from 'lucide-react'
import { intakeService } from '../../../api/services/intake.service'

interface IntakeFormStepProps {
  onDataChange: (data: any) => void
  service: any
  currentData: any
}

export function IntakeFormStep({ onDataChange, service, currentData }: IntakeFormStepProps) {
  const formMethod = 'embedded' // Always use embedded form only
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [formComplete, setFormComplete] = useState(false)
  const [optionalUploads, setOptionalUploads] = useState<any[]>([])
  const [existingIntake, setExistingIntake] = useState<any>(null)
  const [, setLoadingIntake] = useState(true) // loadingIntake removed - not used
  const [showIntakeOption, setShowIntakeOption] = useState(false)
  
  // Form data state - simplified
  const [formData, setFormData] = useState({
    useExistingIntake: false
  })

  // Load existing intake data on component mount
  useEffect(() => {
    const loadExistingIntake = async () => {
      try {
        setLoadingIntake(true)
        const intake = await intakeService.getMyIntakeSummary()
        if (intake && intake.completion_percentage > 0) {
          setExistingIntake(intake)
          setShowIntakeOption(true)
          // Auto-complete form if user has intake data
          setFormComplete(true)
          setFormData({ useExistingIntake: true })
        } else {
          // No intake data, but still allow to proceed
          setFormComplete(true) // Allow booking completion
          setFormData({ useExistingIntake: false })
        }
      } catch (error) {
        // No existing intake data found (this is normal for new users)
        // Allow to proceed even without intake
        setFormComplete(true)
        setFormData({ useExistingIntake: false })
      } finally {
        setLoadingIntake(false)
      }
    }
    
    loadExistingIntake()
  }, [])

  useEffect(() => {
    onDataChange({
      intakeForm: {
        method: formMethod,
        completed: formComplete,
        uploadedFiles: uploadedFiles,
        optionalUploads: optionalUploads,
        formData: formData, // 🔥 Add form data
        existingIntake: existingIntake // Pass existing intake info
      }
    })
  }, [formMethod, formComplete, uploadedFiles, optionalUploads, formData, existingIntake, onDataChange])

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

      {/* Intake Step Completion Status */}
      {formComplete && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">
                  ✅ Intake Step Complete
                </h4>
                <p className="text-sm text-green-700">
                  {formData.useExistingIntake 
                    ? 'Using your existing intake data for this consultation.' 
                    : 'Ready to proceed with booking - intake information will be collected as needed.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Intake Data Display */}
      {showIntakeOption && existingIntake && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-gray-900">Intake Data Available</h4>
                </div>
                <p className="text-sm text-gray-600">
                  {Math.round(existingIntake.completion_percentage)}% completed • {existingIntake.completed_stages?.length || 0}/12 stages
                </p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => window.open('/intake', '_blank')}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Update
              </Button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${existingIntake.completion_percentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Intake Form Information */}
      {!showIntakeOption && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Intake Form</h3>
            </div>
            <p className="text-amber-800 mb-4">
              We need your intake information for this consultation. Please complete our detailed intake form to help your RCIC provide the best possible guidance.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.open('/intake', '_blank')}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Complete Intake Form
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setFormComplete(true)
                  setFormData({
                    useExistingIntake: false
                  })
                }}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Skip for Now
              </Button>
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
