import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../../../components/common/Button'
import { CardContent } from '../../../components/common/Card'
import { Input } from '../../../components/common/Input'
import { authService } from '../../../api/services/auth.service'
import { Mail, Lock, User as UserIcon, AlertCircle, UserPlus } from 'lucide-react'

export function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      setLoading(true)
      // Default role as client
      const response = await authService.register({ email, password, full_name: fullName, role: 'client' })
      // If email confirmations are enabled, session will be null until user verifies
      if (!response.session) {
        setInfo('Account created. Please check your email to verify your account before signing in.')
        return
      }
      // Redirect based on role when session exists
      switch (response.user.role) {
        case 'admin':
          navigate('/admin-dashboard')
          break
        case 'rcic':
          navigate('/rcic-dashboard')
          break
        case 'client':
        default:
          navigate('/client-dashboard')
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Create Your Account</h2>
          <p className="mt-2 text-sm text-gray-600">Join thousands of clients who trust us with their immigration journey</p>
        </div>

        <CardContent>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <form onSubmit={handleRegister} className="space-y-6">
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
                  <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Jane Doe"
                    />
                    <UserIcon className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
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
                      placeholder="you@example.com"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Create a strong password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      name="confirm_password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 h-12 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Re-enter your password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create account
                  </div>
                )}
              </Button>

              {info && (
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
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Resend verification email
                  </button>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Sign in</Link>
              </div>
            </form>
          </div>
        </CardContent>
      </div>
    </div>
  )
}


