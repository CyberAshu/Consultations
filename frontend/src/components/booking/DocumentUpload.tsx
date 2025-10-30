import React, { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../shared/Button'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Image,
  Download,
  Eye
} from 'lucide-react'

interface UploadedDocument {
  id: string
  file_name: string
  file_type: string
  file_size: number
  uploaded_at: string
  download_url?: string
}

interface DocumentUploadProps {
  bookingId?: number
  onUploadComplete?: (document: UploadedDocument) => void
  onUploadError?: (error: string) => void
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
  existingDocuments?: UploadedDocument[]
  disabled?: boolean
}

const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
]

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function DocumentUpload({
  bookingId,
  onUploadComplete,
  onUploadError,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  existingDocuments = [],
  disabled = false
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>(existingDocuments)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) {
      return <Image className="h-5 w-5 text-blue-600" />
    }
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed. Please upload PDF, DOCX, or image files.`
    }
    
    if (file.size > maxFileSize) {
      return `File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxFileSize)}).`
    }
    
    return null
  }

  const uploadFile = async (file: File) => {
    if (!bookingId) {
      throw new Error('Booking ID is required for document upload')
    }

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`/api/v1/bookings/${bookingId}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Upload failed')
    }

    return response.json()
  }

  const handleFiles = useCallback(async (files: FileList) => {
    if (disabled || uploading) return

    const file = files[0] // Single file upload for now
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      onUploadError?.(validationError)
      return
    }

    setUploading(true)
    try {
      const uploadedDoc = await uploadFile(file)
      setUploadedFiles(prev => [...prev, uploadedDoc])
      onUploadComplete?.(uploadedDoc)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      onUploadError?.(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [bookingId, disabled, uploading, onUploadComplete, onUploadError, maxFileSize, allowedTypes])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled || uploading) return
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles, disabled, uploading])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleViewDocument = (doc: UploadedDocument) => {
    if (doc.download_url) {
      window.open(doc.download_url, '_blank')
    }
  }

  const handleDownloadDocument = (doc: UploadedDocument) => {
    if (doc.download_url) {
      const link = document.createElement('a')
      link.href = doc.download_url
      link.download = doc.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-gray-200/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
            <p className="text-sm text-gray-600">
              Upload any required documents for your consultation (ID proof, forms, etc.)
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : disabled 
                ? 'border-gray-200 bg-gray-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Uploading your document...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className={`h-12 w-12 mx-auto ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                  {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                </p>
                <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                  or{' '}
                  <button
                    onClick={openFileDialog}
                    disabled={disabled}
                    className={`${disabled ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'} font-medium underline`}
                  >
                    browse files
                  </button>
                </p>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Supported formats: PDF, DOCX, JPG, PNG</p>
                <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
              </div>
            </div>
          )}
        </div>

        {/* File Type Examples */}
        <div className="mt-4 p-4 bg-blue-50/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Commonly Required Documents:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Government-issued ID (passport, driver's license)</p>
            <p>• Immigration documents (visa, permits, previous applications)</p>
            <p>• Educational certificates and transcripts</p>
            <p>• Employment letters and contracts</p>
            <p>• Financial documents and bank statements</p>
            <p>• Marriage certificates or family documents</p>
          </div>
        </div>

        {/* Uploaded Documents List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Uploaded Documents ({uploadedFiles.length})
            </h4>
            <div className="space-y-3">
              {uploadedFiles.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-4 bg-green-50/50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.file_type)}
                    <div>
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.download_url && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(doc)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Another Document Button */}
        {uploadedFiles.length > 0 && !disabled && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={openFileDialog}
              disabled={uploading}
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Another Document
            </Button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Security & Privacy</p>
              <p>All uploaded documents are encrypted and stored securely. Only your assigned RCIC will have access to these files. Documents will be automatically deleted after your case is completed as per our privacy policy.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
