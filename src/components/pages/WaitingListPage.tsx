import React, { useState } from 'react'
import { Button } from '../Button'
import { Input } from '../ui/Input'
import { Card, CardContent } from '../ui/Card'

export function WaitingListPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    immigrationGoal: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 You're on the list!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for joining our waiting list. We'll notify you as soon as we launch with exclusive early access and special offers.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 space-y-2 text-left">
                <li>✉️ You'll receive a confirmation email shortly</li>
                <li>🎁 Get 10% off when we launch</li>
                <li>⚡ Early access to book consultations</li>
                <li>📧 Updates on our progress</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Join Our Waiting List
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Be the first to know when we launch and get exclusive early access offers!
          </p>
        </div>
        
        <div className="mt-10">
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gray-50 text-lg font-medium text-gray-500">
                Sign up now
              </span>
            </div>
          </div>

          <div className="mt-8">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="immigrationGoal" className="block text-sm font-medium text-gray-700 mb-2">
                      Immigration Goal
                    </label>
                    <select
                      id="immigrationGoal"
                      name="immigrationGoal"
                      value={formData.immigrationGoal}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your immigration goal</option>
                      <option value="express-entry">🚀 Express Entry</option>
                      <option value="study-permit">🎓 Study Permit</option>
                      <option value="work-permit">💼 Work Permit</option>
                      <option value="family-sponsorship">❤️ Family Sponsorship</option>
                      <option value="provincial-nominee">🏛️ Provincial Nominee Program</option>
                      <option value="citizenship">🍁 Canadian Citizenship</option>
                      <option value="visitor-visa">✈️ Visitor Visa</option>
                      <option value="other">🤔 Other / Not Sure</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Joining...
                      </span>
                    ) : (
                      '🎉 Join the Waiting List'
                    )}
                  </Button>
                </form>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">What you'll get:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>✨ Exclusive early access to the platform</li>
                    <li>💰 10% discount on your first consultation</li>
                    <li>📧 Regular updates on our launch progress</li>
                    <li>🎯 Priority booking when we go live</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Join 2,500+ People Already Waiting
            </h2>
            <p className="text-gray-600 mb-8">
              Be part of a community that's ready to transform Canadian immigration consulting
            </p>
            
            <div className="flex justify-center items-center space-x-2">
              <div className="flex -space-x-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 border-2 border-white flex items-center justify-center text-white text-sm font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-gray-600 ml-4">and counting...</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
