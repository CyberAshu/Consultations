import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../shared/Button'

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IC</span>
              </div>
              <span className="font-bold text-xl text-gray-800">ImmigrationConnect</span>
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
              <li><Link to="/become-consultant" className="text-gray-600 hover:text-blue-600 transition-colors">Become a Consultant</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support & Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQs</Link></li>
              <li><a href="mailto:support@immigrationconnect.com" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
              <li><Link to="/privacy-policy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-use" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>

        </div>

        <hr className="my-8 border-gray-300" />

        <div className="text-center">
          <p className="text-sm text-gray-600">&copy; 2024 ImmigrationConnect. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2 max-w-3xl mx-auto">
            Disclaimer: ImmigrationConnect is not a law firm. We are a technology platform that connects users with independent, licensed Regulated Canadian Immigration Consultants (RCICs) who provide immigration services.
          </p>
        </div>
      </div>
    </footer>
  )
}
