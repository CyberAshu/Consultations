import React, { useState, useRef } from 'react'
import { Button } from '../common/Button'
import { 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  Loader 
} from 'lucide-react'
import { apiPostFormData } from '../../api/client'

interface UploadedDocument {
  id: string
  file: File
  name: string
  size: number
  type: string
  uploadedAt: string
  uploading?: boolean
  error?: string
}

interface DocumentUploadProps {
  bookingId: number
  onUploadSuccess?: (document: any) => void
  onUploadError?: (error: string) => void
  maxFileSize?: number // in bytes, default 10MB
  allowedTypes?: string[]
  multiple?: boolean
  disabled?: boolean
  className?: string
  title?: string
  description?: string
}

export function DocumentUpload({
  bookingId,
  onUploadSuccess,
  onUploadError,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  multiple = true,
  disabled = false,
  className = '',
  title = 'Upload Additional Documents',
  description = 'Upload any additional documents related to your consultation session.'
}: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      return `File type not allowed. Supported types: ${allowedTypes.join(', ')}`
    }

    return null
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return

    const fileArray = Array.from(files)
    const newFiles: UploadedDocument[] = []

    fileArray.forEach(file => {
      const validationError = validateFile(file)
      
      const uploadedFile: UploadedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploading: false,
        error: validationError || undefined
      }

      newFiles.push(uploadedFile)
    })

    if (multiple) {
      setUploadedFiles(prev => [...prev, ...newFiles])
    } else {
      setUploadedFiles(newFiles)
    }
  }

  const uploadFile = async (fileDoc: UploadedDocument) => {
    if (fileDoc.error) return

    try {
      // Set uploading state
      setUploadedFiles(prev =>
        prev.map(f => f.id === fileDoc.id ? { ...f, uploading: true, error: undefined } : f)
      )

      // Upload to backend using API service
      const formData = new FormData()
      formData.append('file', fileDoc.file)

      const uploadedDocument = await apiPostFormData(`/bookings/${bookingId}/documents`, formData)

      // Update file state with success
      setUploadedFiles(prev =>
        prev.map(f => f.id === fileDoc.id ? { ...f, uploading: false } : f)
      )

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(uploadedDocument)
      }

    } catch (error: any) {
      console.error('Document upload failed:', error)
      
      // Update file state with error
      setUploadedFiles(prev =>
        prev.map(f => f.id === fileDoc.id ? { ...f, uploading: false, error: error.message } : f)
      )

      // Call error callback
      if (onUploadError) {
        onUploadError(error.message)
      }
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true)
    }
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer'
          }
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <Upload className={`h-8 w-8 mx-auto mb-3 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
        <p className={`mb-2 ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {dragActive ? 'Drop files here' : 'Drag and drop files here, or click to select'}
        </p>
        <p className={`text-sm mb-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
          Supported formats: {allowedTypes.join(', ')} (Max {formatFileSize(maxFileSize)} per file)
        </p>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation()
            openFileDialog()
          }}
        >
          Choose Files
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Files to Upload</h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {file.uploading ? (
                    <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                  ) : file.error ? (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.size)}
                    {file.uploading && ' • Uploading...'}
                    {file.error && ` • ${file.error}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!file.uploading && !file.error && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => uploadFile(file)}
                    disabled={disabled}
                  >
                    Upload
                  </Button>
                )}
                {file.error && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => uploadFile(file)}
                    disabled={disabled}
                  >
                    Retry
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={file.uploading || disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Upload All Button */}
          {uploadedFiles.some(f => !f.uploading && !f.error) && (
            <div className="flex justify-center pt-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  uploadedFiles
                    .filter(f => !f.uploading && !f.error)
                    .forEach(file => uploadFile(file))
                }}
                disabled={disabled || uploadedFiles.every(f => f.uploading || f.error)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload All Files
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Upload Guidelines:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Upload documents that are relevant to your consultation session</li>
              <li>• Ensure all documents are clear and readable</li>
              <li>• Include any new information or updates since your booking</li>
              <li>• Your RCIC will review these before or during your session</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
