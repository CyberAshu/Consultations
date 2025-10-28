import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../../components/common/Button'
import { CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { authService } from '../../../api/services/auth.service'
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    try {
      const response = await authService.login({ email, password })
      
      // authService.login already handles storing user data and tokens
      
      // Check for stored redirect URL
      const redirectAfterLogin = localStorage.getItem('redirectAfterLogin')
      
      if (redirectAfterLogin) {
        // Clear the stored redirect URL
        localStorage.removeItem('redirectAfterLogin')
        // Redirect to the stored page
        navigate(redirectAfterLogin)
      } else {
        // Default redirect based on role
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
      }
    } catch (err: any) {
      const message = err?.message || ''
      // Show a clearer message when email isn't confirmed yet
      if (message.toLowerCase().includes('email') && message.toLowerCase().includes('confirm')) {
        setError('Please confirm your email to continue.')
        setInfo('Didn\'t get the email? You can resend the verification link below.')
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your immigration consultation dashboard
          </p>
        </div>

        {/* Login Form */}
        <CardContent>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
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
              {info && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">{info}</p>
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
  
              <div className="flex items-center justify-between mb-6">
                <div></div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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
              {error && info && (
                <div className="mt-4 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setLoading(true)
                        setError('')
                        const res = await authService.resendConfirmation(email)
                        setInfo(res?.message || 'Verification email sent.')
                      } catch (e: any) {
                        setError(e?.message || 'Failed to resend verification email')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Resend verification email
                  </button>
                </div>
              )}
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Create one</Link>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secured by advanced encryption protocols
          </p>
        </div>
      </div>
    </div>
  )
}
