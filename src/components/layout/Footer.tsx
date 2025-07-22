import React from 'react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Main footer content */}
        <div className="text-center space-y-4">
          <p className="text-gray-600 text-sm">
            &copy; 2024 ImmigrationConnect. All rights reserved.
          </p>
          
          {/* Links */}
          <div className="flex justify-center space-x-6 text-sm">
            <a 
              href="/terms-of-use" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              Terms and Conditions
            </a>
            <span className="text-gray-400">|</span>
            <a 
              href="/privacy-policy" 
              className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              Privacy Policy
            </a>
          </div>
          
          {/* Disclaimer */}
          <div className="text-xs text-gray-500 max-w-4xl mx-auto leading-relaxed">
            <p>
              ImmigrationConnect is not a law firm and does not provide legal advice. We are a platform that connects clients with licensed Regulated Canadian Immigration Consultants (RCICs). All immigration advice is provided by licensed RCICs through our platform.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
