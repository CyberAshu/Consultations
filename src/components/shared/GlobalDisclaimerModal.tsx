import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface GlobalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalDisclaimerModal({ isOpen, onClose }: GlobalDisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Website Disclaimer
        </h2>
        
        <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
          <p>
            This platform is not a law firm, and nothing on this website — including consultations, guides, or
            other materials — should be considered legal advice. We do not provide legal representation or
            prepare immigration applications on your behalf.
          </p>
          
          <p>
            All consultations are conducted by independently contracted Regulated Canadian Immigration
            Consultants (RCICs) who are licensed by the College of Immigration and Citizenship
            Consultants (CICC). Your use of this platform does not establish a client-consultant or
            lawyer-client relationship with us. Any legal advice you receive is solely between you and the
            RCIC you consult with, and may be subject to a separate agreement.
          </p>
          
          <p>
            Immigration forms and application instructions are available for free directly from Immigration,
            Refugees and Citizenship Canada (IRCC) at{' '}
            <a 
              href="https://www.canada.ca" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              www.canada.ca
            </a>.
          </p>
          
          <p>
            By using this platform, you agree to our{' '}
            <Link to="/terms-of-use" className="text-blue-600 hover:text-blue-800 underline">
              Terms of Use
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </Link>. While we take every measure to verify our consultants and protect your data, we do not guarantee immigration outcomes.
          </p>
          
          <p>
            If you require full legal representation or assistance submitting your application, we recommend
            entering into a formal agreement with a licensed professional outside this platform.
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white px-8"
          >
            I Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}

// Hook to manage global disclaimer modal state
export function useGlobalDisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('disclaimerAccepted');
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('disclaimerAccepted', 'true');
    setIsOpen(false);
  };

  return { isOpen, handleClose };
}
