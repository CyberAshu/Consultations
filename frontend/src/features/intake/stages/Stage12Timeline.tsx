import React, { useState, useCallback, useEffect } from 'react'
import { Card, CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { Clock, Info, Calendar, Upload, FileText, X, Check, AlertCircle } from 'lucide-react'
import { IntakeStageProps } from '../components/IntakeStage'
import { intakeService } from '../../../api/services/intake.service'

export function Stage12Timeline({ data, onChange, intake, onSave, saving }: IntakeStageProps) {
  const options = intakeService.getStageOptions()
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  
  // Load existing documents on mount
  useEffect(() => {
    const loadExistingDocuments = async () => {
      try {
        const existingDocs = await intakeService.getMyDocuments(12)
        if (existingDocs && existingDocs.length > 0) {
          const fileInfos = existingDocs.map(doc => ({
            id: doc.id.toString(),
            name: doc.file_name,
            size: doc.file_size || 0,
            type: doc.file_type || '',
            uploadedAt: doc.uploaded_at,
            file_path: doc.file_path
          }))
          onChange({ uploaded_files: fileInfos })
        }
      } catch (error) {
        console.error('Failed to load existing documents:', error)
      }
    }
    
    loadExistingDocuments()
  }, [onChange])

  const handleFieldChange = (field: string, value: any) => {
    onChange({ [field]: value })
  }

  const handleArrayToggle = (field: string, value: string) => {
    const currentArray = data[field] || []
    const isSelected = currentArray.includes(value)
    
    if (isSelected) {
      onChange({ [field]: currentArray.filter((item: string) => item !== value) })
    } else {
      onChange({ [field]: [...currentArray, value] })
    }
  }

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    
    // Upload first file (or multiple files handling)
    if (files.length === 1) {
      handleFileUpload(files[0])
    } else {
      // Handle multiple files
      setUploadStatus(`Uploading ${files.length} files...`)
      files.forEach((file, index) => {
        setTimeout(() => handleFileUpload(file), index * 500) // Stagger uploads
      })
    }
  }, [data, onChange])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleFileUpload = async (file: File) => {
    // Check max files limit
    const currentFiles = getUploadedFiles()
    if (currentFiles.length >= 5) {
      setUploadStatus('Maximum 5 files allowed. Please remove some files first.')
      return
    }
    
    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg']
    
    if (file.size > maxSize) {
      setUploadStatus('File size must be less than 10MB')
      return
    }
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('File type not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.')
      return
    }

    try {
      setUploadStatus('Uploading...')
      
      // Upload to backend
      const uploadedFile = await intakeService.uploadDocument(file, 12)
      
      // Store the uploaded file info from backend response
      const fileInfo = {
        id: uploadedFile.id.toString(),
        name: uploadedFile.file_name,
        size: uploadedFile.file_size || file.size,
        type: uploadedFile.file_type || file.type,
        uploadedAt: uploadedFile.uploaded_at,
        file_path: uploadedFile.file_path
      }
      
      // Add to uploaded files list
      const currentFiles = (data as any).uploaded_files || []
      onChange({ uploaded_files: [...currentFiles, fileInfo] })
      
      setUploadStatus('File uploaded successfully!')
      setTimeout(() => setUploadStatus(''), 3000)
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file, index) => {
        setTimeout(() => handleFileUpload(file), index * 500) // Stagger uploads
      })
    }
  }

  const removeUploadedFile = async (fileId: string) => {
    try {
      // Delete from backend
      await intakeService.deleteDocument(parseInt(fileId))
      
      // Remove from local state
      const currentFiles = (data as any).uploaded_files || []
      onChange({ uploaded_files: currentFiles.filter((f: any) => f.id !== fileId) })
      
      setUploadStatus('Document deleted successfully!')
      setTimeout(() => setUploadStatus(''), 3000)
    } catch (error) {
      setUploadStatus('Failed to delete document. Please try again.')
      setTimeout(() => setUploadStatus(''), 3000)
    }
  }

  const isStageComplete = () => {
    return !!data.urgency
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediately': return 'text-red-600 bg-red-50 border-red-200'
      case 'one_to_three_months': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'three_to_six_months': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'flexible': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSelectedDocuments = () => {
    return data.docs_ready || []
  }

  const getUploadedFiles = () => {
    return (data as any).uploaded_files || []
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-violet-600" />
            <h2 className="text-xl font-bold text-gray-900">Timeline & Document Readiness</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Understanding your timeline and document readiness helps us prioritize your case and provide realistic expectations.
          </p>
          
          <div className="bg-violet-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-violet-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-violet-800">
                <p className="font-medium mb-1">Final Step!</p>
                <p>You're almost done! This final information helps us create the perfect action plan and ensures we have everything needed for your consultation.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-8">
            {/* Q12.1 Urgency */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Clock className="inline h-5 w-5 text-violet-600 mr-2" />
                Q12.1: How soon are you hoping to move forward? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {options.urgency.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      data.urgency === option.value
                        ? 'border-violet-600 bg-violet-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={data.urgency === option.value}
                      onChange={(e) => handleFieldChange('urgency', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        data.urgency === option.value
                          ? 'border-violet-600 bg-violet-600'
                          : 'border-gray-300'
                      }`}>
                        {data.urgency === option.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Urgency-specific information */}
              {data.urgency && (
                <div className={`mt-4 rounded-lg p-4 border ${getUrgencyColor(data.urgency)}`}>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">
                        {data.urgency === 'immediately' && 'Immediate Timeline'}
                        {data.urgency === 'one_to_three_months' && 'Near-term Timeline'}
                        {data.urgency === 'three_to_six_months' && 'Standard Timeline'}
                        {data.urgency === 'flexible' && 'Flexible Timeline'}
                      </p>
                      <p>
                        {data.urgency === 'immediately' && 'We\'ll prioritize your case for urgent processing and expedited consultation scheduling.'}
                        {data.urgency === 'one_to_three_months' && 'Good planning window. We\'ll create a focused action plan with clear milestones.'}
                        {data.urgency === 'three_to_six_months' && 'Ideal timeline for thorough preparation and optimal application strategy.'}
                        {data.urgency === 'flexible' && 'We\'ll develop a comprehensive long-term strategy with multiple pathway options.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Q12.2 Target Arrival */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <Calendar className="inline h-5 w-5 text-blue-600 mr-2" />
                Q12.2: Target arrival or application date (if known)
              </label>
              <div className="max-w-md">
                <Input
                  type="date"
                  value={data.target_arrival ? data.target_arrival.split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('target_arrival', e.target.value)}
                  className="font-medium"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Optional: This helps us work backwards from your target date to create realistic timelines.
              </p>
            </div>

            {/* Q12.3 Documents Ready */}
            <div>
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                <FileText className="inline h-5 w-5 text-green-600 mr-2" />
                Q12.3: Which of the following do you already have?
                <br />
                <span className="text-sm font-normal text-gray-600">Select all that apply</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {options.document_types.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      getSelectedDocuments().includes(option.value)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={getSelectedDocuments().includes(option.value)}
                      onChange={() => handleArrayToggle('docs_ready', option.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3 w-full">
                      <div className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center ${
                        getSelectedDocuments().includes(option.value)
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {getSelectedDocuments().includes(option.value) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Document readiness summary */}
              {getSelectedDocuments().length > 0 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Great Document Preparedness!</p>
                      <p>You have {getSelectedDocuments().length} key documents ready. This will help expedite your case preparation and application process.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Q12.4: Upload Documents for Review</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Upload any documents you'd like the consultant to review (optional)
          </p>

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
            <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX, JPG, PNG • Max 10MB per file • Max 5 files</p>
            <input
              type="file"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              multiple
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </label>
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <div className={`mt-4 p-3 rounded-lg ${
              uploadStatus.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' :
              uploadStatus.includes('Uploading') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {uploadStatus.includes('success') && <Check className="h-4 w-4" />}
                {uploadStatus.includes('Uploading') && <Clock className="h-4 w-4" />}
                {uploadStatus.includes('failed') && <AlertCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{uploadStatus}</span>
              </div>
            </div>
          )}

          {/* Uploaded Files List */}
          {getUploadedFiles().length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Uploaded Files ({getUploadedFiles().length}/5)</h4>
              <div className="space-y-2">
                {getUploadedFiles().map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded {new Date(file.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeUploadedFile(file.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500">
            <p>• Documents are securely stored and only accessible by your assigned consultant</p>
            <p>• This is optional - you can also bring documents to your consultation</p>
            <p>• For sensitive documents, consider bringing them in person</p>
          </div>
        </CardContent>
      </Card>

      {/* Completion Celebration */}
      {isStageComplete() && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-2">Congratulations!</h3>
              <p className="text-green-800 mb-4">
                You've completed all 12 stages of the intake process. Your information will help your RCIC provide the best possible guidance for your immigration journey.
              </p>
              <div className="text-sm text-green-700">
                <p className="font-medium mb-1">Next Steps:</p>
                <p>Your RCIC will review your intake and prepare a personalized consultation strategy. You'll be contacted within 24-48 hours to schedule your consultation.</p>
              </div>
            </div>
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
                Stage 12 Requirements
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {[
                data.urgency && 'Timeline',
                'Optional Documents',
                'Optional Upload'
              ].filter(Boolean).length} of 1 required completed
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
