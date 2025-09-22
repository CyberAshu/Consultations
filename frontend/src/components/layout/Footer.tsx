import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../shared/Button'
import { newsletterService } from '../../services'

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      setIsSubscribing(true)
      const response = await newsletterService.subscribe({ email })
      setSubscriptionMessage(response.message)
      if (response.status === 'subscribed') {
        setEmail('')
      }
    } catch (error: any) {
      setSubscriptionMessage(error.message || 'Subscription failed. Please try again.')
    } finally {
      setIsSubscribing(false)
      setTimeout(() => setSubscriptionMessage(''), 5000)
    }
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        {/* Newsletter Section */}
        <div className="bg-white rounded-lg p-8 mb-12 border border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-light text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Get the latest immigration news, tips, and updates delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isSubscribing}
                required
              />
              <Button
                type="submit"
                disabled={isSubscribing || !email.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
              >
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            {subscriptionMessage && (
              <p className={`mt-4 text-sm ${
                subscriptionMessage.includes('success') || subscriptionMessage.includes('subscribed') 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {subscriptionMessage}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IW</span>
              </div>
              <span className="font-bold text-xl text-gray-800">ImmigWise</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed">
              The easiest way to get licensed Canadian immigration help—no stress, no surprises.
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Services</h3>
            <ul className="space-y-3">
              <li><Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">General Consultations</Link></li>
              <li><Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Document Review</Link></li>
              <li><Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Form Filling Assistance</Link></li>
              <li><Link to="/services" className="text-gray-600 hover:text-blue-600 transition-colors">Program-Specific Help</Link></li>
            </ul>
          </div>

          {/* About Us Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">About Us</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">Our Story</Link></li>
              <li><Link to="/become-partner" className="text-gray-600 hover:text-blue-600 transition-colors">Become a Partner</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support & Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQs</Link></li>
              <li><a href="mailto:info@immigwise.com" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
              <li><Link to="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

        </div>

        <hr className="my-8 border-gray-300" />

        <div className="text-center">
<p className="text-sm text-gray-600">&copy; 2025 ImmigWise. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 max-w-3xl mx-auto">
            Disclaimer: This platform is not a law firm and does not offer legal advice or representation. All
            immigration consultations are conducted by independently contracted, licensed RCICs
            (Regulated Canadian Immigration Consultants). No consultant-client relationship is formed with
            the platform itself. Official IRCC forms and instructions are available free at{' '}
            <a 
              href="https://www.canada.ca" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              www.canada.ca
            </a>.
            Use of this site is subject to our{' '}
            <Link to="/terms-of-use" className="text-blue-600 hover:text-blue-800 underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </footer>
  )
}
