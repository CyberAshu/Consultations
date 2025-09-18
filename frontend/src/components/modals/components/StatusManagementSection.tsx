import React from 'react'
import { Button } from '../../shared/Button'

interface StatusManagementSectionProps {
  booking: any
  onStatusChange: (bookingId: number, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'delayed' | 'rescheduled') => void
  updatingStatus: number | null
}

export function StatusManagementSection({ 
  booking, 
  onStatusChange, 
  updatingStatus 
}: StatusManagementSectionProps) {
  return (
    <div className="bg-white border rounded-xl p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Management</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {booking.status === 'pending' ? (
          <>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={() => onStatusChange(booking.id, 'confirmed')} 
              disabled={updatingStatus === booking.id}
            >
              {updatingStatus === booking.id ? 'Updating...' : 'Confirm'}
            </Button>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700" 
              onClick={() => onStatusChange(booking.id, 'cancelled')} 
              disabled={updatingStatus === booking.id}
            >
              {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
            </Button>
          </>
        ) : booking.status === 'confirmed' ? (
          <>
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50" 
              onClick={() => onStatusChange(booking.id, 'completed')} 
              disabled={updatingStatus === booking.id}
            >
              {updatingStatus === booking.id ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Completing...
                </span>
              ) : (
                'Mark Complete'
              )}
            </Button>
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700" 
              onClick={() => onStatusChange(booking.id, 'delayed')} 
              disabled={updatingStatus === booking.id}
            >
              {updatingStatus === booking.id ? 'Updating...' : 'Mark Delayed'}
            </Button>
            <Button 
              size="sm" 
              className="bg-red-600 hover:bg-red-700" 
              onClick={() => onStatusChange(booking.id, 'cancelled')} 
              disabled={updatingStatus === booking.id}
            >
              {updatingStatus === booking.id ? 'Updating...' : 'Cancel'}
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={() => onStatusChange(booking.id, 'confirmed')} 
            disabled={updatingStatus === booking.id}
          >
            {updatingStatus === booking.id ? 'Updating...' : 'Reopen'}
          </Button>
        )}
      </div>
    </div>
  )
}