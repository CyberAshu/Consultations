import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../shared/Button'
import { Badge } from '../ui/Badge'
import { 
  FileText, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle,
  Upload,
  Image,
  Calendar,
  Clock,
  User
} from 'lucide-react'

interface BookingDocument {
  id: string
  booking_id: number
  file_name: string
  file_type: string
  file_size: number
  uploaded_at: string
  download_url?: string
  error?: string
}

interface BookingInfo {
  id: number
  booking_date: string
  client_name?: string
  service_name?: string
  status: string
}

interface BookingDocumentManagerProps {
  booking: BookingInfo
  userRole?: 'rcic' | 'admin' | 'client'
  onDocumentUpdate?: () => void
}

export function BookingDocumentManager({ 
  booking, 
  userRole = 'rcic',
  onDocumentUpdate 
}: BookingDocumentManagerProps) {
  const [documents, setDocuments] = useState<BookingDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [documentStats, setDocumentStats] = useState<any>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    loadDocuments()
    loadDocumentStats()
  }, [booking.id])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/bookings/${booking.id}/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to load documents')
      }
      
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const loadDocumentStats = async () => {
    try {
      const response = await fetch(`/api/v1/bookings/${booking.id}/documents/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const stats = await response.json()
        setDocumentStats(stats)
      }
    } catch (err) {
      console.error('Failed to load document statistics:', err)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) {
      return <Image className="h-5 w-5 text-blue-600" />
    }
    return <FileText className="h-5 w-5 text-gray-600" />
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewDocument = (doc: BookingDocument) => {
    if (doc.download_url) {
      window.open(doc.download_url, '_blank')
    }
  }

  const handleDownloadDocument = async (doc: BookingDocument) => {
    try {
      const response = await fetch(`/api/v1/bookings/${booking.id}/documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }
      
      const data = await response.json()
      if (data.download_url) {
        const link = document.createElement('a')
        link.href = data.download_url
        link.download = doc.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Failed to download document:', err)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm shadow-sm border-gray-200/50">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm shadow-sm border-gray-200/50">
      <CardContent className="p-4">
        {/* Booking Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {booking.id}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900">{booking.client_name || 'Unknown Client'}</span>
                <Badge className={getStatusBadgeColor(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(booking.booking_date)}
                </div>
                {booking.service_name && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {booking.service_name}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Document Summary */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              {documents.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-600" />
              )}
              <span className="text-sm font-medium">
                {documents.length} Document{documents.length !== 1 ? 's' : ''}
              </span>
            </div>
            {documentStats && (
              <div className="text-xs text-gray-500">
                {formatFileSize(documentStats.total_size_bytes)}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Document List */}
        {documents.length > 0 ? (
          <div className="space-y-3">
            {!expanded && documents.length > 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(true)}
                className="w-full text-sm"
              >
                Show all {documents.length} documents
              </Button>
            )}
            
            {(expanded ? documents : documents.slice(0, 2)).map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(doc.file_type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.error ? (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      Error
                    </Badge>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                        className="flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        className="flex items-center gap-1 text-xs px-2 py-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {expanded && documents.length > 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(false)}
                className="w-full text-sm"
              >
                Show less
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">No documents uploaded</p>
            <p className="text-xs">Client hasn't uploaded any documents yet</p>
          </div>
        )}

        {/* File Type Breakdown */}
        {documentStats && documentStats.file_types && Object.keys(documentStats.file_types).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Document Types</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(documentStats.file_types).map(([fileType, stats]: [string, any]) => (
                <Badge 
                  key={fileType} 
                  className="bg-blue-50 text-blue-700 text-xs"
                >
                  {fileType.split('/')[1] || fileType}: {stats.count}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions for different user roles */}
        {userRole === 'rcic' && documents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>All documents are securely stored and only accessible by you and the client.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
