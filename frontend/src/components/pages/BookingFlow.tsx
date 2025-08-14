import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../shared/Button'
import { Card, CardContent } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Calendar,
  User
} from 'lucide-react'
import { SelectRCICStep } from '../booking/steps/SelectRCICStep'
import { ChooseTimeSlotStep } from '../booking/steps/ChooseTimeSlotStep'
import { PaymentStep } from '../booking/steps/PaymentStep'
import { IntakeFormStep } from '../booking/steps/IntakeFormStep'
import { BookingConfirmation } from '../booking/steps/BookingConfirmation'
import { FloatingBookingSummary } from '../booking/FloatingBookingSummary'
import { ScrollToTop } from '../ui/ScrollToTop'
import { bookingService } from '../../services/bookingService'
import { CreateBookingRequest } from '../../services/types'

export function BookingFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [showFloatingSummary, setShowFloatingSummary] = useState(false)
  const [bookingData, setBookingData] = useState<any>({
    rcic: null,
    service: null,
    timeSlot: null,
    timezone: 'America/Toronto',
    payment: null,
    intakeForm: null,
    totalAmount: 0
  })

  // Auto scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Show floating summary when there's booking data and not on first or last step
  useEffect(() => {
    const shouldShow = currentStep > 1 && currentStep < 5 && (bookingData.rcic || bookingData.service)
    setShowFloatingSummary(shouldShow)
  }, [currentStep, bookingData.rcic, bookingData.service])

  // Pre-fill from URL params if coming from RCIC profile
  const prefilledRCIC = searchParams.get('rcic')
  const prefilledService = searchParams.get('service')

  const steps = [
    { 
      id: 1, 
      title: 'Select RCIC & Service', 
      icon: <User className="h-4 w-4" />,
      description: 'Choose your consultant and service type'
    },
    { 
      id: 2, 
      title: 'Choose Time Slot', 
      icon: <Calendar className="h-4 w-4" />,
      description: 'Pick your preferred date and time'
    },
    { 
      id: 3, 
      title: 'Payment', 
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Secure payment processing'
    },
    { 
      id: 4, 
      title: 'Intake Form', 
      icon: <FileText className="h-4 w-4" />,
      description: 'Upload required documents'
    },
    { 
      id: 5, 
      title: 'Confirmation', 
      icon: <CheckCircle className="h-4 w-4" />,
      description: 'Booking complete!'
    }
  ]

  const handleNext = async () => {
    if (currentStep === 4) {
      // Create actual booking when moving from step 4 to 5
      try {
        await createActualBooking()
        setCurrentStep(currentStep + 1)
      } catch (error) {
        console.error('Failed to create booking:', error)
        let errorMessage = 'Failed to create booking. Please try again.'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        alert(`Booking Error: ${errorMessage}`)
      }
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const createActualBooking = async () => {
    if (!bookingData.rcic || !bookingData.service || !bookingData.timeSlot || !bookingData.payment) {
      throw new Error('Missing required booking data')
    }

    // Get the scheduled date - use datetime if available, otherwise construct from date/time
    let scheduleDate: Date
    
    if (bookingData.timeSlot.datetime) {
      // Use the datetime object directly if available
      scheduleDate = new Date(bookingData.timeSlot.datetime)
    } else if (bookingData.timeSlot.time) {
      // Fallback: construct from current date context and time
      // This handles the case where we have a time string like "14:30"
      const today = new Date()
      const [hours, minutes] = bookingData.timeSlot.time.split(':')
      scheduleDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes))
    } else {
      throw new Error('No valid date/time information available')
    }
    
    // Validate the final date
    if (isNaN(scheduleDate.getTime())) {
      throw new Error('Invalid date or time format')
    }

    // Prepare booking data for API
    const bookingRequest: CreateBookingRequest = {
      consultant_id: bookingData.rcic.id,
      service_id: bookingData.service.id,
      booking_date: scheduleDate.toISOString(),
      timezone: bookingData.timezone,
      total_amount: bookingData.totalAmount,
      payment_intent_id: bookingData.payment.id,
      intake_form_data: bookingData.intakeForm,
      // Pass client_id if present (e.g., when booking created by rcic/admin on behalf of a client)
      client_id: bookingData?.client?.id || bookingData?.client_id
    }

    console.log('Creating booking with data:', bookingRequest)
    console.log('Service object:', bookingData.service)
    console.log('RCIC object:', bookingData.rcic)

    const createdBooking = await bookingService.createBooking(bookingRequest)

    try {
      // After booking is created, upload any files from intake form
      const intake = bookingData.intakeForm || {}
      const allFiles: any[] = [
        ...(Array.isArray(intake.uploadedFiles) ? intake.uploadedFiles : []),
        ...(Array.isArray(intake.optionalUploads) ? intake.optionalUploads : [])
      ]

      for (const f of allFiles) {
        if (f?.file instanceof File) {
          await bookingService.uploadBookingDocument(createdBooking.id, f.file)
        }
      }
    } catch (uploadErr) {
      console.error('Some files failed to upload:', uploadErr)
      // Proceed even if uploads fail; optionally show a non-blocking alert
    }

    // Update booking data with the created booking ID
    setBookingData((prev: any) => ({
      ...prev,
      bookingId: createdBooking.id
    }))
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepData = useCallback((stepData: any) => {
    setBookingData((prev: any) => ({ ...prev, ...stepData }))
  }, [])

  const canProceed = () => {
    switch (currentStep) {
      case 1: return bookingData.rcic && bookingData.service
      case 2: return bookingData.timeSlot
      case 3: return bookingData.payment
      case 4: return bookingData.intakeForm
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white/60 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Book Your Consultation
                </h1>
                <p className="text-gray-600 text-sm">Step {currentStep} of {steps.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center min-w-0 flex-shrink-0">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <span className="text-xs sm:text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-2 sm:ml-3 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      <span className="hidden md:inline">{step.title}</span>
                      <span className="md:hidden">{step.title.split(' ')[0]}</span>
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block truncate max-w-32">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 min-w-8 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-6">
          {currentStep === 1 && (
            <SelectRCICStep
              onDataChange={handleStepData}
              prefilledRCIC={prefilledRCIC}
              prefilledService={prefilledService}
              currentData={bookingData}
            />
          )}

          {currentStep === 2 && (
            <ChooseTimeSlotStep
              onDataChange={handleStepData}
              rcic={bookingData.rcic}
              service={bookingData.service}
              currentData={bookingData}
            />
          )}

          {currentStep === 3 && (
            <PaymentStep
              onDataChange={handleStepData}
              bookingData={bookingData}
            />
          )}

          {currentStep === 4 && (
            <IntakeFormStep
              onDataChange={handleStepData}
              service={bookingData.service}
              currentData={bookingData}
            />
          )}

          {currentStep === 5 && (
            <BookingConfirmation
              bookingData={bookingData}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Step {currentStep} of {steps.length - 1}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === 4 ? 'Complete Booking' : 'Next Step'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Booking Summary for Mobile/Tablet */}
      <FloatingBookingSummary 
        bookingData={bookingData} 
        currentStep={currentStep}
        isVisible={showFloatingSummary}
        onClose={() => setShowFloatingSummary(false)}
      />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
