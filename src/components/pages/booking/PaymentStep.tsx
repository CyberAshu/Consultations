import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Button } from '../../Button'
import { 
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Receipt
} from 'lucide-react'

interface PaymentStepProps {
  onDataChange: (data: any) => void
  bookingData: any
}

export function PaymentStep({ onDataChange, bookingData }: PaymentStepProps) {
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null)

  // Calculate pricing breakdown
  const subtotal = bookingData.service?.price || 0
  const platformFee = Math.round(subtotal * 0.05) // 5% platform fee
  const taxes = Math.round((subtotal + platformFee) * 0.13) // 13% HST
  const total = subtotal + platformFee + taxes

  useEffect(() => {
    onDataChange({
      payment: paymentData,
      totalAmount: total
    })
  }, [paymentData, total, onDataChange])

  const handleStripePayment = async () => {
    setProcessing(true)
    
    // Mock Stripe payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockPaymentData = {
      id: 'pay_' + Math.random().toString(36).substr(2, 9),
      method: 'stripe',
      status: 'succeeded',
      amount: total,
      currency: 'CAD',
      receipt_url: 'https://pay.stripe.com/receipts/mock-receipt',
      created: new Date().toISOString()
    }
    
    setPaymentData(mockPaymentData)
    setPaymentComplete(true)
    setProcessing(false)
  }

  const mockCardDetails = {
    last4: '4242',
    brand: 'visa',
    exp_month: '12',
    exp_year: '2025'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Secure Payment
        </h2>
        <p className="text-gray-600">
          Complete your booking with secure payment processing.
        </p>
      </div>

      {/* Booking Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {bookingData.rcic?.name?.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{bookingData.service?.name}</p>
                <p className="text-sm text-gray-600">with {bookingData.rcic?.name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{bookingData.timeSlot?.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{bookingData.timeSlot?.time}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{bookingData.service?.name}</span>
              <span className="font-medium">${subtotal} CAD</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Platform fee (5%)</span>
              <span>${platformFee} CAD</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">HST (13%)</span>
              <span>${taxes} CAD</span>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span className="text-blue-600">${total} CAD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!paymentComplete ? (
        /* Payment Form */
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-gray-200/50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-600">Your payment information is encrypted and secure</p>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <label className="block text-sm font-medium text-gray-700">Payment Method</label>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment-method"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Credit/Debit Card</span>
                  <div className="flex gap-2 ml-auto">
                    <img src="/api/placeholder/30/20" alt="Visa" className="h-5" />
                    <img src="/api/placeholder/30/20" alt="Mastercard" className="h-5" />
                    <img src="/api/placeholder/30/20" alt="Amex" className="h-5" />
                  </div>
                </label>
              </div>
            </div>

            {/* Stripe Payment Form (Mock) */}
            {paymentMethod === 'stripe' && (
              <div className="space-y-6">
                {/* Mock Stripe Elements */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Information
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                      <div className="flex items-center gap-2 text-gray-500">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-sm">Stripe Elements would be embedded here</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      For demo: Use any test card number like 4242 4242 4242 4242
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                        <span className="text-sm text-gray-500">MM/YY</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                        <span className="text-sm text-gray-500">123</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Full name on card"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Security Features */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-medium text-green-900 mb-1">Secure Payment</h4>
                      <ul className="text-green-700 space-y-1">
                        <li>• 256-bit SSL encryption</li>
                        <li>• PCI DSS compliant</li>
                        <li>• Your card details are never stored</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handleStripePayment}
                  disabled={processing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Pay ${total} CAD
                    </div>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By completing this payment, you agree to our terms of service and privacy policy.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Payment Success */
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200/50">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your payment has been processed successfully. You can proceed to the next step.
            </p>

            {/* Payment Details */}
            <div className="bg-white rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono">{paymentData?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>${paymentData?.amount} CAD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="capitalize">
                    {mockCardDetails.brand} •••• {mockCardDetails.last4}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {paymentData?.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open(paymentData?.receipt_url, '_blank')}
              >
                <Receipt className="h-4 w-4" />
                View Receipt
              </Button>
              
              <div className="bg-blue-50 rounded-lg p-3 flex-1">
                <div className="flex items-center gap-2 text-blue-700 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>You'll receive a confirmation email with booking details shortly.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center gap-2 p-4">
          <Shield className="h-6 w-6 text-green-600" />
          <span className="text-sm font-medium text-gray-700">SSL Secured</span>
          <span className="text-xs text-gray-500">Bank-level encryption</span>
        </div>
        
        <div className="flex flex-col items-center gap-2 p-4">
          <Lock className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">PCI Compliant</span>
          <span className="text-xs text-gray-500">Industry standard security</span>
        </div>
        
        <div className="flex flex-col items-center gap-2 p-4">
          <CheckCircle className="h-6 w-6 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Verified Platform</span>
          <span className="text-xs text-gray-500">Trusted by thousands</span>
        </div>
      </div>
    </div>
  )
}
