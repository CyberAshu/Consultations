import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../shared/Button'
import { Globe, Heart, Shield, Lightbulb, CheckCircle, Users } from 'lucide-react'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
              Why We Built 
              <span className="block font-semibold text-blue-600">This Platform</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-6 font-light leading-relaxed max-w-2xl mx-auto">
              Real Immigration Help. From Real Experts.
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto font-light">
              Born from our own journey, built to empower yours.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section - Gale Inspired */}
      <section className="max-w-[95dvw] md:max-w-[78dvw] 2.5xl:max-w-[1300px] mx-auto md:px-4 py-16 md:py-24 flex flex-col justify-center items-center md:items-start md:flex-row md:gap-10">
        <div className="px-[5dvw] md:px-0 transition-all duration-700 ease-out transform w-[95%] md:w-[44%]" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR STORY</h2>
          <h1 className="text-4xl md:text-5xl font-light mb-4">
            This Started With a <em className="font-light italic text-blue-600">Frustrated Search</em> for Help
          </h1>
          <div className="space-y-6 text-gray-600 font-light mb-8 leading-relaxed">
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
          <div className="w-fit">
            <Button className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-light lg:block hidden hover:cursor-pointer">
              Learn More
            </Button>
          </div>
        </div>
        <div className="w-[95%] md:w-[56%] border-[1px] border-gray-300 rounded-lg overflow-hidden shadow-md" style={{opacity: 1, transform: 'translateY(0px)'}}>
          <div className="w-full h-[400px] md:h-[500px] relative">
            <img 
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
              alt="Immigration Success Stories - Happy families and individuals celebrating their Canadian immigration journey"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-light mb-2">Immigration Success Stories</h3>
              <p className="text-gray-200 font-light">Real people, real journeys, real success</p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Stand For Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR VALUES</h2>
            <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              What We Stand For
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">Four pillars that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10" />,
                title: "Access",
                description: "Book from anywhere, pay per session—no long-term commitment.",
                color: "from-gray-600 to-gray-700",
              },
              {
                icon: <Shield className="h-10 w-10" />,
                title: "Trust",
                description: "Every consultant is licensed and verified.",
                color: "from-gray-600 to-gray-700",
              },
              {
                icon: <Lightbulb className="h-10 w-10" />,
                title: "Clarity",
                description: "Transparent pricing. No hidden fees.",
                color: "from-gray-600 to-gray-700",
              },
              {
                icon: <Heart className="h-10 w-10" />,
                title: "Empowerment",
                description: "You stay in control. We just help you make smarter moves.",
                color: "from-gray-600 to-gray-700",
              },
            ].map((pillar, index) => (
              <Card
                key={index}
                className="bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-light">{pillar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Help Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">WHO WE SERVE</h2>
            <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Built for <em className="font-light italic text-blue-600">People Like You</em>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Whether it's your first application or your fifth, we're here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "International Students",
                question: "Should I switch to PGWP now or wait?",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Spousal Applicants",
                question: "Are my relationship docs strong enough?",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Workers",
                question: "Can I apply for PR under Express Entry yet?",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Families & Sponsors",
                question: "How do I bring my parents here safely?",
              },
            ].map((persona, index) => (
              <Card
                key={index}
                className="bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-4">{persona.title}</h3>
                  <p className="text-gray-600 italic font-light">"{persona.question}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* RCICs You Can Trust Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR EXPERTS</h2>
            <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-8">
              <em className="font-light italic text-blue-600">RCICs</em> You Can Trust
            </h3>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light">
              Our consultants are all licensed members of the College of Immigration and Citizenship Consultants (CICC).
              They bring years of practical experience and a client-first mindset. You'll see their license number,
              specialty areas, languages spoken, and availability right on their profile.
            </p>
            <Button
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Meet Our RCICs
            </Button>
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-sm text-gray-800 font-light mb-4 uppercase tracking-wide">OUR PROMISE</h2>
            <h3 className="text-4xl md:text-5xl font-light text-gray-900 mb-8">
              Safe. Private. <em className="font-light italic text-blue-600">On Your Terms.</em>
            </h3>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-light">
              We built this platform to protect your trust, your data, and your time. Your bookings are confidential.
              Your documents are secure. And you never pay for more than you use.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Secure & Private",
                  description: "Your data is encrypted and protected",
                  color: "from-gray-500 to-gray-600",
                },
                {
                  icon: <CheckCircle className="h-8 w-8" />,
                  title: "Licensed Experts",
                  description: "All consultants are CICC verified",
                  color: "from-gray-500 to-gray-600",
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Client-First",
                  description: "Your success is our priority",
                  color: "from-gray-500 to-gray-600",
                },
              ].map((promise, index) => (
                <div key={index} className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${promise.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                    {promise.icon}
                  </div>
                  <h3 className="text-xl font-light text-gray-900 mb-2">{promise.title}</h3>
                  <p className="text-gray-600 font-light">{promise.description}</p>
                </div>
              ))}
            </div>

            <Button
              className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
            The easiest way to get licensed Canadian immigration help—no stress, no surprises.
          </p>
        </div>
      </section>
    </div>
  )
}
