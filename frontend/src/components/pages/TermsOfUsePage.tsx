import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { FileText, Scale, Users, Shield, AlertTriangle, Gavel, Globe, Mail } from 'lucide-react'

export function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full shadow-lg animate-float">
              <Scale className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Use</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our immigration consultation platform.
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
          {/* Acceptance of Terms */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Gavel className="h-6 w-6 mr-3 text-blue-600" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <p className="text-gray-700 mb-4">
                  By accessing and using this immigration consultation platform, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span>You must be at least 18 years old to use this service</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span>You agree to provide accurate and complete information</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                    <span>You understand that this platform facilitates connections with licensed RCICs</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Users className="h-6 w-6 mr-3 text-green-600" />
                Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2">Platform Services</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Connecting clients with licensed RCICs</li>
                      <li>• Appointment scheduling and management</li>
                      <li>• Payment processing for consultations</li>
                      <li>• Document sharing and communication tools</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">RCIC Services</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Immigration consultation and advice</li>
                      <li>• Application preparation and review</li>
                      <li>• Professional representation</li>
                      <li>• Ongoing case management</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h4 className="font-semibold text-orange-900 mb-2">Service Limitations</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• We do not provide immigration advice directly</li>
                      <li>• We do not guarantee immigration outcomes</li>
                      <li>• Services are subject to RCIC availability</li>
                      <li>• Consultations are conducted by third-party RCICs</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">Quality Assurance</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• All RCICs are licensed and verified</li>
                      <li>• Regular performance monitoring</li>
                      <li>• Customer feedback and rating system</li>
                      <li>• Continuous improvement processes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Shield className="h-6 w-6 mr-3 text-purple-600" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-4">Account Management</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-purple-800">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                        Maintain accurate account information
                      </div>
                      <div className="flex items-center text-sm text-purple-800">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                        Keep login credentials secure
                      </div>
                      <div className="flex items-center text-sm text-purple-800">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                        Report unauthorized access immediately
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-purple-800">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                        Use the platform lawfully and ethically
                      </div>
                      <div className="flex items-center text-sm text-purple-800">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                        Respect other users and RCICs
                      </div>
                      <div className="flex items-center text-sm text-purple-800">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2"></div>
                        Provide honest feedback and ratings
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-100">
                  <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Prohibited Activities
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-red-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        Providing false or misleading information
                      </div>
                      <div className="flex items-center text-sm text-red-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        Attempting to bypass security measures
                      </div>
                      <div className="flex items-center text-sm text-red-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        Sharing account credentials with others
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-red-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        Using the platform for illegal activities
                      </div>
                      <div className="flex items-center text-sm text-red-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        Harassing or abusing other users
                      </div>
                      <div className="flex items-center text-sm text-red-800">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                        Attempting to circumvent payment systems
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <FileText className="h-6 w-6 mr-3 text-green-600" />
                Payment Terms & Refunds
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-2">Payment Processing</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Secure payment processing through encrypted channels</li>
                      <li>• Multiple payment methods accepted</li>
                      <li>• Instant payment confirmation</li>
                      <li>• Detailed receipts and transaction history</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-2">Pricing Structure</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Transparent pricing with no hidden fees</li>
                      <li>• Different rates for various consultation types</li>
                      <li>• RCIC-specific pricing based on experience</li>
                      <li>• Platform service fee clearly disclosed</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                    <h4 className="font-semibold text-orange-900 mb-2">Refund Policy</h4>
                    <ul className="text-sm text-orange-800 space-y-1">
                      <li>• Full refund for cancellations 24+ hours in advance</li>
                      <li>• Partial refund for cancellations within 24 hours</li>
                      <li>• No refund for no-shows without notice</li>
                      <li>• Refunds processed within 5-7 business days</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-2">Dispute Resolution</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      <li>• Contact customer support for payment issues</li>
                      <li>• Formal dispute process available</li>
                      <li>• Third-party mediation if necessary</li>
                      <li>• Fair resolution within 30 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimers & Limitations */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-600" />
                Disclaimers & Limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-100">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Service Disclaimer</h4>
                    <p className="text-sm text-red-800">
                      This platform serves as a connection service between clients and licensed RCICs. We do not provide immigration advice, legal services, or guarantee any immigration outcomes. All professional services are provided directly by licensed RCICs.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Limitation of Liability</h4>
                    <p className="text-sm text-red-800">
                      Our liability is limited to the platform service fees paid. We are not responsible for the quality, accuracy, or outcomes of immigration services provided by RCICs. Users assume all risks associated with immigration applications and decisions.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Third-Party Services</h4>
                    <p className="text-sm text-red-800">
                      RCICs are independent professionals. While we verify their licensing, we do not control their methods, advice, or service quality. Users should conduct their own due diligence when selecting an RCIC.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Globe className="h-6 w-6 mr-3 text-blue-600" />
                Governing Law & Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Applicable Law</h4>
                      <p className="text-sm text-blue-800">
                        These terms are governed by the laws of Canada. Any disputes will be resolved in accordance with Canadian federal and provincial regulations governing immigration services.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Regulatory Compliance</h4>
                      <p className="text-sm text-blue-800">
                        All services comply with regulations set by Immigration, Refugees and Citizenship Canada (IRCC) and the College of Immigration and Citizenship Consultants (CICC).
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Dispute Resolution</h4>
                      <p className="text-sm text-blue-800">
                        Any legal disputes will be resolved through binding arbitration in Canada, except where prohibited by law. Users waive the right to participate in class action lawsuits.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Severability</h4>
                      <p className="text-sm text-blue-800">
                        If any provision of these terms is found unenforceable, the remaining provisions will continue in full force and effect.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0 backdrop-blur-sm bg-white/80 card-professional">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl font-bold text-gray-900">
                <Mail className="h-6 w-6 mr-3 text-green-600" />
                Questions & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-100">
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Use, please don't hesitate to contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Legal inquiries:</span>
                      <span className="ml-2">legal@immigrationplatform.com</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Customer support:</span>
                      <span className="ml-2">support@immigrationplatform.com</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-700">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Compliance officer:</span>
                      <span className="ml-2">Available for regulatory questions</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Globe className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">Business hours:</span>
                      <span className="ml-2">Monday - Friday, 9 AM - 6 PM EST</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            By using our platform, you acknowledge that you have read, understood, and agree to these Terms of Use.
          </p>
          <p className="text-xs text-gray-400">
            These terms may be updated periodically. Continued use of the platform constitutes acceptance of any changes.
          </p>
        </div>
      </div>
    </div>
  )
}
