import { useEffect, useRef, useCallback, useState } from 'react'
import { Booking } from '../services/types'
import { authService } from '../services/authService'

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
  const [connectionType, setConnectionType] = useState<'sse' | 'polling' | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
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
    if (eventSourceRef.current) {
      console.log('🔌 Closing SSE connection')
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    
    if (pollingIntervalRef.current) {
      console.log('⏹️ Stopping polling')
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setIsConnected(false)
    setConnectionType(null)
  }, [])

  // Polling fallback function
  const startPolling = useCallback(async () => {
    if (!enabled || !bookings.length) {
      console.log(`❌ Polling not started: enabled=${enabled}, bookings.length=${bookings.length}`)
      return
    }

    console.log(`🔄 Starting polling for ${bookings.length} booking updates...`)
    setConnectionType('polling')
    setIsConnected(true)

    const pollForUpdates = async () => {
      try {
        const token = authService.getToken()
        if (!token) return

        // Poll each booking individually
        for (const booking of bookings) {
          // Use the same URL pattern as the API service
      // Reuse normalized API base URL from api.ts to avoid mixed content
      const { API_BASE_URL } = await import('../services/api');
      const url = `${API_BASE_URL}/events/booking-status/${booking.id}`;
          console.log(`🔍 Polling booking ${booking.id} at: ${url}`);
          
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
                console.log(`📝 Status update detected: Booking ${booking.id} changed from ${booking.status} to ${data.status}`)
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

  // Server-Sent Events function
  const startSSE = useCallback(async () => {
    if (!enabled) return

    console.log('🔄 Starting SSE connection for booking updates...')
    console.log('📊 Bookings to monitor:', bookings.length)

    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      console.log('🔑 Token available, attempting SSE connection...')
      // Note: EventSource doesn't support custom headers directly
      // We need to pass the token as a query parameter or use a different approach
      // Reuse normalized API base URL from api.ts to avoid mixed content
      const { API_BASE_URL } = await import('../services/api');
      const sseUrl = `${API_BASE_URL}/events/booking-updates?token=${encodeURIComponent(token)}`
      console.log('🌐 SSE URL:', sseUrl)
      const eventSource = new EventSource(sseUrl)
      
      eventSource.onopen = () => {
        console.log('✅ SSE connection established')
        setIsConnected(true)
        setConnectionType('sse')
        lastUpdateTimestamp.current = Date.now()
      }

      eventSource.onmessage = (event) => {
        try {
          const data: RealtimeEventData = JSON.parse(event.data)
          console.log('📨 SSE message received:', data)

          switch (data.type) {
            case 'booking_status_update':
              if (data.data) {
                data.data.forEach(update => {
                  console.log(`📝 Booking ${update.id} status updated to: ${update.status}`)
                  onBookingUpdate?.(update.id, update.status)
                })
              }
              break
            
            case 'heartbeat':
              console.log('💓 SSE heartbeat received')
              lastUpdateTimestamp.current = Date.now()
              break
            
            case 'error':
              console.error('❌ SSE error:', data.message)
              onError?.(data.message || 'Server-sent event error')
              break
          }
        } catch (parseError) {
          console.error('❌ Failed to parse SSE message:', parseError)
        }
      }

      eventSource.onerror = (event) => {
        console.error('❌ SSE connection error:', event)
        setIsConnected(false)
        
        // If SSE fails and fallback is enabled, switch to polling
        if (fallbackToPolling) {
          console.log('🔄 Falling back to polling...')
          cleanup()
          setTimeout(() => {
            console.log('🗓️ Timeout completed, calling startPolling...')
            startPolling()
          }, 1000) // Wait 1 second before starting polling
        } else {
          onError?.('Real-time connection lost')
        }
      }

      eventSourceRef.current = eventSource

    } catch (error) {
      console.error('❌ Failed to start SSE:', error)
      
      // Fallback to polling if SSE setup fails
      if (fallbackToPolling) {
        console.log('🔄 SSE failed, falling back to polling...')
        console.log('🗓️ Immediately calling startPolling...')
        startPolling()
      } else {
        onError?.('Failed to establish real-time connection')
      }
    }
  }, [enabled, onBookingUpdate, onError, fallbackToPolling, cleanup, startPolling])

  // Start real-time updates
  useEffect(() => {
    if (!enabled) {
      cleanup()
      return
    }

    // Try SSE first, with polling fallback
    startSSE()

    // Cleanup on unmount
    return cleanup
  }, [enabled, startSSE, cleanup])

  // Handle bookings change - restart connection with new booking list
  useEffect(() => {
    if (!enabled || connectionType !== 'polling') return

    // If we're polling and bookings changed, restart polling
    cleanup()
    startPolling()
  }, [bookings.map(b => b.id).join(','), enabled, connectionType, cleanup, startPolling])

  return {
    isConnected,
    connectionType,
    reconnect: () => {
      cleanup()
      startSSE()
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

        const { API_BASE_URL } = await import('../services/api');
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
