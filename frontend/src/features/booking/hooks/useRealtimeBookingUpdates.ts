import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { Booking } from '../../../types/service.types'
import { authService } from '../../../api/services/auth.service'
import { supabase, setSupabaseAuth } from '../../../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface BookingUpdate {
  id: number
  status: string
  updated_at?: string
}

interface RealtimeEventData {
  type: 'booking_status_update' | 'heartbeat' | 'error'
  data?: BookingUpdate[]
  message?: string
  timestamp: number
}

interface UseRealtimeBookingUpdatesOptions {
  onBookingUpdate?: (bookingId: number, status: string) => void
  onError?: (error: string) => void
  enabled?: boolean
  fallbackToPolling?: boolean
  pollingInterval?: number
}

export function useRealtimeBookingUpdates(
  bookings: Booking[] = [],
  options: UseRealtimeBookingUpdatesOptions = {}
) {
  const {
    onBookingUpdate,
    onError,
    enabled = true,
    fallbackToPolling = true,
    pollingInterval = 30000 // 30 seconds
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionType, setConnectionType] = useState<'realtime' | 'polling' | null>(null)
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTimestamp = useRef<number>(Date.now())
  
  // Error handling state to prevent spam
  const lastErrorTime = useRef<number>(0)
  const consecutiveErrors = useRef<number>(0)
  const ERROR_THROTTLE_MS = 60000 // Only show errors every 60 seconds
  const MAX_ERROR_COUNT = 3 // Stop trying after 3 consecutive errors

  // Handle errors with throttling to prevent spam
  const handleError = useCallback((error: string, context?: string) => {
    const now = Date.now()
    const timeSinceLastError = now - lastErrorTime.current
    
    console.error(`❌ Real-time error ${context ? `(${context})` : ''}:`, error)
    consecutiveErrors.current++
    
    // If we've had too many errors, stop trying
    if (consecutiveErrors.current >= MAX_ERROR_COUNT) {
      console.log(`🛑 Too many errors (${consecutiveErrors.current}), disabling real-time updates`)
      cleanup()
      return
    }
    
    // Only show error toasts if enough time has passed
    if (timeSinceLastError >= ERROR_THROTTLE_MS) {
      // Only show network/connection errors, not individual API failures
      if (error.includes('Failed to establish') || error.includes('connection lost')) {
        onError?.(error)
        lastErrorTime.current = now
      }
    }
  }, [onError])
  
  // Reset error count on successful connection
  const resetErrorCount = useCallback(() => {
    consecutiveErrors.current = 0
  }, [])

  // Clean up connections
  const cleanup = useCallback(() => {
    if (realtimeChannelRef.current) {
      realtimeChannelRef.current.unsubscribe()
      realtimeChannelRef.current = null
    }
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setIsConnected(false)
    setConnectionType(null)
  }, [])

  // Polling fallback function
  const startPolling = useCallback(async () => {
    if (!enabled || !bookings.length) {
      return
    }

    setConnectionType('polling')
    setIsConnected(true)

    const pollForUpdates = async () => {
      try {
        const token = authService.getToken()
        if (!token) return

        for (const booking of bookings) {
          const { API_BASE_URL } = await import('../../../api/client')
          const url = `${API_BASE_URL}/events/booking-status/${booking.id}`
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            try {
              const data = await response.json()
              
              // Check if status changed since last known status
              if (data.status !== booking.status) {
                onBookingUpdate?.(booking.id, data.status)
              }
            } catch (parseError) {
              console.error(`❌ Failed to parse response for booking ${booking.id}:`, parseError)
              console.error('❌ Response was not valid JSON. Response status:', response.status)
            }
          } else {
            console.error(`❌ Polling failed for booking ${booking.id}: ${response.status} ${response.statusText}`)
          }
        }
      } catch (error) {
        // Don't spam toasts for polling errors - just log them
        console.error('❌ Polling error:', error)
        // Only show critical errors, not every polling failure
      }
    }

    // Initial poll
    await pollForUpdates()

    // Set up interval
    pollingIntervalRef.current = setInterval(pollForUpdates, pollingInterval)
  }, [bookings, enabled, pollingInterval, onBookingUpdate])

  // Supabase Realtime function
  const startRealtime = useCallback(async () => {
    if (!enabled) return

    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      // Set Supabase auth with our backend JWT token
      setSupabaseAuth(token)

      // Get user info to determine filter
      const user = authService.getStoredUser()
      if (!user) {
        throw new Error('User information not available')
      }

      // Determine filter based on user role
      let filter: string
      if (user.role === 'client') {
        filter = `client_id=eq.${user.id}`
      } else if (user.role === 'rcic') {
        let consultantId = bookings[0]?.consultant_id || 
                          (user as any).consultant_id || 
                          localStorage.getItem('consultant_id')
        
        if (!consultantId) {
          try {
            const { API_BASE_URL } = await import('../../../api/client')
            const response = await fetch(`${API_BASE_URL}/consultants/`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const consultants = await response.json()
              const myConsultant = consultants.find((c: any) => c.user_id === user.id)
              if (myConsultant) {
                consultantId = myConsultant.id
                localStorage.setItem('consultant_id', String(consultantId))
              }
            }
          } catch (apiError) {
            console.error('Failed to fetch consultant_id:', apiError)
          }
        }
        
        if (!consultantId) {
          throw new Error('Consultant ID not available')
        }
        
        filter = `consultant_id=eq.${consultantId}`
      } else {
        throw new Error('Unsupported user role')
      }

      const channel = supabase
        .channel(`booking-updates-${user.role}-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: filter,
          },
          (payload) => {
            lastUpdateTimestamp.current = Date.now()
            resetErrorCount()

            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const booking = payload.new as any
              onBookingUpdate?.(booking.id, booking.status)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setConnectionType('realtime')
            resetErrorCount()
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime connection error')
            setIsConnected(false)
            handleError('Realtime connection error', 'channel_error')

            // Fallback to polling
            if (fallbackToPolling) {
              cleanup()
              setTimeout(startPolling, 1000)
            }
          } else if (status === 'TIMED_OUT') {
            console.error('Realtime connection timed out')
            setIsConnected(false)
            handleError('Connection timed out', 'timeout')

            // Fallback to polling
            if (fallbackToPolling) {
              cleanup()
              setTimeout(startPolling, 1000)
            }
          }
        })

      realtimeChannelRef.current = channel

    } catch (error) {
      console.error('Failed to start Realtime:', error)
      handleError(String(error), 'startup')

      // Fallback to polling if Realtime setup fails
      if (fallbackToPolling) {
        startPolling()
      } else {
        onError?.('Failed to establish real-time connection')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Start real-time updates (only on mount and when enabled changes)
  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    // Try Supabase Realtime first, with polling fallback
    startRealtime()

    // Cleanup on unmount
    return cleanup
  // Only restart when enabled changes, not on every callback change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Memoize booking IDs to prevent unnecessary restarts
  const bookingIds = useMemo(() => bookings.map(b => b.id).join(','), [bookings])

  // Handle bookings change - restart connection with new booking list
  useEffect(() => {
    if (!enabled || connectionType !== 'polling') return

    // If we're polling and bookings changed, restart polling
    cleanup()
    startPolling()
  }, [bookingIds, enabled, connectionType, cleanup, startPolling])

  return {
    isConnected,
    connectionType,
    reconnect: () => {
      cleanup()
      startRealtime()
    }
  }
}

// Simple hook for single booking updates
export function useBookingStatusPolling(
  bookingId: number | null,
  onStatusUpdate: (status: string) => void,
  interval = 30000
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!bookingId) return

    const pollStatus = async () => {
      try {
        const token = authService.getToken()
        if (!token) return

        const { API_BASE_URL } = await import('../../../api/client');
        const response = await fetch(`${API_BASE_URL}/events/booking-status/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          try {
            const data = await response.json()
            onStatusUpdate(data.status)
          } catch (parseError) {
            console.error(`❌ Failed to parse status response for booking ${bookingId}:`, parseError)
          }
        } else {
          console.error(`❌ Status polling failed for booking ${bookingId}: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Initial poll
    pollStatus()

    // Set up interval
    intervalRef.current = setInterval(pollStatus, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [bookingId, onStatusUpdate, interval])
}
