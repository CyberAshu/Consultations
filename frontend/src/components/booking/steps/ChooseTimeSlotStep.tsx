import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../shared/Button'
import { 
  Calendar,
  Clock, 
  CheckCircle, 
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { bookingService } from '../../../services/bookingService'

interface ChooseTimeSlotStepProps {
  onDataChange: (data: any) => void
  rcic: any
  service: any
  currentData: any
}

export function ChooseTimeSlotStep({ 
  onDataChange, 
  rcic, 
  service, 
  currentData 
}: ChooseTimeSlotStepProps) {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null)
  const [selectedTimezone, setSelectedTimezone] = useState('America/Toronto')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [useCalendly, setUseCalendly] = useState(false)

  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Fetch available time slots from RCIC availability API
  const fetchAvailableSlots = async (date: Date, consultantId: number) => {
    if (!consultantId) return
    
    setLoadingSlots(true)
    try {
      const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format
      const availability = await bookingService.getConsultantAvailability(consultantId, dateString)
      
      const slots = availability.slots
        .filter((slot: any) => slot.available)
        .map((slot: any, index: number) => ({
          id: index,
          time: slot.time,
          datetime: new Date(`${dateString}T${slot.time}:00`),
          available: true
        }))
      
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Failed to fetch availability:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const timezones = [
    { value: 'America/Toronto', label: 'Eastern Time (ET)', offset: 'UTC-5' },
    { value: 'America/Vancouver', label: 'Pacific Time (PT)', offset: 'UTC-8' },
    { value: 'America/Edmonton', label: 'Mountain Time (MT)', offset: 'UTC-7' },
    { value: 'America/Winnipeg', label: 'Central Time (CT)', offset: 'UTC-6' },
    { value: 'America/Halifax', label: 'Atlantic Time (AT)', offset: 'UTC-4' },
    { value: 'America/St_Johns', label: 'Newfoundland Time (NT)', offset: 'UTC-3:30' }
  ]

  // Fetch slots when RCIC or date changes
  useEffect(() => {
    if (rcic?.id) {
      fetchAvailableSlots(currentDate, rcic.id)
    }
  }, [rcic?.id, currentDate])

  useEffect(() => {
    onDataChange({
      timeSlot: selectedTimeSlot,
      timezone: selectedTimezone
    })
  }, [selectedTimeSlot, selectedTimezone, onDataChange])

  const handleTimeSlotSelect = (slot: any) => {
    const timeSlotData = {
      id: slot.id,
      date: currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: slot.time,
      datetime: slot.datetime
    }
    setSelectedTimeSlot(timeSlotData)
  }

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
    setSelectedTimeSlot(null) // Reset selection when date changes
    // fetchAvailableSlots will be called automatically by useEffect
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Choose Your Time Slot
        </h2>
        <p className="text-gray-600">
          Select your preferred date and time for your consultation with {rcic?.name}.
        </p>
      </div>

      {/* Booking Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {rcic?.name?.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{service?.name} with {rcic?.name}</h3>
              <p className="text-sm text-gray-600">{service?.duration} • ${service?.price} CAD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timezone Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          <Globe className="h-4 w-4 inline mr-2" />
          Select Your Timezone
        </label>
        <select 
          value={selectedTimezone}
          onChange={(e) => setSelectedTimezone(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {timezones.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label} ({tz.offset})
            </option>
          ))}
        </select>
      </div>

      {/* Integration Method Toggle */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant={!useCalendly ? "default" : "outline"}
            onClick={() => setUseCalendly(false)}
            className="flex-1"
          >
            Use Built-in Calendar
          </Button>
          <Button
            variant={useCalendly ? "default" : "outline"}
            onClick={() => setUseCalendly(true)}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Use Calendly
          </Button>
        </div>
      </div>

      {useCalendly ? (
        /* Calendly Integration */
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Book with Calendly
              </h3>
              <p className="text-gray-600">
                You'll be redirected to {rcic?.name}'s Calendly page to select your preferred time slot.
              </p>
              
              {/* Mock Calendly Embed */}
              <div className="bg-gray-100 rounded-lg p-8 border-2 border-dashed border-gray-300">
                <div className="text-center space-y-3">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-500">Calendly Integration</p>
                  <p className="text-sm text-gray-400">
                    In production, this would embed the actual Calendly widget
                  </p>
                  <Button 
                    onClick={() => {
                      // Mock selection for demo
                      setSelectedTimeSlot({
                        id: 'calendly-1',
                        date: 'Tomorrow',
                        time: '2:00 PM',
                        datetime: new Date()
                      })
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Mock: Select 2:00 PM Tomorrow
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Easy Integration</p>
                    <p className="text-blue-700">
                      Your booking will automatically sync with both calendars after confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Built-in Calendar */
        <div className="space-y-4">
          {/* Enhanced Calendar View */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Select Date
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(currentDate.getMonth() - 1)
                      setCurrentDate(newDate)
                    }}
                    className="px-3 py-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-center min-w-[120px]">
                    <p className="font-semibold text-gray-900">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(currentDate)
                      newDate.setMonth(currentDate.getMonth() + 1)
                      setCurrentDate(newDate)
                    }}
                    className="px-3 py-2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Calendar Grid */}
              <div className="space-y-4">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const year = currentDate.getFullYear()
                    const month = currentDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const startDate = new Date(firstDay)
                    startDate.setDate(startDate.getDate() - firstDay.getDay())
                    
                    const days = []
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startDate)
                      date.setDate(startDate.getDate() + i)
                      
                      const isCurrentMonth = date.getMonth() === month
                      const isToday = date.getTime() === today.getTime()
                      const isPast = date < today
                      const isSelected = date.toDateString() === currentDate.toDateString()
                      
                      days.push(
                        <button
                          key={i}
                          onClick={() => {
                            if (!isPast && isCurrentMonth) {
                              setCurrentDate(new Date(date))
                              setSelectedTimeSlot(null)
                            }
                          }}
                          disabled={isPast || !isCurrentMonth}
                          className={`
                            aspect-square p-2 text-sm font-medium rounded-lg transition-all duration-200 relative
                            ${isCurrentMonth 
                              ? isPast 
                                ? 'text-gray-300 cursor-not-allowed' 
                                : isSelected
                                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                  : isToday
                                    ? 'bg-blue-50 text-blue-600 border-2 border-blue-200 hover:bg-blue-100'
                                    : 'text-gray-900 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                              : 'text-gray-300 cursor-not-allowed'
                            }
                          `}
                        >
                          {date.getDate()}
                          {isToday && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                          )}
                        </button>
                      )
                    }
                    return days
                  })()}
                </div>
                
                {/* Quick Date Selection */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date()
                      setCurrentDate(today)
                      setSelectedTimeSlot(null)
                    }}
                    className="text-xs"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date()
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      setCurrentDate(tomorrow)
                      setSelectedTimeSlot(null)
                    }}
                    className="text-xs"
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextWeek = new Date()
                      nextWeek.setDate(nextWeek.getDate() + 7)
                      setCurrentDate(nextWeek)
                      setSelectedTimeSlot(null)
                    }}
                    className="text-xs"
                  >
                    Next Week
                  </Button>
                </div>
              </div>
              
              {/* Selected Date Display */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentDate.getDate()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{formatDate(currentDate)}</p>
                    <p className="text-sm text-gray-600">
                      {isToday(currentDate) ? 'Today' : 
                       currentDate.getTime() === new Date(Date.now() + 24*60*60*1000).setHours(0,0,0,0) ? 'Tomorrow' :
                       'Selected Date'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
              
              {loadingSlots ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading available time slots...</p>
                  <p className="text-sm text-gray-400 mt-1">Please wait while we check availability</p>
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="space-y-6">
                  {/* Time Period Headers */}
                  {(() => {
                    const morningSlots = availableSlots.filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0])
                      return hour >= 6 && hour < 12
                    })
                    const afternoonSlots = availableSlots.filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0])
                      return hour >= 12 && hour < 17
                    })
                    const eveningSlots = availableSlots.filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0])
                      return hour >= 17 && hour < 21
                    })

                    return (
                      <>
                        {morningSlots.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 text-sm">🌅</span>
                              </div>
                              <h4 className="font-semibold text-gray-900">Morning (6:00 AM - 12:00 PM)</h4>
                              <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {morningSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => handleTimeSlotSelect(slot)}
                                  className={`
                                    p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105
                                    ${selectedTimeSlot?.id === slot.id
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                      : 'bg-white border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                                    }
                                  `}
                                >
                                  <Clock className={`h-4 w-4 mx-auto mb-2 ${selectedTimeSlot?.id === slot.id ? 'text-white' : 'text-blue-600'}`} />
                                  <div className="font-semibold text-sm">{slot.time}</div>
                                  <div className={`text-xs mt-1 ${selectedTimeSlot?.id === slot.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {(() => {
                                      const [hours, minutes] = slot.time.split(':')
                                      const hour = parseInt(hours)
                                      const ampm = hour >= 12 ? 'PM' : 'AM'
                                      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                                      return `${displayHour}:${minutes} ${ampm}`
                                    })()}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {afternoonSlots.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 text-sm">☀️</span>
                              </div>
                              <h4 className="font-semibold text-gray-900">Afternoon (12:00 PM - 5:00 PM)</h4>
                              <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {afternoonSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => handleTimeSlotSelect(slot)}
                                  className={`
                                    p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105
                                    ${selectedTimeSlot?.id === slot.id
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                      : 'bg-white border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                                    }
                                  `}
                                >
                                  <Clock className={`h-4 w-4 mx-auto mb-2 ${selectedTimeSlot?.id === slot.id ? 'text-white' : 'text-blue-600'}`} />
                                  <div className="font-semibold text-sm">{slot.time}</div>
                                  <div className={`text-xs mt-1 ${selectedTimeSlot?.id === slot.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {(() => {
                                      const [hours, minutes] = slot.time.split(':')
                                      const hour = parseInt(hours)
                                      const ampm = hour >= 12 ? 'PM' : 'AM'
                                      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                                      return `${displayHour}:${minutes} ${ampm}`
                                    })()}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {eveningSlots.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 text-sm">🌙</span>
                              </div>
                              <h4 className="font-semibold text-gray-900">Evening (5:00 PM - 9:00 PM)</h4>
                              <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {eveningSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  onClick={() => handleTimeSlotSelect(slot)}
                                  className={`
                                    p-4 rounded-xl border-2 transition-all duration-200 text-center hover:scale-105
                                    ${selectedTimeSlot?.id === slot.id
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-500 ring-offset-2'
                                      : 'bg-white border-gray-200 text-gray-900 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                                    }
                                  `}
                                >
                                  <Clock className={`h-4 w-4 mx-auto mb-2 ${selectedTimeSlot?.id === slot.id ? 'text-white' : 'text-blue-600'}`} />
                                  <div className="font-semibold text-sm">{slot.time}</div>
                                  <div className={`text-xs mt-1 ${selectedTimeSlot?.id === slot.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {(() => {
                                      const [hours, minutes] = slot.time.split(':')
                                      const hour = parseInt(hours)
                                      const ampm = hour >= 12 ? 'PM' : 'AM'
                                      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                                      return `${displayHour}:${minutes} ${ampm}`
                                    })()}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Available Slots</h4>
                  <p className="text-gray-600 mb-4">No time slots are available for {formatDate(currentDate)}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Try selecting a different date or</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const tomorrow = new Date(currentDate)
                        tomorrow.setDate(currentDate.getDate() + 1)
                        setCurrentDate(tomorrow)
                      }}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Check Tomorrow
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selection Summary */}
      {selectedTimeSlot && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Time Slot Selected</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Date:</span>
                <span className="text-gray-900">{selectedTimeSlot.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Time:</span>
                <span className="text-gray-900">{selectedTimeSlot.time}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Timezone:</span>
                <span className="text-gray-900">
                  {timezones.find(tz => tz.value === selectedTimezone)?.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="text-gray-900">{service?.duration}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Meeting Details</p>
                    <p className="text-blue-700">
                      You'll receive a calendar invite with Zoom meeting details after payment confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
