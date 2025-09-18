import React from 'react'
import { User, FileText, Calendar } from 'lucide-react'

interface ClientInformationSectionProps {
  clientName: string
  booking: any
  parsedIntakeData?: any
}

export function ClientInformationSection({ 
  clientName, 
  booking, 
  parsedIntakeData 
}: ClientInformationSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">Client Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Client Name</p>
            <p className="text-gray-900 font-semibold">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Email</p>
            <p className="text-gray-900 text-sm">{parsedIntakeData?.personal_info?.email || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Phone</p>
            <p className="text-gray-900 text-sm">{parsedIntakeData?.personal_info?.phone || 'Not provided'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Booking ID</p>
            <p className="text-gray-900 font-mono text-sm">#{booking.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}