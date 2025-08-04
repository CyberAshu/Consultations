import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../shared/Button'
import { GlassCard, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Input } from '../ui/Input'
import { authService } from '../../services/authService'
import { Mail, Lock, AlertCircle, LogIn, Eye, EyeOff, Shield } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authService.login({ email, password })
      
      // authService.login already handles storing user data and tokens
      // Redirect based on role
      switch (response.user.role) {
        case 'admin':
          navigate('/admin-dashboard')
          break
        case 'client':
          navigate('/client-dashboard')
          break
        case 'rcic':
          navigate('/rcic-dashboard')
          break
        default:
          navigate('/')
      }
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Professional background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://player.vimeo.com/external/421045659.sd.mp4?s=7a1d2b8b4f5f9a7c0d5e8f2b3c4d6a9e1b3c7f8d&profile_id=164" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gray-900/40 z-10"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-black p-3 rounded-full shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white font-gale">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-300 font-gale-light">
            Access your personalized immigration consultation dashboard
          </p>
        </div>

        {/* Login Form */}
        <CardContent>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
  
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 font-bricolage">
                    Email
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your email address"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>
  
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 font-bricolage">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              </div>
  
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>
  
          </div>
        </CardContent>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-white/60">
            This login is backed by advanced security protocols
          </p>
        </div>
      </div>
    </div>
  )
}
