import React from 'react'
import { Calendar, Clock, FileText, User } from 'lucide-react'
import { Badge } from '../../ui/Badge'

interface SessionInformationSectionProps {
  booking: any
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
    case 'upcoming':
      return 'bg-blue-100 text-blue-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'delayed':
      return 'bg-orange-100 text-orange-800'
    case 'rescheduled':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function SessionInformationSection({ booking }: SessionInformationSectionProps) {
  const bookingDate = new Date(booking.booking_date || booking.scheduled_date || '')
  
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold text-emerald-900 mb-4">Session Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Date & Time</p>
            <p className="text-gray-900">
              {bookingDate.toLocaleDateString()} at {bookingDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Duration</p>
            <p className="text-gray-900">{booking.duration_minutes || 'N/A'} minutes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Service Type</p>
            <p className="text-gray-900">{booking.service_name || booking.service_type || `Service #${booking.service_id}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-gray-700">Status</p>
            <Badge className={getStatusBadge(booking.status)}>
              {booking.status}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Payment Information */}
      {(booking.total_amount || booking.payment_status) && (
        <div className="mt-4 pt-4 border-t border-emerald-200">
          <h4 className="text-md font-medium text-emerald-900 mb-3">Payment Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {booking.total_amount && (
              <div>
                <p className="text-sm font-medium text-gray-700">Amount</p>
                <p className="text-gray-900 font-semibold">${booking.total_amount} CAD</p>
              </div>
            )}
            {booking.payment_status && (
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Status</p>
                <Badge className={booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {booking.payment_status}
                </Badge>
              </div>
            )}
            {booking.payment_method && (
              <div>
                <p className="text-sm font-medium text-gray-700">Payment Method</p>
                <p className="text-gray-900">{booking.payment_method}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}