import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../Button'
import { Globe, Heart, Shield, Lightbulb, CheckCircle } from 'lucide-react'

export function AboutPage() {
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
            Why We Built <span className="text-blue-600">This Platform</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">Real Immigration Help. From Real Experts.</p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Born from our own journey, built to empower yours.</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8">
                This Started With a <span className="text-blue-600">Frustrated Search</span> for Help.
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  We created this platform after facing the immigration system ourselves. Endless confusion. Unreturned
                  emails. Expensive retainers just to ask a single question. We realized how hard it was to find honest,
                  licensed advice—especially without risking thousands of dollars up front.
                </p>
                <p>
                  So we built what we wished we had: a secure, flexible, transparent platform where anyone can book time
                  with a licensed RCIC, get expert advice, and move forward with confidence.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:scale-105">
                <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Diverse Family Image</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">What We Stand For</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Four pillars that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Access",
                description: "Book from anywhere, pay per session—no long-term commitment.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Trust",
                description: "Every consultant is licensed and verified.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: "Clarity",
                description: "Transparent pricing. No hidden fees.",
                color: "from-yellow-500 to-orange-600",
              },
              {
                icon: <Heart className="h-10 w-10" />,
                title: "Empowerment",
                description: "You stay in control. We just help you make smarter moves.",
                color: "from-purple-500 to-pink-600",
              },
            ].map((pillar, index) => (
              <Card
                key={index}
                className="border-0 shadow-xl hover:shadow-2xl text-center transition-all duration-500 transform hover:-translate-y-2 group bg-white"
              >
                <CardContent className="p-10">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Built for <span className="text-blue-600">People Like You</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether it's your first application or your fifth, we're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🎓",
                title: "International Students",
                question: "Should I switch to PGWP now or wait?",
              },
              {
                icon: "🧑‍🤝‍🧑",
                title: "Spousal Applicants",
                question: "Are my relationship docs strong enough?",
              },
              {
                icon: "💼",
                title: "Workers",
                question: "Can I apply for PR under Express Entry yet?",
              },
              {
                icon: "🏡",
                title: "Families & Sponsors",
                question: "How do I bring my parents here safely?",
              },
            ].map((persona, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl text-center transition-all duration-500 transform hover:-translate-y-2 group bg-white"
              >
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">{persona.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{persona.title}</h3>
                  <p className="text-gray-600 italic">"{persona.question}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Community Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8">
              <span className="text-blue-600">RCICs</span> You Can Trust
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Our consultants are all licensed members of the College of Immigration and Citizenship Consultants (CICC).
              They bring years of practical experience and a client-first mindset. You'll see their license number,
              specialty areas, languages spoken, and availability right on their profile.
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
            >
              Meet Our RCICs
            </Button>
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-8">
              Safe. Private. <span className="text-blue-600">On Your Terms.</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              We built this platform to protect your trust, your data, and your time. Your bookings are confidential.
              Your documents are secure. And you never pay for more than you use.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Secure & Private",
                  description: "Your data is encrypted and protected",
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  title: "Licensed Experts",
                  description: "All consultants are CICC verified",
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Client-First",
                  description: "Your success is our priority",
                },
              ].map((promise, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
                    {promise.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{promise.title}</h3>
                  <p className="text-gray-600">{promise.description}</p>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            The easiest way to get licensed Canadian immigration help—no stress, no surprises.
          </p>
        </div>
      </section>
    </div>
  )
}
