import React from 'react'
import { FileText } from 'lucide-react'
import { Button } from '../../../../../components/common/Button'
import { formatFileSize } from './documentUtils'

interface DocumentsSectionProps {
  documents: any[]
  documentsLoading: boolean
  onViewDocument: (file: any) => void
  onDownloadDocument: (file: any) => void
  booking: any
}

export function DocumentsSection({ 
  documents, 
  documentsLoading, 
  onViewDocument, 
  onDownloadDocument, 
  booking 
}: DocumentsSectionProps) {
  if (!documents.length && !documentsLoading) {
    return null
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold text-green-900 mb-3">
        Uploaded Documents {documents.length > 0 && `(${documents.length})`}
      </h3>
      
      {documentsLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="ml-2 text-green-700">Loading documents...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-green-800">{doc.file_name || doc.name}</p>
                    {doc.source === 'intake_form' && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Intake Form</span>
                    )}
                  </div>
                  <p className="text-xs text-green-600">
                    {formatFileSize(doc.file_size || 0)} • Uploaded {new Date(doc.uploaded_at || doc.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 px-2 text-xs" 
                  onClick={() => onViewDocument({
                    id: doc.id,
                    name: doc.file_name,
                    size: doc.file_size,
                    type: doc.file_type,
                    url: doc.download_url || (doc as any).file_url,
                    uploadedAt: doc.uploaded_at || doc.created_at
                  })}
                >
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-6 px-2 text-xs" 
                  onClick={() => onDownloadDocument({
                    id: doc.id,
                    booking_id: booking.id,
                    name: doc.file_name,
                    size: doc.file_size,
                    type: doc.file_type,
                    url: doc.download_url || (doc as any).file_url
                  })}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
