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

  // Mock available time slots
  const generateTimeSlots = (date: Date) => {
    const slots = []
    const baseTime = new Date(date)
    baseTime.setHours(9, 0, 0, 0) // Start at 9 AM
    
    for (let i = 0; i < 16; i++) { // 9 AM to 5 PM (8 hours, 30min slots)
      const time = new Date(baseTime)
      time.setMinutes(baseTime.getMinutes() + (i * 30))
      
      // Skip lunch hours (12-1 PM) and add some randomness for availability
      if (time.getHours() === 12 || Math.random() > 0.7) {
        continue
      }
      
      slots.push({
        id: i,
        time: time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        }),
        datetime: time,
        available: true
      })
    }
    return slots
  }

  const [availableSlots, setAvailableSlots] = useState(generateTimeSlots(currentDate))

  const timezones = [
    { value: 'America/Toronto', label: 'Eastern Time (ET)', offset: 'UTC-5' },
    { value: 'America/Vancouver', label: 'Pacific Time (PT)', offset: 'UTC-8' },
    { value: 'America/Edmonton', label: 'Mountain Time (MT)', offset: 'UTC-7' },
    { value: 'America/Winnipeg', label: 'Central Time (CT)', offset: 'UTC-6' },
    { value: 'America/Halifax', label: 'Atlantic Time (AT)', offset: 'UTC-4' },
    { value: 'America/St_Johns', label: 'Newfoundland Time (NT)', offset: 'UTC-3:30' }
  ]

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
    setAvailableSlots(generateTimeSlots(newDate))
    setSelectedTimeSlot(null) // Reset selection when date changes
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
          {/* Date Selector */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Date</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateChange('prev')}
                    disabled={isPastDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDateChange('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xl font-semibold text-gray-900">{formatDate(currentDate)}</p>
                {isToday(currentDate) && (
                  <Badge className="bg-blue-100 text-blue-800 mt-2">Today</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
              
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedTimeSlot?.id === slot.id ? "default" : "outline"}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`p-3 h-auto flex flex-col items-center gap-1 transition-all duration-200 ${
                        selectedTimeSlot?.id === slot.id
                          ? 'bg-blue-600 text-white ring-2 ring-blue-500'
                          : 'hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{slot.time}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No available slots for this date</p>
                  <p className="text-sm text-gray-400">Try selecting a different date</p>
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
