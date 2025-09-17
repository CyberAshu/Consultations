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
import { consultantService } from '../../services/consultantService'
import { intakeService } from '../../services/intakeService'
import { CreateBookingRequest } from '../../services/types'

export function BookingFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [showFloatingSummary, setShowFloatingSummary] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
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
      if (isCompleting) return // Prevent duplicate submissions
      
      try {
        setIsCompleting(true)
        await createActualBooking()
        setCurrentStep(currentStep + 1)
      } catch (error) {
        console.error('Failed to create booking:', error)
        let errorMessage = 'Failed to create booking. Please try again.'
        if (error instanceof Error) {
          errorMessage = error.message
        }
        alert(`Booking Error: ${errorMessage}`)
      } finally {
        setIsCompleting(false)
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

    // Extract service and duration IDs with multiple fallback strategies
    const serviceId = bookingData.service.serviceId || bookingData.service.id;
    let durationOptionId = bookingData.service.durationOptionId || 
                          bookingData.service.duration_option_id ||
                          bookingData.service.selected_duration_id ||
                          bookingData.service.selectedDurationId;
    
    console.log('🔍 Extracting booking IDs:', {
      serviceId,
      durationOptionId,
      serviceObject: bookingData.service,
      rcicId: bookingData.rcic.id,
      allServiceKeys: Object.keys(bookingData.service),
      serviceValues: Object.entries(bookingData.service).filter(([key, value]) => 
        key.toLowerCase().includes('duration') || key.toLowerCase().includes('option')
      ),
      isLegacyService: !durationOptionId && bookingData.service.duration
    });
    
    if (!serviceId) {
      throw new Error(`Missing service ID: ${serviceId}`);
    }
    
    
    if (!durationOptionId) {
      console.error('Service object details:', bookingData.service);
      throw new Error(`Missing duration option ID. This appears to be a legacy service format. Available keys: ${Object.keys(bookingData.service).join(', ')}`);
    }
    
    // Prepare booking data for API using new duration-based endpoint
    const bookingRequest = {
      consultant_id: bookingData.rcic.id,
      service_id: serviceId,
      duration_option_id: durationOptionId,
      booking_date: scheduleDate.toISOString(),
      timezone: bookingData.timezone,
      intake_form_data: bookingData.intakeForm,
    }

    console.log('Creating booking with data:', bookingRequest)
    console.log('Service object:', bookingData.service)
    console.log('RCIC object:', bookingData.rcic)

    const createdBooking = await bookingService.createBookingWithDuration(bookingRequest)

    try {
      // After booking is created, upload any files from intake form
      const intake = bookingData.intakeForm || {}
      const allFiles: any[] = [
        ...(Array.isArray(intake.uploadedFiles) ? intake.uploadedFiles : []),
        ...(Array.isArray(intake.optionalUploads) ? intake.optionalUploads : [])
      ]

      console.log('🔍 BookingFlow: Starting file upload process...')
      console.log('🔍 BookingFlow: Total files to upload:', allFiles.length)
      console.log('🔍 BookingFlow: intake object structure:', intake)
      console.log('🔍 BookingFlow: uploadedFiles array:', intake.uploadedFiles)
      console.log('🔍 BookingFlow: optionalUploads array:', intake.optionalUploads)
      console.log('🔍 BookingFlow: allFiles array:', allFiles)
      
      for (const f of allFiles) {
        console.log('🔍 BookingFlow: Processing file:', {
          id: f.id,
          name: f.name,
          size: f.size,
          type: f.type,
          hasFile: !!f.file,
          fileType: f.file ? f.file.constructor.name : 'No file',
          isFileInstance: f.file instanceof File,
          fileObject: f.file,
          entireFileObject: f
        })
        
        // Fix: Check if f.file exists and is a File instance
        if (f && f.file && f.file instanceof File) {
          console.log('✅ BookingFlow: Uploading file:', f.name)
          try {
            const uploadResult = await bookingService.uploadBookingDocument(createdBooking.id, f.file)
            console.log('✅ BookingFlow: File uploaded successfully:', uploadResult)
          } catch (fileUploadError) {
            console.error('❌ BookingFlow: Failed to upload file:', f.name, fileUploadError)
            // Continue with other files even if one fails
          }
        } else {
          console.warn('⚠️ BookingFlow: Skipping invalid file object:', f)
        }
      }
      
      console.log('✅ BookingFlow: File upload process completed')
    } catch (uploadErr) {
      console.error('❌ BookingFlow: File upload process failed:', uploadErr)
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
    console.log('🔍 canProceed check:', {
      currentStep,
      bookingData: bookingData,
      rcic: bookingData.rcic,
      service: bookingData.service
    });
    
    switch (currentStep) {
      case 1: {
        const hasRCIC = !!bookingData.rcic;
        
        // More flexible service validation
        const service = bookingData.service;
        const hasService = service && (
          // New format: serviceId + durationOptionId
          (service.serviceId && service.durationOptionId) ||
          // Legacy format: id + name (for backwards compatibility)
          (service.id && service.name) ||
          // Alternative formats
          (service.serviceId && service.id)
        );
        
        console.log('🔍 Step 1 validation:', {
          hasRCIC,
          hasService,
          serviceData: service,
          serviceId: service?.serviceId || service?.id,
          durationOptionId: service?.durationOptionId,
          serviceName: service?.serviceName || service?.name,
          fullServiceObject: service
        });
        
        return hasRCIC && hasService;
      }
      case 2: {
        const hasTimeSlot = !!bookingData.timeSlot;
        return hasTimeSlot;
      }
      case 3: {
        const hasPayment = !!bookingData.payment;
        return hasPayment;
      }
      case 4: {
        // Check if intake form exists and is marked as completed
        const intakeForm = bookingData.intakeForm
        if (!intakeForm) return false;
        
        // Must have completed the form (this is automatically set to true in our new flow)
        if (!intakeForm.completed) return false;
        
        // With our new simplified flow, if form is marked completed, we can proceed
        // The intake data extraction happens on the backend automatically
        console.log('✅ Step 4 validation passed - intake form completed:', intakeForm.completed);
        return true;
      }
      default: {
        return false;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <div className="relative bg-white/95 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-6">
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-gray-300 text-gray-700 hover:bg-white/90 hover:shadow-md transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Book Your Consultation
                </h1>
                <p className="text-gray-600 text-sm mt-1">Step {currentStep} of {steps.length}</p>
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
            <div className="relative">
              {/* Glassmorphism container */}
              <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90 hover:shadow-md transition-all duration-200 px-6 py-3"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="font-medium">Previous</span>
                  </Button>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">
                        Step {currentStep} of {steps.length - 1}
                      </div>
                      <div className="text-xs text-gray-400">
                        {steps.find(s => s.id === currentStep)?.title}
                      </div>
                    </div>
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed() || isCompleting}
                      className={`flex items-center gap-3 px-8 py-3 font-semibold transition-all duration-200 ${
                        !canProceed() || isCompleting
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      {currentStep === 4 ? (isCompleting ? 'Creating Booking...' : 'Complete Booking') : 'Next Step'}
                      {isCompleting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                  {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
                </div>
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
