import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../Button'
import { CheckCircle, Clock, FileText, Shield, Users, Zap } from 'lucide-react'

export function ServicesPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Flexible Immigration Consulting Services. <span className="text-blue-600">Built Around Your Needs.</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Only pay for what you need. No retainers, no delays.
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From quick questions to full file reviews, our licensed consultants are here to help — on your terms.
          </p>
        </div>
      </section>

      {/* Service Cards Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Choose a Session Format That Works for You
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Simple Consultations */}
            <Card className="border-0 shadow-2xl bg-white">
              <CardContent className="p-12">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                    <Clock className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Simple Consultations</h3>
                  <p className="text-gray-600 text-lg">Pay by time - perfect for quick questions and guidance</p>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      duration: "30 min",
                      price: "$60 CAD",
                      description: "Ask questions or get fast guidance",
                      features: ["Live Zoom Session", "General questions", "Quick strategy advice"],
                    },
                    {
                      duration: "45 min",
                      price: "$85 CAD",
                      description: "More time to explore options",
                      features: ["Live Zoom Session", "Multiple topics", "Deeper guidance"],
                    },
                    {
                      duration: "60 min",
                      price: "$110 CAD",
                      description: "Best for complex or multi-step concerns",
                      features: ["Live Zoom Session", "Complex situations", "Full support planning"],
                    },
                  ].map((service, index) => (
                    <div key={index} className="p-6 bg-blue-50 rounded-xl border-2 border-blue-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{service.duration}</div>
                          <div className="text-gray-600">{service.description}</div>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{service.price}</div>
                      </div>
                      <ul className="space-y-2">
                        {service.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full">
                        Book Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Premium File Review */}
            <Card className="border-0 shadow-2xl bg-white">
              <CardContent className="p-12">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Premium File Review</h3>
                  <p className="text-gray-600 text-lg">Comprehensive document review with expert preparation</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">File Review</div>
                        <div className="text-gray-600">Complete document analysis</div>
                      </div>
                      <div className="text-3xl font-bold text-indigo-600">$200 CAD</div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Upload documents in advance
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Consultant prepares before session
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        45-minute discussion included
                      </li>
                    </ul>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-full">
                      Book Now
                    </Button>
                  </div>

                  <div className="p-6 bg-purple-50 rounded-xl border-2 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">File Review + Summary</div>
                        <div className="text-gray-600">Includes written post-session feedback</div>
                      </div>
                      <div className="text-3xl font-bold text-purple-600">$250 CAD</div>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Everything in File Review
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Written follow-up summary
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Action checklist included
                      </li>
                    </ul>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-full">
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add-ons Section */}
          <Card className="border-0 shadow-2xl bg-white mb-16">
            <CardContent className="p-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Follow-Up Options & Add-ons</h3>
                <p className="text-gray-600 text-lg">Extend your support with these additional services</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "Follow-Up Session",
                    price: "$50 CAD",
                    description: "30 mins within 2 weeks",
                    icon: <Users className="h-6 w-6" />,
                  },
                  {
                    name: "+15 Minute Extension",
                    price: "$20 CAD",
                    description: "Only if offered live by RCIC",
                    icon: <Clock className="h-6 w-6" />,
                  },
                  {
                    name: "Session Summary Email",
                    price: "$25 CAD",
                    description: "Written session summary",
                    icon: <FileText className="h-6 w-6" />,
                  },
                  {
                    name: "3-Session Bundle",
                    price: "$150 CAD",
                    description: "3 × 30-minute sessions",
                    icon: <Zap className="h-6 w-6" />,
                  },
                ].map((addon, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-50 rounded-xl text-center hover:bg-gray-100 transition-colors duration-300"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                      {addon.icon}
                    </div>
                    <div className="font-bold text-gray-900 mb-2">{addon.name}</div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{addon.price}</div>
                    <div className="text-sm text-gray-600">{addon.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card className="border-0 shadow-2xl bg-white">
            <CardContent className="p-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Compare Services</h3>
                <p className="text-gray-600 text-lg">Choose the right service for your needs</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-bold text-gray-900">Feature</th>
                      <th className="text-center py-4 px-6 font-bold text-blue-600">Simple Consultation</th>
                      <th className="text-center py-4 px-6 font-bold text-indigo-600">File Review</th>
                      <th className="text-center py-4 px-6 font-bold text-purple-600">File Review + Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        feature: "Live Zoom Session",
                        simple: true,
                        fileReview: true,
                        summary: true,
                      },
                      {
                        feature: "Document Upload",
                        simple: "Optional",
                        fileReview: true,
                        summary: true,
                      },
                      {
                        feature: "Pre-call Document Review",
                        simple: false,
                        fileReview: true,
                        summary: true,
                      },
                      {
                        feature: "Written Follow-Up Summary",
                        simple: false,
                        fileReview: false,
                        summary: true,
                      },
                      {
                        feature: "Ideal For",
                        simple: "General questions",
                        fileReview: "SOP, forms",
                        summary: "Detailed files, appeals",
                      },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-4 px-6 font-medium text-gray-900">{row.feature}</td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.simple === "boolean" ? (
                            row.simple ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">{row.simple}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.fileReview === "boolean" ? (
                            row.fileReview ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">{row.fileReview}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row.summary === "boolean" ? (
                            row.summary ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          ) : (
                            <span className="text-gray-600">{row.summary}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Pay-Per-Session */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8">One Price. No Retainers. Real Help.</h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Most immigration firms want you to commit to full-service retainers. We let you pay for just what you need
              — whether that's 30 minutes of quick advice, or a thorough document review. It's expert help, with zero
              pressure.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Flat-rate pricing",
                  description: "No surprises or hidden fees",
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "No obligation",
                  description: "No packages or retainers required",
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  title: "Choose your expert",
                  description: "Select by expertise and language",
                },
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
            >
              Find a Consultant
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
