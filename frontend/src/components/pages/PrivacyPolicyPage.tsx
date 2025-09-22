import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Shield, Lock, Eye, Database, Users, FileText, Calendar, Mail } from 'lucide-react'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg animate-float">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Information We Collect */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Database className="h-6 w-6 mr-3 text-blue-600" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Personal Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Name, email address, phone number</li>
                    <li>• Immigration status and documentation</li>
                    <li>• Professional qualifications and experience</li>
                    <li>• Communication preferences</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Usage Information
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Website interaction data and analytics</li>
                    <li>• Device information and browser details</li>
                    <li>• IP address and location data</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Service-Related Information
                  </h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Consultation booking and scheduling data</li>
                    <li>• Payment information and transaction history</li>
                    <li>• Service feedback and reviews</li>
                    <li>• Support communications and queries</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Lock className="h-6 w-6 mr-3 text-green-600" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Service Delivery</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Providing immigration consultation services</li>
                    <li>• Matching clients with qualified RCICs</li>
                    <li>• Scheduling and managing appointments</li>
                    <li>• Processing payments and transactions</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Communication</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Sending appointment confirmations</li>
                    <li>• Providing service updates and notifications</li>
                    <li>• Responding to customer inquiries</li>
                    <li>• Sharing relevant immigration news</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Platform Improvement</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Analyzing user behavior and preferences</li>
                    <li>• Improving website functionality</li>
                    <li>• Developing new features and services</li>
                    <li>• Ensuring platform security and reliability</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Legal Compliance</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Complying with regulatory requirements</li>
                    <li>• Preventing fraud and unauthorized access</li>
                    <li>• Maintaining accurate records</li>
                    <li>• Responding to legal requests</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Shield className="h-6 w-6 mr-3 text-red-600" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-100">
                <p className="text-gray-700 mb-4">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      SSL/TLS encryption for data transmission
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Secure database storage with encryption
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Regular security audits and updates
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Access controls and authentication
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Data backup and recovery procedures
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Employee training on data protection
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Users className="h-6 w-6 mr-3 text-purple-600" />
                Your Rights & Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">Access & Correction</h4>
                    <p className="text-sm text-purple-800">
                      Request access to your personal information and correct any inaccuracies.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">Data Portability</h4>
                    <p className="text-sm text-blue-800">
                      Receive a copy of your data in a structured, machine-readable format.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2">Deletion Request</h4>
                    <p className="text-sm text-green-800">
                      Request deletion of your personal information, subject to legal requirements.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h4 className="font-semibold text-orange-900 mb-2">Opt-Out</h4>
                    <p className="text-sm text-orange-800">
                      Unsubscribe from marketing communications at any time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Mail className="h-6 w-6 mr-3 text-blue-600" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">info@immigwise.com</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Response Time:</span>
                      <span className="ml-2">Within 5 business days</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Shield className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Data Protection Officer:</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">
                      Available for privacy-related inquiries
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This Privacy Policy is effective as of the date last updated and will remain in effect except with respect to any changes in its provisions in the future.
          </p>
        </div>
      </div>
    </div>
  )
}
