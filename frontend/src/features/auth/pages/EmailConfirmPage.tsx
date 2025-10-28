import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/common/Button'
import { CheckCircle } from 'lucide-react'

export function EmailConfirm() {
  const navigate = useNavigate()

  useEffect(() => {
    // Optional: clean up URL by removing tokens from hash for aesthetics
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    // Auto-redirect to login after a short delay
    const timer = setTimeout(() => navigate('/login', { replace: true }), 3000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/40 to-cyan-50/40 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h1>
          <p className="text-gray-600 mb-6">Your email has been successfully confirmed. You can now sign in to your account.</p>
          <Button
            className="w-full bg-black hover:bg-gray-800 text-white py-3"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </div>
      </div>
    </div>
  )
}


